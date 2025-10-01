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

export class FighterSprite extends Phaser.Physics.Matter.Sprite {
  public fighterName: string;
  public engineChar: EngineCharacter;
  public isPlayer: boolean;
  public facing: 1 | -1 = 1; // 1 = right, -1 = left
  public attackBox: Phaser.GameObjects.Rectangle;
  public healthBar: Phaser.GameObjects.Graphics;
  public meterBar: Phaser.GameObjects.Graphics;
  public comboText: Phaser.GameObjects.Text;
  public isAttacking = false;
  public attackCooldown = 0;
  public hitboxActive = false;
  public inputBuffer: string[] = [];
  private lastInputTime = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: FighterConfig,
    isPlayer: boolean
  ) {
    super(scene.matter.world, x, y, config.spriteKey);
    
    this.fighterName = config.name;
    this.isPlayer = isPlayer;
    
    // Initialize engine character
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

    // Physics setup
    this.setFixedRotation();
    this.setFriction(0.1);
    this.setFrictionAir(0.01);
    this.setBounce(0);
    this.setScale(2);

    // Attack hitbox (invisible)
    this.attackBox = scene.add.rectangle(x, y, 60, 80, 0xff0000, 0);
    scene.physics.add.existing(this.attackBox);
    
    // UI elements
    const barY = isPlayer ? 30 : 30;
    const barX = isPlayer ? 50 : scene.scale.width - 250;
    
    this.healthBar = scene.add.graphics();
    this.meterBar = scene.add.graphics();
    this.updateHealthBar(barX, barY);
    this.updateMeterBar(barX, barY + 25);
    
    this.comboText = scene.add.text(x, y - 100, '', {
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    scene.add.existing(this);
  }

  updateHealthBar(x: number, y: number) {
    this.healthBar.clear();
    const healthPercent = Math.max(0, this.engineChar.health / 100);
    
    // Background
    this.healthBar.fillStyle(0x000000, 0.7);
    this.healthBar.fillRect(x, y, 200, 20);
    
    // Health bar
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x + 2, y + 2, (200 - 4) * healthPercent, 16);
  }

  updateMeterBar(x: number, y: number) {
    this.meterBar.clear();
    const meterPercent = this.engineChar.meter / 100;
    
    // Background
    this.meterBar.fillStyle(0x000000, 0.7);
    this.meterBar.fillRect(x, y, 200, 10);
    
    // Meter bar
    this.meterBar.fillStyle(0x00ffff);
    this.meterBar.fillRect(x + 2, y + 2, (200 - 4) * meterPercent, 6);
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

  checkSpecialInput(): string | null {
    const bufferStr = this.inputBuffer.join(',');
    
    // Quarter circle forward + attack (down, down-forward, forward, attack)
    if (bufferStr.includes('down,right,attack')) return 'hadouken';
    
    // Dragon punch (forward, down, down-forward, attack)
    if (bufferStr.includes('right,down,attack')) return 'shoryuken';
    
    return null;
  }

  lightAttack() {
    if (this.isAttacking || this.engineChar.state === 'hit_stun') return;
    
    this.addInput('attack');
    const special = this.checkSpecialInput();
    
    if (special) {
      this.specialMove(special);
      return;
    }

    this.isAttacking = true;
    this.attackCooldown = 300;
    this.engineChar.state = 'light_attack';
    this.engineChar.currentFrame = 0;
    
    // Animate attack
    this.scene.tweens.add({
      targets: this,
      scaleX: this.scale * 1.1,
      duration: 100,
      yoyo: true,
      onStart: () => {
        this.hitboxActive = true;
        this.updateAttackBox();
      },
      onComplete: () => {
        this.isAttacking = false;
        this.hitboxActive = false;
      }
    });
  }

  heavyAttack() {
    if (this.isAttacking || this.engineChar.state === 'hit_stun') return;
    
    this.isAttacking = true;
    this.attackCooldown = 600;
    this.engineChar.state = 'heavy_attack';
    this.engineChar.currentFrame = 0;
    
    // Wind-up animation
    this.scene.tweens.add({
      targets: this,
      scaleX: this.scale * 0.9,
      duration: 200,
      onComplete: () => {
        // Attack animation
        this.scene.tweens.add({
          targets: this,
          scaleX: this.scale * 1.3,
          x: this.x + (this.facing * 30),
          duration: 150,
          yoyo: true,
          onStart: () => {
            this.hitboxActive = true;
            this.updateAttackBox();
          },
          onComplete: () => {
            this.isAttacking = false;
            this.hitboxActive = false;
          }
        });
      }
    });
  }

  specialMove(type: string) {
    if (this.engineChar.meter < 30) return;
    
    this.engineChar.meter -= 30;
    this.isAttacking = true;
    this.attackCooldown = 800;
    this.engineChar.state = 'special_move';
    
    if (type === 'hadouken') {
      // Projectile special
      this.createProjectile();
    } else if (type === 'shoryuken') {
      // Rising uppercut
      this.setVelocityY(-15);
      this.hitboxActive = true;
    }
    
    setTimeout(() => {
      this.isAttacking = false;
      this.hitboxActive = false;
    }, 800);
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
    
    // Destroy after 2 seconds
    this.scene.time.delayedCall(2000, () => projectile.destroy());
  }

  block() {
    if (!this.isAttacking && this.engineChar.state !== 'hit_stun') {
      this.engineChar.state = 'blocking';
    }
  }

  stopBlock() {
    if (this.engineChar.state === 'blocking') {
      this.engineChar.state = 'idle';
    }
  }

  updateAttackBox() {
    const offsetX = this.facing * 40;
    this.attackBox.setPosition(this.x + offsetX, this.y);
    this.attackBox.setVisible(this.hitboxActive);
  }

  takeDamage(damage: number, knockback: number) {
    this.engineChar.health -= damage;
    
    // Knockback
    this.setVelocityX(knockback * -this.facing);
    
    // Hit flash
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => this.clearTint());
    
    // Combo text
    if (this.engineChar.comboCount > 1) {
      this.comboText.setText(`${this.engineChar.comboCount} HIT COMBO!`);
      this.scene.tweens.add({
        targets: this.comboText,
        scale: 1.5,
        alpha: 0,
        y: this.y - 120,
        duration: 1000,
        onComplete: () => {
          this.comboText.setText('');
          this.comboText.setScale(1).setAlpha(1);
        }
      });
    }
    
    // Update UI
    const barX = this.isPlayer ? 50 : this.scene.scale.width - 250;
    const barY = 30;
    this.updateHealthBar(barX, barY);
  }

  update() {
    // Update engine
    fightingEngine.updatePhysics(this.engineChar);
    fightingEngine.updateState(this.engineChar);
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= 16; // Assume 60fps
    }
    
    // Update UI
    const barX = this.isPlayer ? 50 : this.scene.scale.width - 250;
    const barY = 30;
    this.updateMeterBar(barX, barY + 25);
    
    // Update attack box
    this.updateAttackBox();
    
    // Update combo text position
    this.comboText.x = this.x;
    this.comboText.y = this.y - 100;
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
    // Load arena backgrounds
    // Character sprites will be loaded from React component
  }

  create() {
    // Skip if no config data
    if (!this.playerConfig || !this.opponentConfig) return;
    // Arena background
    const bg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x1a1a2e
    );

    // Ground
    const ground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 50,
      this.scale.width,
      100,
      0x2d4356
    );
    this.matter.add.gameObject(ground, { isStatic: true });

    // Create fighters
    this.player = new FighterSprite(
      this,
      200,
      400,
      this.playerConfig,
      true
    );

    this.opponent = new FighterSprite(
      this,
      this.scale.width - 200,
      400,
      this.opponentConfig,
      false
    );
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

    // Collision detection
    this.matter.world.on('collisionstart', (event: any) => {
      this.handleCollision(event);
    });

    // Round text
    const roundText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'FIGHT!',
      {
        fontSize: '64px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 8
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: roundText,
      scale: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => roundText.destroy()
    });
  }

  update() {
    if (this.gameOver) return;

    // Player controls
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-5);
      this.player.facing = -1;
      this.player.setFlipX(true);
      this.player.addInput('left');
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(5);
      this.player.facing = 1;
      this.player.setFlipX(false);
      this.player.addInput('right');
    } else {
      this.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      if (!this.player.engineChar.inAir) {
        this.player.setVelocityY(-12);
        this.player.engineChar.inAir = true;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.player.addInput('down');
    }

    // Attack controls
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
    this.updateAI();

    // Update fighters
    this.player.update();
    this.opponent.update();

    // Check win condition
    if (this.player.engineChar.health <= 0 || this.opponent.engineChar.health <= 0) {
      this.endGame(this.player.engineChar.health > 0);
    }
  }

  updateAI() {
    const distance = Math.abs(this.player.x - this.opponent.x);
    
    // Move towards player
    if (distance > 150) {
      if (this.player.x > this.opponent.x) {
        this.opponent.setVelocityX(3);
        this.opponent.facing = 1;
        this.opponent.setFlipX(false);
      } else {
        this.opponent.setVelocityX(-3);
        this.opponent.facing = -1;
        this.opponent.setFlipX(true);
      }
    } else {
      this.opponent.setVelocityX(0);
      
      // Attack randomly
      if (Math.random() > 0.98 && !this.opponent.isAttacking) {
        if (Math.random() > 0.6) {
          this.opponent.lightAttack();
        } else {
          this.opponent.heavyAttack();
        }
      }
    }
  }

  handleCollision(event: any) {
    // Check if player attack hits opponent
    if (this.player.hitboxActive) {
      const playerBox = this.player.attackBox.getBounds();
      const opponentBox = this.opponent.getBounds();
      
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBox, opponentBox)) {
        if (this.opponent.engineChar.state !== 'blocking') {
          const frameData = this.player.engineChar.frameData.get(this.player.engineChar.state);
          if (frameData) {
            this.opponent.takeDamage(frameData.damage, frameData.knockback);
            this.player.engineChar.comboCount++;
            this.player.engineChar.meter = Math.min(100, this.player.engineChar.meter + frameData.meterGain);
            this.player.hitboxActive = false;
          }
        }
      }
    }

    // Check if opponent attack hits player
    if (this.opponent.hitboxActive) {
      const opponentBox = this.opponent.attackBox.getBounds();
      const playerBox = this.player.getBounds();
      
      if (Phaser.Geom.Intersects.RectangleToRectangle(opponentBox, playerBox)) {
        if (this.player.engineChar.state !== 'blocking') {
          const frameData = this.opponent.engineChar.frameData.get(this.opponent.engineChar.state);
          if (frameData) {
            this.player.takeDamage(frameData.damage, frameData.knockback);
            this.opponent.engineChar.comboCount++;
            this.opponent.engineChar.meter = Math.min(100, this.opponent.engineChar.meter + frameData.meterGain);
            this.opponent.hitboxActive = false;
          }
        }
      }
    }
  }

  endGame(playerWon: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    const text = playerWon ? 'VICTORY!' : 'DEFEAT';
    const color = playerWon ? '#00ff00' : '#ff0000';
    
    const endText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      text,
      {
        fontSize: '72px',
        color: color,
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 10
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: endText,
      scale: 1.5,
      duration: 500,
      yoyo: true,
      repeat: 2
    });

    this.time.delayedCall(3000, () => {
      if (this.onGameEnd) {
        this.onGameEnd(playerWon);
      }
    });
  }
}
