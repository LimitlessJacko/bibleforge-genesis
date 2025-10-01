// Phaser Fighting Game Engine - Complete 2D Fighting Game
import Phaser from 'phaser';
import { fightingEngine, type Character as EngineCharacter, type CharacterState } from './fighting-engine';

export interface FighterConfig {
  name: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  jumpPower: number;
  spriteKey: string;
  alignment: 'Good' | 'Evil';
}

// Animation state machine types
type AnimState = 'idle' | 'walk' | 'jump' | 'land' | 'light_attack' | 'heavy_attack' | 'special' | 'block' | 'hit' | 'crouch';

interface AnimationFrame {
  duration: number;
  hitboxActive?: boolean;
  moveSpeed?: number;
  invincible?: boolean;
}

export class FighterSprite extends Phaser.Physics.Arcade.Sprite {
  public fighterName: string;
  public engineChar: EngineCharacter;
  public isPlayer: boolean;
  public facing: 1 | -1 = 1;
  public attackBox: Phaser.GameObjects.Rectangle;
  public healthBar: Phaser.GameObjects.Graphics;
  public meterBar: Phaser.GameObjects.Graphics;
  public comboText: Phaser.GameObjects.Text;
  public isAttacking = false;
  public attackCooldown = 0;
  public hitboxActive = false;
  public inputBuffer: string[] = [];
  private lastInputTime = 0;
  
  // Sakuga-style animation state machine
  public animState: AnimState = 'idle';
  public animFrame = 0;
  public animFrameTimer = 0;
  private animationFrames: Record<AnimState, AnimationFrame[]> = {
    idle: [{ duration: 100 }],
    walk: [{ duration: 100 }],
    jump: [{ duration: 150 }],
    land: [{ duration: 100 }],
    light_attack: [
      { duration: 50 }, // startup
      { duration: 100, hitboxActive: true, moveSpeed: 150 }, // active
      { duration: 150 } // recovery
    ],
    heavy_attack: [
      { duration: 100 }, // startup
      { duration: 150, hitboxActive: true, moveSpeed: 250 }, // active
      { duration: 250 } // recovery
    ],
    special: [
      { duration: 100 },
      { duration: 200, hitboxActive: true, invincible: true },
      { duration: 300 }
    ],
    block: [{ duration: 50 }],
    hit: [{ duration: 100 }, { duration: 200 }],
    crouch: [{ duration: 100 }]
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: FighterConfig,
    isPlayer: boolean
  ) {
    super(scene, x, y, 'character');
    
    // Create visual representation
    const color = config.alignment === 'Good' ? 0x4169e1 : 0xdc143c;
    const graphics = scene.add.graphics();
    
    // Draw detailed character
    graphics.fillStyle(color);
    graphics.fillRoundedRect(-30, -60, 60, 120, 10);
    graphics.fillStyle(0xffc9a3);
    graphics.fillCircle(0, -70, 25);
    graphics.fillStyle(color);
    graphics.fillRoundedRect(-45, -40, 15, 60, 5);
    graphics.fillRoundedRect(30, -40, 15, 60, 5);
    graphics.fillRoundedRect(-25, 40, 20, 50, 5);
    graphics.fillRoundedRect(5, 40, 20, 50, 5);
    graphics.lineStyle(3, 0xffffff, 0.5);
    graphics.strokeRoundedRect(-30, -60, 60, 120, 10);
    
    graphics.generateTexture('character-' + config.name, 100, 150);
    graphics.destroy();
    
    this.setTexture('character-' + config.name);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.fighterName = config.name;
    this.isPlayer = isPlayer;
    
    this.engineChar = {
      ...fightingEngine.createCharacter({
        health: config.health,
        attack: config.attack,
        defense: config.defense
      }),
      frameData: fightingEngine.getDefaultFrameData(),
      position: { x, y },
      facing: isPlayer ? "right" : "left"
    };

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setDragX(500);
    body.setMaxVelocity(400, 800);
    body.setSize(60, 120);
    this.setScale(1);

    this.attackBox = scene.add.rectangle(x, y, 80, 100, 0xff0000, 0);
    scene.physics.add.existing(this.attackBox);

    this.healthBar = scene.add.graphics();
    this.meterBar = scene.add.graphics();
    
    this.comboText = scene.add.text(x, y - 150, '', {
      fontSize: '48px',
      color: '#ffaa00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);
  }

  updateHealthBar(x: number, y: number, width: number) {
    this.healthBar.clear();
    const healthPercent = Math.max(0, this.engineChar.health / 100);
    const healthColor = healthPercent > 0.5 ? 0xffeb3b : healthPercent > 0.25 ? 0xff9800 : 0xff0000;
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x, y, width * healthPercent, 20);
  }

  updateMeterBar(x: number, y: number, width: number) {
    this.meterBar.clear();
    const meterPercent = Math.max(0, Math.min(1, this.engineChar.meter / 100));
    this.meterBar.fillStyle(0x00ddff);
    this.meterBar.fillRect(x, y, width * meterPercent, 12);
  }

  addInput(input: string) {
    const now = Date.now();
    if (now - this.lastInputTime < 500) {
      this.inputBuffer.push(input);
      if (this.inputBuffer.length > 5) this.inputBuffer.shift();
    } else {
      this.inputBuffer = [input];
    }
    this.lastInputTime = now;
  }

  changeState(newState: AnimState) {
    if (this.animState === newState) return;
    this.animState = newState;
    this.animFrame = 0;
    this.animFrameTimer = 0;
  }

  updateAnimation(delta: number) {
    const currentAnim = this.animationFrames[this.animState];
    if (!currentAnim || this.animFrame >= currentAnim.length) {
      // Animation finished, return to idle
      if (this.animState !== 'idle' && this.animState !== 'walk') {
        this.changeState('idle');
        this.isAttacking = false;
        this.hitboxActive = false;
      }
      return;
    }

    const currentFrame = currentAnim[this.animFrame];
    this.animFrameTimer += delta;

    // Update hitbox state from frame data
    this.hitboxActive = currentFrame.hitboxActive || false;

    // Apply frame-based movement
    if (currentFrame.moveSpeed && this.isAttacking) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.facing * currentFrame.moveSpeed);
    }

    // Apply visual effects based on frame
    if (currentFrame.hitboxActive) {
      this.setTint(0xff6600);
    } else if (currentFrame.invincible) {
      this.setAlpha(0.5);
    } else {
      this.clearTint();
      this.setAlpha(1);
    }

    // Advance to next frame
    if (this.animFrameTimer >= currentFrame.duration) {
      this.animFrame++;
      this.animFrameTimer = 0;
    }
  }

  lightAttack() {
    if (this.isAttacking || this.animState === 'hit') return;
    
    this.changeState('light_attack');
    this.isAttacking = true;
    this.attackCooldown = 20;
  }

  heavyAttack() {
    if (this.isAttacking || this.animState === 'hit') return;
    
    this.changeState('heavy_attack');
    this.isAttacking = true;
    this.attackCooldown = 40;
  }

  specialMove(type: string) {
    if (this.engineChar.meter < 25 || this.isAttacking) return;
    
    this.engineChar.meter -= 25;
    this.changeState('special');
    this.isAttacking = true;
    
    // Create projectile on active frame
    this.scene.time.delayedCall(100, () => this.createProjectile());
  }

  createProjectile() {
    const projectile = this.scene.add.circle(
      this.x + (this.facing * 50),
      this.y,
      15,
      0x00ffff
    );
    this.scene.physics.add.existing(projectile);
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.facing * 400);
    this.scene.time.delayedCall(2000, () => projectile.destroy());
  }

  block() {
    if (!this.isAttacking && this.animState !== 'hit') {
      this.changeState('block');
      this.engineChar.state = 'blocking';
      this.setAlpha(0.7);
    }
  }

  stopBlock() {
    if (this.engineChar.state === 'blocking') {
      this.changeState('idle');
      this.engineChar.state = 'idle';
      this.setAlpha(1);
    }
  }

  takeDamage(damage: number, knockback: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.engineChar.health = Math.max(0, this.engineChar.health - damage);
    this.changeState('hit');
    this.engineChar.state = 'hit_stun';
    this.isAttacking = false;
    
    body.setVelocityX(knockback * -this.facing);
    body.setVelocityY(-100);
    
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => this.clearTint());
    this.scene.time.delayedCall(400, () => {
      if (this.engineChar.state === 'hit_stun') {
        this.changeState('idle');
        this.engineChar.state = 'idle';
      }
    });
  }

  update(delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.attackBox.setPosition(this.x + (this.facing * 50), this.y);
    this.comboText.setPosition(this.x, this.y - 150);
    
    // Update animation state machine
    this.updateAnimation(delta);
    
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    if (body.touching.down) {
      this.engineChar.inAir = false;
      if (this.animState === 'jump') {
        this.changeState('land');
        this.scene.time.delayedCall(100, () => {
          if (this.animState === 'land') this.changeState('idle');
        });
      }
    } else {
      this.engineChar.inAir = true;
    }
  }
}

export class FightingGameScene extends Phaser.Scene {
  private player!: FighterSprite;
  private opponent!: FighterSprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    J: Phaser.Input.Keyboard.Key;
    K: Phaser.Input.Keyboard.Key;
    L: Phaser.Input.Keyboard.Key;
  };
  private gameOver = false;
  private onGameEnd?: (playerWon: boolean) => void;
  private playerConfig!: FighterConfig;
  private opponentConfig!: FighterConfig;
  private arenaKey!: string;

  constructor() {
    super({ key: 'FightingGameScene' });
  }

  init(data: {
    playerConfig: FighterConfig;
    opponentConfig: FighterConfig;
    arenaKey: string;
    onGameEnd?: (playerWon: boolean) => void;
  }) {
    if (data.playerConfig && data.opponentConfig && data.arenaKey) {
      this.playerConfig = data.playerConfig;
      this.opponentConfig = data.opponentConfig;
      this.arenaKey = data.arenaKey;
      this.onGameEnd = data.onGameEnd;
      this.gameOver = false;
    }
  }

  preload() {
    // Graphics only - no image loading needed
  }

  create() {
    if (!this.playerConfig || !this.opponentConfig) return;
    
    // Epic background
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x4a2a5a, 0x4a2a5a, 0x1a0a2a, 0x1a0a2a, 1);
    bgGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Ornate golden frame at top
    const frameGraphics = this.add.graphics();
    frameGraphics.fillStyle(0x1a1a1a, 0.8);
    frameGraphics.fillRect(0, 0, this.scale.width, 150);
    frameGraphics.lineStyle(8, 0xd4af37);
    frameGraphics.strokeRect(10, 10, this.scale.width - 20, 130);
    frameGraphics.lineStyle(4, 0xffeb3b);
    frameGraphics.strokeRect(20, 20, this.scale.width - 40, 110);
    
    // Character portraits (circles)
    frameGraphics.fillStyle(0xd4af37);
    frameGraphics.fillCircle(80, 70, 50);
    frameGraphics.lineStyle(6, 0xffeb3b);
    frameGraphics.strokeCircle(80, 70, 50);
    frameGraphics.fillCircle(this.scale.width - 80, 70, 50);
    frameGraphics.strokeCircle(this.scale.width - 80, 70, 50);
    
    // Character names
    this.add.text(150, 30, this.playerConfig.name.toUpperCase(), {
      fontSize: '28px',
      color: '#d4af37',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    });
    
    this.add.text(this.scale.width - 150, 30, this.opponentConfig.name.toUpperCase(), {
      fontSize: '28px',
      color: '#d4af37',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(1, 0);
    
    // Timer
    const timerBg = this.add.circle(this.scale.width / 2, 70, 45, 0x1a1a1a);
    const timerRing = this.add.circle(this.scale.width / 2, 70, 45);
    timerRing.setStrokeStyle(6, 0xd4af37);
    this.add.text(this.scale.width / 2, 70, '00', {
      fontSize: '42px',
      color: '#d4af37',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Health bar backgrounds
    const p1HealthBg = this.add.rectangle(150, 60, 350, 22, 0x1a1a1a);
    const p2HealthBg = this.add.rectangle(this.scale.width - 150, 60, 350, 22, 0x1a1a1a).setOrigin(1, 0.5);
    
    // Health bar borders  
    const p1HealthBorder = this.add.rectangle(150, 60, 350, 22);
    p1HealthBorder.setStrokeStyle(3, 0xd4af37);
    const p2HealthBorder = this.add.rectangle(this.scale.width - 150, 60, 350, 22);
    p2HealthBorder.setStrokeStyle(3, 0xd4af37).setOrigin(1, 0.5);
    
    // Meter bars
    const p1MeterBg = this.add.rectangle(150, 85, 350, 14, 0x1a1a1a);
    const p2MeterBg = this.add.rectangle(this.scale.width - 150, 85, 350, 14, 0x1a1a1a).setOrigin(1, 0.5);
    
    const p1MeterBorder = this.add.rectangle(150, 85, 350, 14);
    p1MeterBorder.setStrokeStyle(2, 0x00ddff);
    const p2MeterBorder = this.add.rectangle(this.scale.width - 150, 85, 350, 14);
    p2MeterBorder.setStrokeStyle(2, 0x00ddff).setOrigin(1, 0.5);
    
    // Ground platform
    const ground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 50,
      this.scale.width,
      100,
      0x6b5d4f
    );
    this.physics.add.existing(ground, true);

    // Create fighters
    this.player = new FighterSprite(this, 200, 400, this.playerConfig, true);
    this.opponent = new FighterSprite(this, this.scale.width - 200, 400, this.opponentConfig, false);
    this.opponent.facing = -1;
    this.opponent.setFlipX(true);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      J: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      K: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      L: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.L),
    };

    // Collisions
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.opponent, ground);
    this.physics.add.overlap(this.player.attackBox, this.opponent, () => {
      if (this.player.hitboxActive && !this.opponent.isAttacking) {
        this.opponent.takeDamage(10, 200);
        this.player.engineChar.comboCount++;
        this.player.comboText.setText(`${this.player.engineChar.comboCount} HIT COMBO!`);
        this.player.comboText.setVisible(true);
      }
    });
    this.physics.add.overlap(this.opponent.attackBox, this.player, () => {
      if (this.opponent.hitboxActive && !this.player.isAttacking) {
        this.player.takeDamage(10, 200);
        this.opponent.engineChar.comboCount++;
      }
    });

    // "FIGHT!" text
    const roundText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'FIGHT!', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: roundText,
      scale: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => roundText.destroy()
    });
  }

  update(time: number, delta: number) {
    if (this.gameOver) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Only allow movement if not in attacking state
    if (!this.player.isAttacking && this.player.animState !== 'hit') {
      if (this.cursors.left.isDown) {
        playerBody.setVelocityX(-200);
        this.player.facing = -1;
        this.player.setFlipX(true);
        if (playerBody.touching.down && this.player.animState !== 'walk') {
          this.player.changeState('walk');
        }
      } else if (this.cursors.right.isDown) {
        playerBody.setVelocityX(200);
        this.player.facing = 1;
        this.player.setFlipX(false);
        if (playerBody.touching.down && this.player.animState !== 'walk') {
          this.player.changeState('walk');
        }
      } else {
        playerBody.setVelocityX(0);
        if (playerBody.touching.down && this.player.animState === 'walk') {
          this.player.changeState('idle');
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      if (playerBody.touching.down && !this.player.isAttacking) {
        playerBody.setVelocityY(-500);
        this.player.changeState('jump');
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      this.player.lightAttack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
      this.player.heavyAttack();
    }
    if (this.keys.L.isDown) {
      this.player.block();
    } else {
      this.player.stopBlock();
    }

    // Simple AI
    const distance = Math.abs(this.player.x - this.opponent.x);
    const opponentBody = this.opponent.body as Phaser.Physics.Arcade.Body;
    
    if (distance > 100) {
      if (this.opponent.x < this.player.x) {
        opponentBody.setVelocityX(150);
      } else {
        opponentBody.setVelocityX(-150);
      }
    } else {
      opponentBody.setVelocityX(0);
      if (Math.random() < 0.02) {
        this.opponent.lightAttack();
      }
    }

    // Update fighters with delta time for smooth animations
    this.player.update(delta);
    this.opponent.update(delta);
    
    // Update UI
    this.player.updateHealthBar(150, 50, 350);
    this.player.updateMeterBar(150, 75, 350);
    this.opponent.updateHealthBar(this.scale.width - 500, 50, 350);
    this.opponent.updateMeterBar(this.scale.width - 500, 75, 350);

    // Win condition
    if (this.player.engineChar.health <= 0 || this.opponent.engineChar.health <= 0) {
      this.endGame(this.player.engineChar.health > 0);
    }
  }

  endGame(playerWon: boolean) {
    this.gameOver = true;
    const winText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      playerWon ? 'YOU WIN!' : 'YOU LOSE!',
      {
        fontSize: '72px',
        color: playerWon ? '#00ff00' : '#ff0000',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 10
      }
    ).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      if (this.onGameEnd) {
        this.onGameEnd(playerWon);
      }
    });
  }
}
