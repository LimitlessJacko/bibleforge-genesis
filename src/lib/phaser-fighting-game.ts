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
  public superMoveName: string;
  public canCancelInto = false;
  public hitstunFrames = 0;
  public blockstunFrames = 0;
  
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
    isPlayer: boolean,
    superMoveName: string = "Divine Strike"
  ) {
    super(scene, x, y, 'character');
    
    // Create visual representation
    const color = config.alignment === 'Good' ? 0x4169e1 : 0xdc143c;
    const graphics = scene.add.graphics();
    
    // Draw detailed character with biblical styling
    graphics.fillStyle(color);
    graphics.fillRoundedRect(-30, -60, 60, 120, 10);
    graphics.fillStyle(0xffc9a3);
    graphics.fillCircle(0, -70, 25);
    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillCircle(-8, -72, 3);
    graphics.fillCircle(8, -72, 3);
    // Arms and legs
    graphics.fillStyle(color);
    graphics.fillRoundedRect(-45, -40, 15, 60, 5);
    graphics.fillRoundedRect(30, -40, 15, 60, 5);
    graphics.fillRoundedRect(-25, 40, 20, 50, 5);
    graphics.fillRoundedRect(5, 40, 20, 50, 5);
    // Highlight
    graphics.lineStyle(3, 0xffffff, 0.5);
    graphics.strokeRoundedRect(-30, -60, 60, 120, 10);
    
    graphics.generateTexture('character-' + config.name, 100, 150);
    graphics.destroy();
    
    this.setTexture('character-' + config.name);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.fighterName = config.name;
    this.isPlayer = isPlayer;
    this.superMoveName = superMoveName;
    
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
    if (this.hitstunFrames > 0 || this.blockstunFrames > 0) return;
    if (this.isAttacking && !this.canCancelInto) return;
    if (this.animState === 'hit') return;
    
    this.changeState('light_attack');
    this.isAttacking = true;
    this.attackCooldown = 20;
    this.canCancelInto = false;
    
    // Add cancel window after 3 frames
    this.scene.time.delayedCall(150, () => {
      if (this.animState === 'light_attack') {
        this.canCancelInto = true;
      }
    });
  }

  heavyAttack() {
    if (this.hitstunFrames > 0 || this.blockstunFrames > 0) return;
    if (this.isAttacking && !this.canCancelInto) return;
    if (this.animState === 'hit') return;
    
    this.changeState('heavy_attack');
    this.isAttacking = true;
    this.attackCooldown = 40;
    this.canCancelInto = false;
  }

  specialMove(type: string = 'projectile') {
    if (this.engineChar.meter < 25 || this.hitstunFrames > 0) return;
    if (this.isAttacking && !this.canCancelInto) return;
    
    this.engineChar.meter -= 25;
    this.changeState('special');
    this.isAttacking = true;
    this.canCancelInto = false;
    
    // Create projectile or effect based on character
    this.scene.time.delayedCall(100, () => {
      if (type === 'projectile') {
        this.createProjectile();
      } else {
        this.createAOEEffect();
      }
    });
  }

  superMove() {
    if (this.engineChar.meter < 100) return;
    
    this.engineChar.meter = 0;
    this.changeState('special');
    this.isAttacking = true;
    this.canCancelInto = false;
    
    // Create super effect
    this.scene.time.delayedCall(100, () => {
      this.createSuperEffect();
    });
    
    // Show super move name
    const superText = this.scene.add.text(
      this.x,
      this.y - 200,
      this.superMoveName.toUpperCase(),
      {
        fontSize: '36px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#ff0000',
        strokeThickness: 8
      }
    ).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: superText,
      scale: 1.5,
      alpha: 0,
      y: this.y - 250,
      duration: 2000,
      onComplete: () => superText.destroy()
    });
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
    
    // Add projectile trail effect
    this.scene.tweens.add({
      targets: projectile,
      alpha: 0.3,
      scale: 0.5,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
    
    this.scene.time.delayedCall(2000, () => projectile.destroy());
    (projectile as any).damage = 15;
    (projectile as any).owner = this;
  }

  createAOEEffect() {
    const aoe = this.scene.add.circle(
      this.x,
      this.y,
      10,
      0xffaa00,
      0.6
    );
    
    this.scene.tweens.add({
      targets: aoe,
      scale: 8,
      alpha: 0,
      duration: 500,
      onComplete: () => aoe.destroy()
    });
    
    (aoe as any).damage = 20;
    (aoe as any).owner = this;
  }

  createSuperEffect() {
    // Create multiple projectiles for super
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const projectile = this.scene.add.circle(
          this.x + (this.facing * 50),
          this.y + (i * 10 - 20),
          20,
          0xffff00
        );
        this.scene.physics.add.existing(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocityX(this.facing * 500);
        
        this.scene.tweens.add({
          targets: projectile,
          scale: 1.5,
          alpha: 0.5,
          duration: 150,
          yoyo: true,
          repeat: -1
        });
        
        this.scene.time.delayedCall(1500, () => projectile.destroy());
        (projectile as any).damage = 30;
        (projectile as any).owner = this;
      });
    }
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

  takeDamage(damage: number, knockback: number, isBlocked: boolean = false) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (isBlocked) {
      // Reduced damage and different effects when blocked
      damage *= 0.25;
      this.blockstunFrames = 15;
      this.setTint(0x8888ff);
      this.scene.time.delayedCall(250, () => {
        this.clearTint();
        this.blockstunFrames = 0;
      });
      
      // Show block effect
      const blockEffect = this.scene.add.circle(this.x, this.y, 50, 0x0088ff, 0.5);
      this.scene.tweens.add({
        targets: blockEffect,
        scale: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => blockEffect.destroy()
      });
    } else {
      // Normal hit
      this.hitstunFrames = Math.floor(damage * 2);
      this.changeState('hit');
      this.engineChar.state = 'hit_stun';
      this.isAttacking = false;
      this.canCancelInto = false;
      
      body.setVelocityX(knockback * -this.facing);
      body.setVelocityY(-100);
      
      // Hit flash effect
      this.setTint(0xffffff);
      this.scene.time.delayedCall(50, () => this.setTint(0xff0000));
      this.scene.time.delayedCall(100, () => this.clearTint());
      
      // Create hit spark
      const hitSpark = this.scene.add.circle(this.x, this.y, 20, 0xff6600, 0.8);
      this.scene.tweens.add({
        targets: hitSpark,
        scale: 2,
        alpha: 0,
        duration: 200,
        onComplete: () => hitSpark.destroy()
      });
      
      this.scene.time.delayedCall(400, () => {
        this.hitstunFrames = 0;
        if (this.engineChar.state === 'hit_stun') {
          this.changeState('idle');
          this.engineChar.state = 'idle';
        }
      });
    }
    
    this.engineChar.health = Math.max(0, this.engineChar.health - damage);
    
    // Show damage number
    const damageText = this.scene.add.text(this.x, this.y - 80, Math.floor(damage).toString(), {
      fontSize: '32px',
      color: isBlocked ? '#8888ff' : '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: damageText,
      y: this.y - 120,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
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
    
    if (this.hitstunFrames > 0) {
      this.hitstunFrames--;
    }
    
    if (this.blockstunFrames > 0) {
      this.blockstunFrames--;
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
    U: Phaser.Input.Keyboard.Key;
  };
  private gameOver = false;
  private onGameEnd?: (playerWon: boolean) => void;
  private playerConfig!: FighterConfig;
  private opponentConfig!: FighterConfig;
  private arenaKey!: string;
  private playerSuperMove!: string;
  private opponentSuperMove!: string;
  private boosterPickup?: Phaser.GameObjects.Sprite;
  private boosterTimer?: Phaser.Time.TimerEvent;
  private projectiles: Phaser.GameObjects.GameObject[] = [];
  private aiCooldown = 0;
  private aiAggressiveness = 0.5;

  constructor() {
    super({ key: 'FightingGameScene' });
  }

  init(data: {
    playerConfig: FighterConfig;
    opponentConfig: FighterConfig;
    arenaKey: string;
    playerSuperMove?: string;
    opponentSuperMove?: string;
    onGameEnd?: (playerWon: boolean) => void;
  }) {
    if (data.playerConfig && data.opponentConfig && data.arenaKey) {
      this.playerConfig = data.playerConfig;
      this.opponentConfig = data.opponentConfig;
      this.arenaKey = data.arenaKey;
      this.playerSuperMove = data.playerSuperMove || "Divine Strike";
      this.opponentSuperMove = data.opponentSuperMove || "Dark Punishment";
      this.onGameEnd = data.onGameEnd;
      this.gameOver = false;
      this.projectiles = [];
      this.aiCooldown = 0;
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

    // Create fighters with super move names
    this.player = new FighterSprite(this, 200, 400, this.playerConfig, true, this.playerSuperMove);
    this.opponent = new FighterSprite(this, this.scale.width - 200, 400, this.opponentConfig, false, this.opponentSuperMove);
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
      U: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U),
    };

    // Collisions
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.opponent, ground);
    this.physics.add.overlap(this.player.attackBox, this.opponent, () => {
      if (this.player.hitboxActive && this.opponent.hitstunFrames === 0) {
        const isBlocked = this.opponent.engineChar.state === 'blocking';
        const damage = isBlocked ? 3 : 10;
        this.opponent.takeDamage(damage, 200, isBlocked);
        
        if (!isBlocked) {
          this.player.engineChar.comboCount++;
          this.player.engineChar.meter = Math.min(100, this.player.engineChar.meter + 5);
          this.player.comboText.setText(`${this.player.engineChar.comboCount} HIT COMBO!`);
          this.player.comboText.setVisible(true);
        }
      }
    });
    this.physics.add.overlap(this.opponent.attackBox, this.player, () => {
      if (this.opponent.hitboxActive && this.player.hitstunFrames === 0) {
        const isBlocked = this.player.engineChar.state === 'blocking';
        const damage = isBlocked ? 3 : 10;
        this.player.takeDamage(damage, 200, isBlocked);
        
        if (!isBlocked) {
          this.opponent.engineChar.comboCount++;
          this.opponent.engineChar.meter = Math.min(100, this.opponent.engineChar.meter + 5);
        }
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

    // Start booster spawn timer (every 10-15 seconds)
    this.boosterTimer = this.time.addEvent({
      delay: Phaser.Math.Between(10000, 15000),
      callback: this.spawnBoosterPickup,
      callbackScope: this,
      loop: true
    });
  }

  spawnBoosterPickup() {
    if (this.boosterPickup || this.gameOver) return;

    const x = Phaser.Math.Between(200, this.scale.width - 200);
    const y = this.scale.height - 200;

    // Create glowing booster pickup
    const boosterGraphics = this.add.graphics();
    const boosterType = Math.random() > 0.5 ? 'spirit' : 'armor';
    const color = boosterType === 'spirit' ? 0x00ffff : 0xffd700;
    
    boosterGraphics.fillStyle(color, 0.8);
    boosterGraphics.fillCircle(0, 0, 25);
    boosterGraphics.lineStyle(4, 0xffffff);
    boosterGraphics.strokeCircle(0, 0, 25);
    boosterGraphics.generateTexture('booster-pickup', 50, 50);
    boosterGraphics.destroy();

    this.boosterPickup = this.add.sprite(x, y, 'booster-pickup');
    this.physics.add.existing(this.boosterPickup);
    (this.boosterPickup as any).boosterType = boosterType;

    // Pulse animation
    this.tweens.add({
      targets: this.boosterPickup,
      scale: 1.3,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Float effect
    this.tweens.add({
      targets: this.boosterPickup,
      y: y - 20,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add collision with fighters
    this.physics.add.overlap(this.player, this.boosterPickup, this.collectBooster, undefined, this);
    this.physics.add.overlap(this.opponent, this.boosterPickup, this.collectBooster, undefined, this);
  }

  collectBooster(fighter: any, booster: any) {
    if (!this.boosterPickup) return;

    const boosterType = (booster as any).boosterType;
    const collectorName = fighter === this.player ? this.playerConfig.name : this.opponentConfig.name;

    if (boosterType === 'spirit') {
      fighter.engineChar.meter = Math.min(100, fighter.engineChar.meter + 50);
      this.showBoosterText(`${collectorName} gained Spirit!`, fighter.x, fighter.y - 100, 0x00ffff);
    } else {
      fighter.engineChar.defense *= 1.5;
      this.showBoosterText(`${collectorName} gained Armor!`, fighter.x, fighter.y - 100, 0xffd700);
      
      // Remove armor boost after 8 seconds
      this.time.delayedCall(8000, () => {
        fighter.engineChar.defense /= 1.5;
      });
    }

    this.boosterPickup.destroy();
    this.boosterPickup = undefined;
  }

  showBoosterText(message: string, x: number, y: number, color: number) {
    const text = this.add.text(x, y, message, {
      fontSize: '32px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 2000,
      onComplete: () => text.destroy()
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.U)) {
      if (this.player.engineChar.meter >= 50) {
        this.player.specialMove('projectile');
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
      if (this.player.engineChar.meter >= 100) {
        this.player.superMove();
      }
    }
    if (this.keys.L.isDown) {
      this.player.block();
    } else {
      this.player.stopBlock();
    }

    // Enhanced AI
    this.updateAI(delta);
    
    // Handle projectile collisions
    this.projectiles = this.projectiles.filter(proj => {
      if (!proj || !(proj as any).active) return false;
      
      const owner = (proj as any).owner;
      const target = owner === this.player ? this.opponent : this.player;
      
      if (Phaser.Geom.Intersects.RectangleToRectangle(
        (proj as any).getBounds(),
        target.getBounds()
      )) {
        const damage = (proj as any).damage || 15;
        const isBlocked = target.engineChar.state === 'blocking';
        target.takeDamage(damage, 150, isBlocked);
        proj.destroy();
        return false;
      }
      
      return true;
    });

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

  updateAI(delta: number) {
    if (this.aiCooldown > 0) {
      this.aiCooldown -= delta;
      return;
    }
    
    const distance = Math.abs(this.player.x - this.opponent.x);
    const opponentBody = this.opponent.body as Phaser.Physics.Arcade.Body;
    const healthPercent = this.opponent.engineChar.health / 100;
    
    // AI becomes more aggressive when low on health
    this.aiAggressiveness = 0.3 + (1 - healthPercent) * 0.5;
    
    if (!this.opponent.isAttacking && this.opponent.hitstunFrames === 0) {
      // Movement AI
      if (distance > 150) {
        // Approach player
        if (this.opponent.x < this.player.x) {
          opponentBody.setVelocityX(180);
          this.opponent.facing = 1;
          this.opponent.setFlipX(false);
        } else {
          opponentBody.setVelocityX(-180);
          this.opponent.facing = -1;
          this.opponent.setFlipX(true);
        }
      } else if (distance < 80) {
        // Too close, back off or attack
        if (Math.random() < this.aiAggressiveness) {
          this.performAIAttack();
        } else {
          if (this.opponent.x < this.player.x) {
            opponentBody.setVelocityX(-120);
          } else {
            opponentBody.setVelocityX(120);
          }
        }
      } else {
        // Attack range
        opponentBody.setVelocityX(0);
        if (Math.random() < this.aiAggressiveness * 0.6) {
          this.performAIAttack();
        }
      }
      
      // Block if player is attacking nearby
      if (this.player.isAttacking && distance < 120 && Math.random() < 0.7) {
        this.opponent.block();
        this.time.delayedCall(300, () => {
          this.opponent.stopBlock();
        });
      }
    }
  }

  performAIAttack() {
    const meter = this.opponent.engineChar.meter;
    const rand = Math.random();
    
    if (meter >= 100 && rand < 0.15) {
      // Super move
      this.opponent.superMove();
      this.aiCooldown = 2000;
    } else if (meter >= 50 && rand < 0.25) {
      // Special move
      this.opponent.specialMove('projectile');
      this.aiCooldown = 1500;
    } else if (rand < 0.6) {
      // Light attack
      this.opponent.lightAttack();
      this.aiCooldown = 600;
    } else {
      // Heavy attack
      this.opponent.heavyAttack();
      this.aiCooldown = 1000;
    }
  }

  endGame(playerWon: boolean) {
    this.gameOver = true;
    
    // Clean up
    if (this.boosterTimer) {
      this.boosterTimer.remove();
    }
    if (this.boosterPickup) {
      this.boosterPickup.destroy();
    }
    this.projectiles.forEach(proj => proj.destroy());
    this.projectiles = [];
    
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
    
    // Victory animation
    this.tweens.add({
      targets: winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2
    });

    this.time.delayedCall(2000, () => {
      if (this.onGameEnd) {
        this.onGameEnd(playerWon);
      }
    });
  }
}
