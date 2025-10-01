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
  portraitUrl?: string;
}

export class FighterSprite extends Phaser.GameObjects.Container {
  public fighterName: string;
  public engineChar: EngineCharacter;
  public isPlayer: boolean;
  public facing: 1 | -1 = 1;
  public attackBox: Phaser.GameObjects.Rectangle;
  public healthBar: Phaser.GameObjects.Graphics;
  public meterBar: Phaser.GameObjects.Graphics;
  public superMeterBoxes: Phaser.GameObjects.Graphics;
  public comboText: Phaser.GameObjects.Text;
  public isAttacking = false;
  public attackCooldown = 0;
  public hitboxActive = false;
  public inputBuffer: string[] = [];
  private lastInputTime = 0;
  private body: Phaser.Physics.Arcade.Body;
  private sprite: Phaser.GameObjects.Graphics;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: FighterConfig,
    isPlayer: boolean
  ) {
    super(scene, x, y);
    
    this.fighterName = config.name;
    this.isPlayer = isPlayer;
    this.facing = isPlayer ? 1 : -1;
    
    // Create visual sprite - detailed character representation
    const color = config.alignment === 'Good' ? 0x4169e1 : 0xdc143c;
    const sprite = scene.add.graphics();
    
    // Draw character body
    sprite.fillStyle(color, 1);
    sprite.fillRoundedRect(-30, -60, 60, 120, 10);
    
    // Draw head
    sprite.fillStyle(0xffc9a3, 1);
    sprite.fillCircle(0, -70, 25);
    
    // Draw arms
    sprite.fillStyle(color, 1);
    sprite.fillRoundedRect(-45, -40, 15, 60, 5);
    sprite.fillRoundedRect(30, -40, 15, 60, 5);
    
    // Draw legs
    sprite.fillRoundedRect(-25, 40, 20, 50, 5);
    sprite.fillRoundedRect(5, 40, 20, 50, 5);
    
    // Add glow effect
    sprite.lineStyle(3, 0xffffff, 0.5);
    sprite.strokeRoundedRect(-30, -60, 60, 120, 10);
    
    this.sprite = sprite;
    this.add(sprite);
    
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

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body = this.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setDragX(500);
    this.body.setMaxVelocity(400, 800);
    this.body.setSize(60, 120);
    this.body.setOffset(-30, -60);

    // Attack hitbox
    this.attackBox = scene.add.rectangle(x, y, 80, 100, 0xff0000, 0);
    scene.physics.add.existing(this.attackBox);

    // UI elements - we'll update these from the scene
    this.healthBar = scene.add.graphics();
    this.meterBar = scene.add.graphics();
    this.superMeterBoxes = scene.add.graphics();
    
    this.comboText = scene.add.text(x, y - 150, '', {
      fontSize: '48px',
      color: '#ffaa00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(1000);
  }

  updateHealthBar(x: number, y: number, width: number) {
    this.healthBar.clear();
    const healthPercent = Math.max(0, this.engineChar.health / 100);
    
    // Health bar
    const healthColor = healthPercent > 0.5 ? 0xffeb3b : healthPercent > 0.25 ? 0xff9800 : 0xff0000;
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x, y, width * healthPercent, 20);
  }

  updateMeterBar(x: number, y: number, width: number) {
    this.meterBar.clear();
    const meterPercent = Math.max(0, Math.min(1, this.engineChar.meter / 100));
    
    // Meter bar (cyan)
    this.meterBar.fillStyle(0x00ddff);
    this.meterBar.fillRect(x, y, width * meterPercent, 12);
  }

  updateSuperMeter(x: number, y: number) {
    this.superMeterBoxes.clear();
    const segments = 5;
    const boxWidth = 30;
    const boxHeight = 20;
    const spacing = 5;
    const filled = Math.floor((this.engineChar.meter / 100) * segments);
    
    for (let i = 0; i < segments; i++) {
      const boxX = x + (i * (boxWidth + spacing));
      if (i < filled) {
        this.superMeterBoxes.fillStyle(i === 4 ? 0xff00ff : 0xffff00, 1);
      } else {
        this.superMeterBoxes.fillStyle(0x000000, 0.5);
      }
      this.superMeterBoxes.fillRect(boxX, y, boxWidth, boxHeight);
      this.superMeterBoxes.lineStyle(2, 0xffffff);
      this.superMeterBoxes.strokeRect(boxX, y, boxWidth, boxHeight);
    }
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

  checkSpecialMoves(): string | null {
    const bufferStr = this.inputBuffer.join('');
    
    if (bufferStr.includes('downrightlight')) {
      this.inputBuffer = [];
      return 'hadouken';
    }
    if (bufferStr.includes('rightdownlight')) {
      this.inputBuffer = [];
      return 'shoryuken';
    }
    return null;
  }

  lightAttack() {
    if (this.attackCooldown > 0 || this.isAttacking) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isAttacking = true;
    this.attackCooldown = 20;
    this.hitboxActive = true;
    
    // Forward momentum
    body.setVelocityX(this.facing * 100);
    
    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => this.sprite.clearTint());
    
    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
      this.hitboxActive = false;
    });
  }

  heavyAttack() {
    if (this.attackCooldown > 0 || this.isAttacking) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isAttacking = true;
    this.attackCooldown = 40;
    this.hitboxActive = true;
    
    body.setVelocityX(this.facing * 150);
    
    this.sprite.setTint(0xff6600);
    this.scene.time.delayedCall(200, () => this.sprite.clearTint());
    
    this.scene.time.delayedCall(500, () => {
      this.isAttacking = false;
      this.hitboxActive = false;
    });
  }

  specialMove(type: string) {
    if (this.engineChar.meter < 25) return;
    
    this.engineChar.meter -= 25;
    this.isAttacking = true;
    this.hitboxActive = true;
    
    // Create projectile
    this.createProjectile();
    
    this.sprite.setTint(0x00ffff);
    this.scene.time.delayedCall(300, () => this.sprite.clearTint());
    
    this.scene.time.delayedCall(800, () => {
      this.isAttacking = false;
      this.hitboxActive = false;
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
    
    this.scene.time.delayedCall(2000, () => projectile.destroy());
  }

  block() {
    if (!this.isAttacking && this.engineChar.state !== 'hit_stun') {
      this.engineChar.state = 'blocking';
      this.sprite.setAlpha(0.7);
    }
  }

  stopBlock() {
    if (this.engineChar.state === 'blocking') {
      this.engineChar.state = 'idle';
      this.sprite.setAlpha(1);
    }
  }

  takeDamage(damage: number, knockback: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.engineChar.health = Math.max(0, this.engineChar.health - damage);
    this.engineChar.state = 'hit_stun';
    
    body.setVelocityX(knockback * -this.facing);
    body.setVelocityY(-100);
    
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => this.sprite.clearTint());
    
    this.scene.time.delayedCall(400, () => {
      if (this.engineChar.state === 'hit_stun') {
        this.engineChar.state = 'idle';
      }
    });
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Update attack box
    this.attackBox.setPosition(this.x + (this.facing * 50), this.y);
    
    // Update combo text
    this.comboText.setPosition(this.x, this.y - 150);
    
    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // Check if on ground
    if (body.touching.down) {
      this.engineChar.inAir = false;
    }
  }

  setVelocityX(velocity: number) {
    this.body.setVelocityX(velocity);
  }

  setVelocityY(velocity: number) {
    this.body.setVelocityY(velocity);
  }
}

import { Input } from 'phaser';

export class FightingGameScene extends Phaser.Scene {
  private player1: FighterSprite;
  private player2: FighterSprite;
  private timerText: Phaser.GameObjects.Text;
  private timer = 99;
  private gameOver = false;
  private p1Portrait: Phaser.GameObjects.Image;
  private p2Portrait: Phaser.GameObjects.Image;
  private frame: Phaser.GameObjects.Image;
  private superMoveText: Phaser.GameObjects.Text;
  private lastSpecialMoveTime = 0;

  constructor() {
    super({ key: 'FightingGameScene' });
  }

  preload() {
    // We'll create everything with graphics - no need to load images
  }

  create() {
    // Skip if no config data
    if (!this.playerConfig || !this.opponentConfig) return;
    
    // Epic background - dark dramatic sky
    const bg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x2a1a3a
    );
    
    // Add gradient effect to background
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x4a2a5a, 0x4a2a5a, 0x1a0a2a, 0x1a0a2a, 1);
    bgGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Ornate golden frame at top
    const frameGraphics = this.add.graphics();
    
    // Main frame background
    frameGraphics.fillStyle(0x1a1a1a, 0.8);
    frameGraphics.fillRect(0, 0, this.scale.width, 150);
    
    // Golden ornate border
    frameGraphics.lineStyle(8, 0xd4af37);
    frameGraphics.strokeRect(10, 10, this.scale.width - 20, 130);
    
    // Inner decorative lines
    frameGraphics.lineStyle(4, 0xffeb3b);
    frameGraphics.strokeRect(20, 20, this.scale.width - 40, 110);
    
    // Left ornate corner decoration
    frameGraphics.fillStyle(0xd4af37);
    frameGraphics.fillCircle(80, 70, 50);
    frameGraphics.lineStyle(6, 0xffeb3b);
    frameGraphics.strokeCircle(80, 70, 50);
    
    // Right ornate corner decoration
    frameGraphics.fillCircle(this.scale.width - 80, 70, 50);
    frameGraphics.strokeCircle(this.scale.width - 80, 70, 50);
    
    // Character names
    const p1Name = this.add.text(150, 30, this.playerConfig.name.toUpperCase(), {
      fontSize: '28px',
      color: '#d4af37',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    });
    
    const p2Name = this.add.text(this.scale.width - 150, 30, this.opponentConfig.name.toUpperCase(), {
      fontSize: '28px',
      color: '#d4af37',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(1, 0);
    
    // Timer in center
    const timerBg = this.add.circle(this.scale.width / 2, 70, 45, 0x1a1a1a);
    const timerRing = this.add.circle(this.scale.width / 2, 70, 45);
    timerRing.setStrokeStyle(6, 0xd4af37);
    const timerText = this.add.text(this.scale.width / 2, 70, '00', {
      fontSize: '42px',
      color: '#d4af37',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Health bars background
    const p1HealthBg = this.add.rectangle(150, 60, 350, 22, 0x1a1a1a);
    const p2HealthBg = this.add.rectangle(this.scale.width - 150, 60, 350, 22, 0x1a1a1a).setOrigin(1, 0.5);
    
    // Health bar borders
    const p1HealthBorder = this.add.rectangle(150, 60, 350, 22);
    p1HealthBorder.setStrokeStyle(3, 0xd4af37);
    const p2HealthBorder = this.add.rectangle(this.scale.width - 150, 60, 350, 22);
    p2HealthBorder.setStrokeStyle(3, 0xd4af37).setOrigin(1, 0.5);
    
    // Meter bars background
    const p1MeterBg = this.add.rectangle(150, 85, 350, 14, 0x1a1a1a);
    const p2MeterBg = this.add.rectangle(this.scale.width - 150, 85, 350, 14, 0x1a1a1a).setOrigin(1, 0.5);
    
    // Meter bar borders
    const p1MeterBorder = this.add.rectangle(150, 85, 350, 14);
    p1MeterBorder.setStrokeStyle(2, 0x00ddff);
    const p2MeterBorder = this.add.rectangle(this.scale.width - 150, 85, 14);
    p2MeterBorder.setStrokeStyle(2, 0x00ddff).setOrigin(1, 0.5);
    
    // Super meter labels
    this.add.text(this.scale.width / 2 - 100, 110, 'SUPER METER', {
      fontSize: '14px',
      color: '#00ddff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.add.text(this.scale.width / 2 + 100, 110, 'SUPER METER', {
      fontSize: '14px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Characters
    this.player1 = new FighterSprite(this, 200, 500, {
      name: 'Michael',
      health: 100,
      attack: 10,
      defense: 5,
      speed: 100,
      jumpPower: 300,
      spriteKey: 'player1',
      alignment: 'Good',
      portraitUrl: 'assets/p1_portrait.png'
    }, true);

    this.player2 = new FighterSprite(this, 1000, 500, {
      name: 'Lucifer',
      health: 100,
      attack: 12,
      defense: 3,
      speed: 90,
      jumpPower: 320,
      spriteKey: 'player2',
      alignment: 'Evil',
      portraitUrl: 'assets/p2_portrait.png'
    }, false);

    // Physics
    this.physics.world.setBounds(0, 0, 1280, 720);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.physics.add.collider(this.player1, this.player2);

    // Camera
    this.cameras.main.setBounds(0, 0, 1280, 720);
    this.cameras.main.startFollow(this.player1);

    // Input
    this.setupInput(this.player1, 'W', 'A', 'D', 'F', 'G', 'H');
    this.setupInput(this.player2, 'I', 'J', 'L', 'N', 'M', 'COMMA');

    // Timer event
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  updateTimer() {
    if (this.gameOver) return;

    this.timer--;
    this.timerText.setText(this.timer.toString().padStart(2, '0'));

    if (this.timer <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.timerText.setText('KO!');

    // Determine winner based on health
    let winner: FighterSprite;
    if (this.player1.engineChar.health > this.player2.engineChar.health) {
      winner = this.player1;
    } else if (this.player2.engineChar.health > this.player1.engineChar.health) {
      winner = this.player2;
    } else {
      // In case of a tie, you can set a default winner or handle it differently
      winner = this.player1; // Default to player 1
    }

    this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `${winner.fighterName} Wins!`, {
      fontSize: '64px',
      color: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0);
  }

  setupInput(player: FighterSprite, up: string, left: string, right: string, light: string, heavy: string, special: string) {
    const keyUp = this.input.keyboard.addKey(up);
    const keyLeft = this.input.keyboard.addKey(left);
    const keyRight = this.input.keyboard.addKey(right);
    const keyLight = this.input.keyboard.addKey(light);
    const keyHeavy = this.input.keyboard.addKey(heavy);
    const keySpecial = this.input.keyboard.addKey(special);

    keyUp.on('down', () => {
      if (player.body.touching.down) {
        player.setVelocityY(-player.engineChar.jumpPower);
        player.engineChar.inAir = true;
      }
    });

    keyLeft.on('down', () => {
      player.facing = -1;
      player.setVelocityX(-player.engineChar.speed);
    });
    keyLeft.on('up', () => {
      if (this.input.keyboard.checkDown(keyRight)) {
        player.facing = 1;
        player.setVelocityX(player.engineChar.speed);
      } else {
        player.setVelocityX(0);
      }
    });

    keyRight.on('down', () => {
      player.facing = 1;
      player.setVelocityX(player.engineChar.speed);
    });
    keyRight.on('up', () => {
      if (this.input.keyboard.checkDown(keyLeft)) {
        player.facing = -1;
        player.setVelocityX(-player.engineChar.speed);
      } else {
        player.setVelocityX(0);
      }
    });

    keyLight.on('down', () => {
      player.lightAttack();
    });

    keyHeavy.on('down', () => {
      player.heavyAttack();
    });

    keySpecial.on('down', () => {
      const now = Date.now();
      if (now - this.lastSpecialMoveTime > 1000) {
        const move = player.checkSpecialMoves();
        if (move) {
          player.specialMove(move);
          this.showSuperMoveText();
          this.lastSpecialMoveTime = now;
        }
      }
    });
  }

  showSuperMoveText() {
    this.superMoveText.setVisible(true);
    this.time.delayedCall(1500, () => {
      this.superMoveText.setVisible(false);
    });
  }

  update() {
    this.player1.update();
    this.player2.update();

    // Basic AI - Player 2 follows Player 1
    if (!this.player2.isAttacking && this.player2.engineChar.state !== 'hit_stun') {
      if (this.player1.x < this.player2.x - 50) {
        this.player2.facing = -1;
        this.player2.setVelocityX(-this.player2.engineChar.speed);
      } else if (this.player1.x > this.player2.x + 50) {
        this.player2.facing = 1;
        this.player2.setVelocityX(this.player2.engineChar.speed);
      } else {
        this.player2.setVelocityX(0);
      }
    }

    // Update UI elements
    this.player1.updateHealthBar(50, 80, 250);
    this.player2.updateHealthBar(this.cameras.main.width - 300, 80, 250);
    this.player1.updateMeterBar(50, 110, 250);
    this.player2.updateMeterBar(this.cameras.main.width - 300, 110, 250);
    this.player1.updateSuperMeter(50, 130);
    this.player2.updateSuperMeter(this.cameras.main.width - 300, 130);

    // Check for overlaps between attack boxes and characters
    this.checkAttackCollision(this.player1, this.player2);
    this.checkAttackCollision(this.player2, this.player1);
  }

  checkAttackCollision(attacker: FighterSprite, defender: FighterSprite) {
    if (attacker.hitboxActive && this.physics.overlap(attacker.attackBox, defender)) {
      const damage = attacker.engineChar.attack;
      const knockback = 200;

      defender.takeDamage(damage, knockback);
    }
  }
}
