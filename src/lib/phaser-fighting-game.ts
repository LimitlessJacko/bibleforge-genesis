// Phaser Fighting Game Engine - Marvel vs Capcom 2.5D Style
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
  portraitColor?: number;
  imageUrl?: string; // URL to character image
}

export interface AssistConfig {
  name: string;
  attack: number;
  alignment: 'Good' | 'Evil';
  assistType: 'projectile' | 'rush' | 'anti-air';
  assistMove: string;
}

type AnimState = 'idle' | 'walk' | 'jump' | 'air_dash' | 'land' | 'light_attack' | 'heavy_attack' | 'launcher' | 'air_combo' | 'special' | 'super' | 'block' | 'hit' | 'crouch' | 'ground_bounce' | 'wall_bounce';

interface AnimationFrame {
  duration: number;
  hitboxActive?: boolean;
  moveSpeed?: number;
  invincible?: boolean;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  tint?: number;
}

// MvC-style particle colors
const HIT_SPARK_COLORS = [0xff6600, 0xffaa00, 0xffff00, 0xff0066];
const SUPER_COLORS = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00];

export class FighterSprite extends Phaser.Physics.Arcade.Sprite {
  public fighterName: string;
  public engineChar: EngineCharacter;
  public isPlayer: boolean;
  public facing: 1 | -1 = 1;
  public attackBox: Phaser.GameObjects.Rectangle;
  public healthBar: Phaser.GameObjects.Graphics;
  public meterBar: Phaser.GameObjects.Graphics;
  public comboText: Phaser.GameObjects.Text;
  public damageText: Phaser.GameObjects.Text;
  public isAttacking = false;
  public attackCooldown = 0;
  public hitboxActive = false;
  public inputBuffer: string[] = [];
  private lastInputTime = 0;
  public superMoveName: string;
  public canCancelInto = false;
  public hitstunFrames = 0;
  public blockstunFrames = 0;
  public comboCounter = 0;
  public comboDamage = 0;
  public isGroundBouncing = false;
  public isWallBouncing = false;
  public airActionsRemaining = 2;
  public portraitColor: number;
  private characterGraphics?: Phaser.GameObjects.Graphics;
  private baseScaleX = 1;
  private baseScaleY = 1;
  private baseY = 0;
  
  public animState: AnimState = 'idle';
  public animFrame = 0;
  public animFrameTimer = 0;
  private animationFrames: Record<AnimState, AnimationFrame[]> = {
    // Idle breathing animation - 8 frames for smooth loop
    idle: [
      { duration: 120, scaleY: 1.0, offsetY: 0 },
      { duration: 120, scaleY: 1.01, offsetY: -2 },
      { duration: 120, scaleY: 1.02, offsetY: -3 },
      { duration: 120, scaleY: 1.01, offsetY: -2 },
      { duration: 120, scaleY: 1.0, offsetY: 0 },
      { duration: 120, scaleY: 0.99, offsetY: 1 },
      { duration: 120, scaleY: 0.98, offsetY: 2 },
      { duration: 120, scaleY: 0.99, offsetY: 1 },
    ],
    // Walk animation with bob
    walk: [
      { duration: 80, scaleY: 1.0, offsetY: 0, offsetX: 0 },
      { duration: 80, scaleY: 0.98, offsetY: 3, offsetX: 2 },
      { duration: 80, scaleY: 1.0, offsetY: 0, offsetX: 0 },
      { duration: 80, scaleY: 0.98, offsetY: 3, offsetX: -2 },
    ],
    // Jump with squash/stretch
    jump: [
      { duration: 60, scaleX: 0.9, scaleY: 1.15, offsetY: 0 },
      { duration: 200, scaleX: 1.0, scaleY: 1.0, offsetY: 0 },
      { duration: 100, scaleX: 1.05, scaleY: 0.95, offsetY: 0 },
    ],
    air_dash: [{ duration: 200, invincible: true, scaleX: 1.1, scaleY: 0.9 }],
    land: [
      { duration: 40, scaleX: 1.15, scaleY: 0.85, offsetY: 10 },
      { duration: 60, scaleX: 1.0, scaleY: 1.0, offsetY: 0 },
    ],
    // Light attack - quick jab animation
    light_attack: [
      { duration: 30, scaleX: 0.95, rotation: -0.05 },
      { duration: 50, hitboxActive: true, moveSpeed: 200, scaleX: 1.1, rotation: 0.1, tint: 0xffffcc },
      { duration: 40, hitboxActive: true, moveSpeed: 100, scaleX: 1.05, rotation: 0.05 },
      { duration: 60, scaleX: 1.0, rotation: 0 }
    ],
    // Heavy attack - big swing
    heavy_attack: [
      { duration: 80, scaleX: 0.9, scaleY: 1.05, rotation: -0.15 },
      { duration: 60, scaleX: 1.15, scaleY: 0.95, rotation: 0.1, tint: 0xffcc00 },
      { duration: 80, hitboxActive: true, moveSpeed: 350, scaleX: 1.2, rotation: 0.2, tint: 0xff6600 },
      { duration: 60, hitboxActive: true, moveSpeed: 150, scaleX: 1.1, rotation: 0.1 },
      { duration: 100, scaleX: 1.0, rotation: 0 }
    ],
    // Launcher - uppercut motion
    launcher: [
      { duration: 40, scaleY: 0.9, offsetY: 10, rotation: -0.1 },
      { duration: 60, scaleY: 1.1, offsetY: -15, rotation: 0.05, tint: 0x66ccff },
      { duration: 80, hitboxActive: true, scaleY: 1.15, offsetY: -25, rotation: 0.1, tint: 0x00ffff },
      { duration: 100, scaleY: 1.0, offsetY: 0, rotation: 0 }
    ],
    // Air combo - rapid hits
    air_combo: [
      { duration: 30, rotation: -0.1, scaleX: 0.95 },
      { duration: 50, hitboxActive: true, rotation: 0.15, scaleX: 1.1, tint: 0xffaa00 },
      { duration: 40, hitboxActive: true, rotation: -0.1, scaleX: 1.05, tint: 0xffcc00 },
      { duration: 50, rotation: 0, scaleX: 1.0 }
    ],
    // Special move - dramatic windup
    special: [
      { duration: 60, scaleX: 0.85, scaleY: 1.1, rotation: -0.2, tint: 0x6666ff },
      { duration: 40, scaleX: 0.9, scaleY: 1.05, rotation: -0.1, tint: 0x8888ff },
      { duration: 150, hitboxActive: true, invincible: true, scaleX: 1.2, scaleY: 0.9, rotation: 0.15, tint: 0xffffff },
      { duration: 100, hitboxActive: true, scaleX: 1.1, rotation: 0.05, tint: 0xccccff },
      { duration: 80, scaleX: 1.0, rotation: 0 }
    ],
    // Super move - maximum impact
    super: [
      { duration: 100, invincible: true, scaleX: 0.8, scaleY: 1.2, rotation: -0.2, tint: 0xff00ff },
      { duration: 80, invincible: true, scaleX: 0.85, scaleY: 1.15, tint: 0xff66ff },
      { duration: 250, hitboxActive: true, invincible: true, scaleX: 1.3, scaleY: 0.85, rotation: 0.2, tint: 0xffff00 },
      { duration: 150, hitboxActive: true, invincible: true, scaleX: 1.2, rotation: 0.1, tint: 0xffaa00 },
      { duration: 120, scaleX: 1.0, scaleY: 1.0, rotation: 0 }
    ],
    // Block - defensive crouch
    block: [
      { duration: 30, scaleX: 0.95, scaleY: 0.95, offsetY: 5, tint: 0x6699ff },
    ],
    // Hit stun - impactful recoil animation with stagger
    hit: [
      { duration: 40, scaleX: 0.75, scaleY: 1.15, rotation: -0.25, offsetX: -25, tint: 0xffffff }, // Initial hit freeze
      { duration: 60, scaleX: 0.8, scaleY: 1.1, rotation: -0.2, offsetX: -20, tint: 0xff0000 }, // Recoil
      { duration: 80, scaleX: 0.85, scaleY: 1.05, rotation: -0.15, offsetX: -15, tint: 0xff3333 }, // Stagger back
      { duration: 70, scaleX: 0.9, scaleY: 1.02, rotation: -0.1, offsetX: -10, tint: 0xff6666 }, // Recovery start
      { duration: 60, scaleX: 0.95, rotation: -0.05, offsetX: -5, tint: 0xff9999 }, // Near recovery
      { duration: 50, scaleX: 1.0, rotation: 0, offsetX: 0 } // Full recovery
    ],
    crouch: [{ duration: 80, scaleY: 0.8, offsetY: 20 }],
    ground_bounce: [
      { duration: 60, scaleY: 0.5, scaleX: 1.4, offsetY: 40, rotation: 0.4, tint: 0xff3300 }, // Impact squash
      { duration: 80, scaleY: 0.6, scaleX: 1.3, offsetY: 35, rotation: 0.35, tint: 0xff6600 },
      { duration: 100, scaleY: 1.2, scaleX: 0.85, offsetY: -30, rotation: 0.15, tint: 0xffaa00 }, // Bounce up
      { duration: 80, scaleY: 1.1, scaleX: 0.9, offsetY: -15, rotation: 0.08 },
      { duration: 100, scaleY: 1.0, scaleX: 1.0, offsetY: 0, rotation: 0 }
    ],
    wall_bounce: [
      { duration: 50, scaleX: 0.6, scaleY: 1.25, rotation: -0.4, tint: 0xff3300 }, // Wall impact
      { duration: 70, scaleX: 0.7, scaleY: 1.2, rotation: -0.35, tint: 0xff6600 },
      { duration: 100, scaleX: 1.15, scaleY: 0.9, rotation: 0.15, tint: 0xffaa00 }, // Bounce off
      { duration: 80, scaleX: 1.08, scaleY: 0.95, rotation: 0.08 },
      { duration: 70, scaleX: 1.0, scaleY: 1.0, rotation: 0 }
    ]
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: FighterConfig,
    isPlayer: boolean,
    superMoveName: string = "Divine Strike"
  ) {
    // Use the preloaded character texture if available, otherwise fallback to generated
    const textureKey = 'fighter-' + config.name.replace(/\s+/g, '-').toLowerCase();
    const hasTexture = scene.textures.exists(textureKey);
    
    super(scene, x, y, hasTexture ? textureKey : 'character');
    
    this.portraitColor = config.portraitColor || (config.alignment === 'Good' ? 0x3388ff : 0xff3333);
    
    // Only generate fallback texture if character image wasn't loaded
    if (!hasTexture) {
      this.characterGraphics = scene.add.graphics();
      this.drawCharacter(config.alignment);
      this.characterGraphics.generateTexture('character-' + config.name, 120, 180);
      this.characterGraphics.destroy();
      this.setTexture('character-' + config.name);
    } else {
      // Scale and adjust the actual character image
      this.setDisplaySize(200, 280); // MvC-style larger sprites
    }
    
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
    body.setDragX(800);
    body.setMaxVelocity(600, 1200);
    body.setSize(80, 200); // Adjusted hitbox for larger sprites
    body.setOffset(60, 40); // Center the hitbox
    this.setOrigin(0.5, 0.5);

    this.attackBox = scene.add.rectangle(x, y, 120, 180, 0xff0000, 0);
    scene.physics.add.existing(this.attackBox);

    this.healthBar = scene.add.graphics();
    this.meterBar = scene.add.graphics();
    
    // MvC-style combo counter
    this.comboText = scene.add.text(x, y - 200, '', {
      fontSize: '64px',
      color: '#ffcc00',
      fontFamily: 'Impact, sans-serif',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Damage display
    this.damageText = scene.add.text(x, y - 150, '', {
      fontSize: '32px',
      color: '#ff6600',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  drawCharacter(alignment: 'Good' | 'Evil') {
    const color = alignment === 'Good' ? this.portraitColor : this.portraitColor;
    const g = this.characterGraphics;
    
    // Body with MvC-style proportions
    g.fillStyle(color);
    g.fillRoundedRect(-35, -70, 70, 140, 12);
    
    // Inner glow
    g.fillStyle(0xffffff, 0.2);
    g.fillRoundedRect(-30, -65, 60, 50, 8);
    
    // Head
    g.fillStyle(0xffcc99);
    g.fillCircle(0, -85, 30);
    
    // Eyes (intense MvC style)
    g.fillStyle(0xffffff);
    g.fillEllipse(-10, -88, 14, 10);
    g.fillEllipse(10, -88, 14, 10);
    g.fillStyle(0x000000);
    g.fillCircle(-10, -88, 4);
    g.fillCircle(10, -88, 4);
    
    // Mouth
    g.lineStyle(2, 0x000000);
    g.beginPath();
    g.arc(0, -75, 8, 0.2, Math.PI - 0.2);
    g.stroke();
    
    // Arms (dynamic pose)
    g.fillStyle(color);
    g.fillRoundedRect(-55, -50, 20, 70, 8);
    g.fillRoundedRect(35, -50, 20, 70, 8);
    
    // Hands
    g.fillStyle(0xffcc99);
    g.fillCircle(-45, 25, 12);
    g.fillCircle(45, 25, 12);
    
    // Legs
    g.fillStyle(color * 0.8);
    g.fillRoundedRect(-30, 50, 25, 60, 8);
    g.fillRoundedRect(5, 50, 25, 60, 8);
    
    // Energy aura outline
    g.lineStyle(4, alignment === 'Good' ? 0x66ccff : 0xff6666, 0.6);
    g.strokeRoundedRect(-40, -75, 80, 150, 15);
  }

  updateHealthBar(x: number, y: number, width: number) {
    this.healthBar.clear();
    const healthPercent = Math.max(0, this.engineChar.health / 100);
    
    // MvC-style segmented health bar
    const segments = 10;
    const segmentWidth = width / segments;
    
    for (let i = 0; i < segments; i++) {
      const segmentFill = Math.max(0, Math.min(1, (healthPercent * segments) - i));
      if (segmentFill > 0) {
        const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
        this.healthBar.fillStyle(healthColor, segmentFill);
        this.healthBar.fillRect(x + i * segmentWidth + 1, y, segmentWidth - 2, 24);
      }
    }
  }

  updateMeterBar(x: number, y: number, width: number) {
    this.meterBar.clear();
    const meterPercent = Math.max(0, Math.min(1, this.engineChar.meter / 100));
    
    // MvC-style super meter with level indicators
    const levels = Math.floor(this.engineChar.meter / 33.33);
    const currentLevelProgress = (this.engineChar.meter % 33.33) / 33.33;
    
    // Background segments
    for (let i = 0; i < 3; i++) {
      this.meterBar.fillStyle(0x222244);
      this.meterBar.fillRect(x + i * (width / 3) + 1, y, (width / 3) - 2, 16);
    }
    
    // Filled segments
    for (let i = 0; i < levels && i < 3; i++) {
      this.meterBar.fillStyle(SUPER_COLORS[i % SUPER_COLORS.length]);
      this.meterBar.fillRect(x + i * (width / 3) + 2, y + 1, (width / 3) - 4, 14);
    }
    
    // Current level progress
    if (levels < 3) {
      this.meterBar.fillStyle(SUPER_COLORS[levels % SUPER_COLORS.length], 0.7);
      this.meterBar.fillRect(x + levels * (width / 3) + 2, y + 1, ((width / 3) - 4) * currentLevelProgress, 14);
    }
  }

  addInput(input: string) {
    const now = Date.now();
    if (now - this.lastInputTime < 400) {
      this.inputBuffer.push(input);
      if (this.inputBuffer.length > 6) this.inputBuffer.shift();
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
    
    // Loop idle and walk animations
    if (this.animFrame >= currentAnim.length) {
      if (this.animState === 'idle' || this.animState === 'walk') {
        this.animFrame = 0; // Loop
      } else {
        this.changeState('idle');
        this.isAttacking = false;
        this.hitboxActive = false;
        return;
      }
    }

    const currentFrame = currentAnim[this.animFrame];
    this.animFrameTimer += delta;
    this.hitboxActive = currentFrame.hitboxActive || false;

    if (currentFrame.moveSpeed && this.isAttacking) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.facing * currentFrame.moveSpeed);
    }

    // Apply frame-based visual transformations
    const targetScaleX = (currentFrame.scaleX ?? 1) * this.baseScaleX * this.facing;
    const targetScaleY = (currentFrame.scaleY ?? 1) * this.baseScaleY;
    const targetRotation = (currentFrame.rotation ?? 0) * this.facing;
    const offsetX = (currentFrame.offsetX ?? 0) * this.facing;
    const offsetY = currentFrame.offsetY ?? 0;
    
    // Smooth interpolation for fluid animation
    this.scaleX = Phaser.Math.Linear(this.scaleX, targetScaleX, 0.3);
    this.scaleY = Phaser.Math.Linear(this.scaleY, targetScaleY, 0.3);
    this.rotation = Phaser.Math.Linear(this.rotation, targetRotation, 0.3);
    
    // Apply position offset
    if (this.baseY === 0) this.baseY = this.y;
    
    // Apply tint from frame or state
    if (currentFrame.tint) {
      this.setTint(currentFrame.tint);
    } else if (currentFrame.invincible) {
      this.setAlpha(0.8);
      this.setTint(0x00ffff);
    } else {
      this.clearTint();
      this.setAlpha(1);
    }

    if (this.animFrameTimer >= currentFrame.duration) {
      this.animFrame++;
      this.animFrameTimer = 0;
    }
  }

  // Store base scale after image loads
  initializeBaseScale() {
    // For image sprites, get the actual display size ratio
    this.baseScaleX = Math.abs(this.scaleX) || 1;
    this.baseScaleY = this.scaleY || 1;
    this.baseY = this.y;
    
    // Handle opponent starting flipped
    if (!this.isPlayer) {
      this.scaleX = -this.baseScaleX;
    }
  }

  lightAttack() {
    if (this.hitstunFrames > 0 || this.blockstunFrames > 0) return;
    if (this.isAttacking && !this.canCancelInto) return;
    if (this.animState === 'hit') return;
    
    const inAir = this.engineChar.inAir;
    this.changeState(inAir ? 'air_combo' : 'light_attack');
    this.isAttacking = true;
    this.attackCooldown = 15;
    this.canCancelInto = false;
    
    this.scene.time.delayedCall(100, () => {
      if (this.animState === 'light_attack' || this.animState === 'air_combo') {
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
    this.attackCooldown = 30;
    this.canCancelInto = false;
  }

  launcherAttack() {
    if (this.hitstunFrames > 0 || this.blockstunFrames > 0) return;
    if (this.isAttacking && !this.canCancelInto) return;
    
    this.changeState('launcher');
    this.isAttacking = true;
    this.attackCooldown = 35;
    this.canCancelInto = false;
  }

  airDash(direction: 1 | -1) {
    if (this.airActionsRemaining <= 0 || !this.engineChar.inAir) return;
    
    this.airActionsRemaining--;
    this.changeState('air_dash');
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(direction * 500);
    body.setVelocityY(-50);
    
    // Air dash trail effect
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const trail = this.scene.add.circle(this.x - (direction * i * 30), this.y, 15, this.portraitColor, 0.5);
        this.scene.tweens.add({
          targets: trail,
          alpha: 0,
          scale: 0.3,
          duration: 200,
          onComplete: () => trail.destroy()
        });
      });
    }
  }

  specialMove(type: string = 'projectile') {
    if (this.engineChar.meter < 25 || this.hitstunFrames > 0) return;
    if (this.isAttacking && !this.canCancelInto) return;
    
    this.engineChar.meter -= 25;
    this.changeState('special');
    this.isAttacking = true;
    this.canCancelInto = false;
    
    // Screen flash for special
    this.createScreenFlash(0xffffff, 100);
    
    this.scene.time.delayedCall(80, () => {
      if (type === 'projectile') {
        this.createMvCProjectile();
      } else {
        this.createAOEEffect();
      }
    });
  }

  superMove() {
    if (this.engineChar.meter < 100) return;
    
    this.engineChar.meter = 0;
    this.changeState('super');
    this.isAttacking = true;
    this.canCancelInto = false;
    
    // MvC3-style cinematic super with camera effects
    this.createCinematicSuper();
  }

  createScreenFlash(color: number, duration: number) {
    const flash = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      color,
      0.5
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      onComplete: () => flash.destroy()
    });
  }

  createCinematicSuper() {
    const scene = this.scene as FightingGameScene;
    const camera = scene.cameras.main;
    
    // Store original camera state
    const originalZoom = camera.zoom;
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;
    
    // Phase 1: Super Flash & Time Slow (MvC3 style)
    scene.time.timeScale = 0.2; // Slow motion
    
    // Dramatic black bars (cinematic letterbox)
    const topBar = scene.add.rectangle(500, 0, 1000, 80, 0x000000).setDepth(1000);
    const bottomBar = scene.add.rectangle(500, 600, 1000, 80, 0x000000).setDepth(1000);
    
    // Character zoom-in
    scene.tweens.add({
      targets: camera,
      zoom: 1.8,
      scrollX: this.x - 280,
      scrollY: this.y - 200,
      duration: 150,
      ease: 'Cubic.easeOut'
    });
    
    // Super freeze background
    const freezeOverlay = scene.add.rectangle(500, 300, 1000, 600, 0x000022, 0.85).setDepth(999);
    
    // Character spotlight
    const spotlight = scene.add.circle(this.x, this.y, 200, 0xffffff, 0.3).setDepth(998);
    scene.tweens.add({
      targets: spotlight,
      scale: 1.5,
      alpha: 0.1,
      duration: 300,
      yoyo: true
    });
    
    // Dynamic character portrait (MvC3 style cut-in)
    const portraitBg = scene.add.rectangle(
      this.isPlayer ? 180 : 820,
      300,
      300,
      400,
      this.portraitColor,
      0.9
    ).setDepth(1001).setAngle(this.isPlayer ? -5 : 5);
    
    // Portrait border
    const portraitBorder = scene.add.rectangle(
      this.isPlayer ? 180 : 820,
      300,
      310,
      410,
      0xffffff,
      1
    ).setDepth(1000).setAngle(this.isPlayer ? -5 : 5);
    
    // Character name with dramatic entrance
    const nameText = scene.add.text(
      this.isPlayer ? 180 : 820,
      450,
      this.fighterName.toUpperCase(),
      {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Impact, sans-serif',
        stroke: '#000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setDepth(1002).setAlpha(0);
    
    scene.tweens.add({
      targets: nameText,
      alpha: 1,
      y: 430,
      duration: 200
    });
    
    // Super move name with dramatic animation
    const superText = scene.add.text(
      500,
      280,
      this.superMoveName.toUpperCase(),
      {
        fontSize: '64px',
        color: '#ffff00',
        fontFamily: 'Impact, sans-serif',
        stroke: '#ff0000',
        strokeThickness: 8,
        shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 8, fill: true }
      }
    ).setOrigin(0.5).setDepth(1002).setScale(0.5).setAlpha(0);
    
    scene.tweens.add({
      targets: superText,
      scale: 1.2,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Energy burst lines (speed lines)
    this.createSpeedLines();
    
    // Phase 2: Camera pan and attack (after 600ms)
    scene.time.delayedCall(600 * 5, () => { // Multiply by 5 due to timeScale
      // Return time to normal
      scene.time.timeScale = 1;
      
      // Dynamic camera movement during attack
      scene.tweens.add({
        targets: camera,
        zoom: 1.3,
        scrollX: (this.x + (this.isPlayer ? 200 : -200)) - 500,
        scrollY: 50,
        duration: 300,
        ease: 'Sine.easeInOut'
      });
      
      // Remove cinematic elements
      scene.tweens.add({
        targets: [freezeOverlay, spotlight, portraitBg, portraitBorder, nameText, superText, topBar, bottomBar],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          freezeOverlay.destroy();
          spotlight.destroy();
          portraitBg.destroy();
          portraitBorder.destroy();
          nameText.destroy();
          superText.destroy();
          topBar.destroy();
          bottomBar.destroy();
        }
      });
      
      // Execute the actual super attack
      this.createMvCSuperEffect();
      
      // Phase 3: Return camera to normal
      scene.time.delayedCall(1000, () => {
        scene.tweens.add({
          targets: camera,
          zoom: originalZoom,
          scrollX: originalX,
          scrollY: originalY,
          duration: 500,
          ease: 'Sine.easeOut'
        });
      });
    });
  }
  
  createSpeedLines() {
    const scene = this.scene;
    const centerX = this.x;
    const centerY = this.y;
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const line = scene.add.rectangle(
        centerX + Math.cos(angle) * 50,
        centerY + Math.sin(angle) * 50,
        400,
        4,
        0xffffff,
        0.8
      ).setRotation(angle).setDepth(997);
      
      scene.tweens.add({
        targets: line,
        x: centerX + Math.cos(angle) * 600,
        y: centerY + Math.sin(angle) * 600,
        alpha: 0,
        duration: 400,
        delay: i * 20,
        onComplete: () => line.destroy()
      });
    }
  }

  createMvCProjectile() {
    const startX = this.x + (this.facing * 60);
    const colors = [0x00ffff, 0x00aaff, 0x0066ff];
    
    // Multi-hit projectile
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        const projectile = this.scene.add.circle(
          startX,
          this.y + (i * 15 - 15),
          20 - i * 3,
          colors[i]
        );
        this.scene.physics.add.existing(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocityX(this.facing * 550);
        
        // Projectile trail
        this.scene.tweens.add({
          targets: projectile,
          alpha: 0.4,
          scale: 0.6,
          duration: 150,
          yoyo: true,
          repeat: -1
        });
        
        this.scene.time.delayedCall(1500, () => projectile.destroy());
        (projectile as any).damage = 12 - i * 2;
        (projectile as any).owner = this;
      });
    }
  }

  createAOEEffect() {
    const aoe = this.scene.add.circle(this.x, this.y, 15, 0xffaa00, 0.8);
    
    // Expanding shockwave
    this.scene.tweens.add({
      targets: aoe,
      scale: 10,
      alpha: 0,
      duration: 400,
      onComplete: () => aoe.destroy()
    });
    
    // Hit particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.circle(
        this.x + Math.cos(angle) * 30,
        this.y + Math.sin(angle) * 30,
        8,
        HIT_SPARK_COLORS[i % HIT_SPARK_COLORS.length]
      );
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 150,
        y: this.y + Math.sin(angle) * 150,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
    
    (aoe as any).damage = 25;
    (aoe as any).owner = this;
  }

  createMvCSuperEffect() {
    // MvC3-style massive energy beam attack
    const scene = this.scene;
    const beamWidth = 180;
    
    // Initial energy charge effect
    const chargeEffect = scene.add.circle(this.x + (this.facing * 40), this.y, 20, 0xffff00, 1);
    scene.tweens.add({
      targets: chargeEffect,
      scale: 4,
      alpha: 0.3,
      duration: 200,
      onComplete: () => chargeEffect.destroy()
    });
    
    // Main beam with gradient effect
    const beam = scene.add.rectangle(
      this.x + (this.facing * 400),
      this.y,
      800,
      beamWidth,
      0xffff00,
      0.95
    );
    
    // Inner beam (brighter core)
    const innerBeam = scene.add.rectangle(
      this.x + (this.facing * 400),
      this.y,
      800,
      beamWidth * 0.5,
      0xffffff,
      0.9
    );
    
    // Beam edge glow
    const beamGlow = scene.add.rectangle(
      this.x + (this.facing * 400),
      this.y,
      820,
      beamWidth + 40,
      this.portraitColor,
      0.5
    );
    
    // Dramatic beam animation with scaling
    scene.tweens.add({
      targets: [beam, innerBeam, beamGlow],
      scaleY: { from: 0.1, to: 1.5 },
      duration: 150,
      ease: 'Cubic.easeOut',
      yoyo: true,
      hold: 400,
      onComplete: () => {
        beam.destroy();
        innerBeam.destroy();
        beamGlow.destroy();
      }
    });
    
    // Energy particles along beam
    for (let i = 0; i < 30; i++) {
      scene.time.delayedCall(i * 30, () => {
        const particle = scene.add.circle(
          this.x + (this.facing * Phaser.Math.Between(50, 700)),
          this.y + Phaser.Math.Between(-80, 80),
          Phaser.Math.Between(8, 20),
          SUPER_COLORS[i % SUPER_COLORS.length],
          0.9
        );
        scene.tweens.add({
          targets: particle,
          y: particle.y + Phaser.Math.Between(-50, 50),
          alpha: 0,
          scale: 0.2,
          duration: 300,
          onComplete: () => particle.destroy()
        });
      });
    }
    
    // Multiple projectile waves with trails
    for (let wave = 0; wave < 6; wave++) {
      scene.time.delayedCall(wave * 80, () => {
        for (let i = 0; i < 4; i++) {
          const yOffset = (i - 1.5) * 35;
          const projectile = scene.add.circle(
            this.x + (this.facing * 80),
            this.y + yOffset,
            22,
            SUPER_COLORS[wave % SUPER_COLORS.length]
          );
          scene.physics.add.existing(projectile);
          const body = projectile.body as Phaser.Physics.Arcade.Body;
          body.setVelocityX(this.facing * 800);
          
          // Projectile trail
          const createTrail = () => {
            if (!projectile.active) return;
            const trail = scene.add.circle(projectile.x, projectile.y, 15, projectile.fillColor as number, 0.5);
            scene.tweens.add({
              targets: trail,
              alpha: 0,
              scale: 0.3,
              duration: 150,
              onComplete: () => trail.destroy()
            });
          };
          
          const trailTimer = scene.time.addEvent({ delay: 40, callback: createTrail, loop: true });
          
          scene.tweens.add({
            targets: projectile,
            scale: { from: 0.5, to: 1.3 },
            duration: 100,
            yoyo: true,
            repeat: -1
          });
          
          scene.time.delayedCall(1000, () => {
            trailTimer.destroy();
            projectile.destroy();
          });
          (projectile as any).damage = 40;
          (projectile as any).owner = this;
        }
      });
    }
    
    // Dramatic screen shake with multiple intensities
    scene.cameras.main.shake(200, 0.03);
    scene.time.delayedCall(200, () => scene.cameras.main.shake(300, 0.02));
    scene.time.delayedCall(500, () => scene.cameras.main.shake(200, 0.01));
    
    // Final impact flash
    scene.time.delayedCall(600, () => {
      this.createScreenFlash(0xffffff, 150);
    });
  }

  block() {
    if (!this.isAttacking && this.animState !== 'hit') {
      this.changeState('block');
      this.engineChar.state = 'blocking';
      this.setAlpha(0.8);
      this.setTint(0x4444ff);
    }
  }

  stopBlock() {
    if (this.engineChar.state === 'blocking') {
      this.changeState('idle');
      this.engineChar.state = 'idle';
      this.setAlpha(1);
      this.clearTint();
    }
  }

  takeDamage(damage: number, knockback: number, isBlocked: boolean = false, isLauncher: boolean = false) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const scene = this.scene as FightingGameScene;
    
    if (isBlocked) {
      damage *= 0.2;
      this.blockstunFrames = 12;
      this.setTint(0x6666ff);
      this.scene.time.delayedCall(200, () => {
        this.clearTint();
        this.blockstunFrames = 0;
      });
      
      // Block spark effect
      this.createBlockSpark();
      
      // Light pushback on block
      body.setVelocityX(knockback * -this.facing * 0.3);
      
      // Light screen shake on block
      scene.cameras.main.shake(50, 0.005);
    } else {
      this.hitstunFrames = Math.floor(damage * 3);
      this.changeState('hit');
      this.engineChar.state = 'hit_stun';
      this.isAttacking = false;
      this.canCancelInto = false;
      
      // Hit freeze effect - brief pause for impact
      const hitFreezeTime = Math.min(damage * 2, 80);
      scene.time.timeScale = 0.1;
      scene.time.delayedCall(hitFreezeTime, () => {
        scene.time.timeScale = 1;
      });
      
      // Calculate knockback based on damage intensity
      const knockbackMultiplier = 1 + (damage / 50);
      
      if (isLauncher) {
        // Launch into air for air combo
        body.setVelocityY(-550 - (damage * 3));
        body.setVelocityX(knockback * -this.facing * 0.6 * knockbackMultiplier);
        this.createLaunchEffect();
      } else {
        // Enhanced knockback with stagger
        const horizontalKnockback = knockback * -this.facing * knockbackMultiplier;
        const verticalKnockback = -100 - (damage * 2);
        body.setVelocityX(horizontalKnockback);
        body.setVelocityY(verticalKnockback);
      }
      
      // MvC-style hit effects
      this.createMvCHitSpark();
      this.createHitStaggerEffect();
      
      // Dynamic screen shake based on damage
      const shakeIntensity = Math.min(0.005 + (damage * 0.002), 0.04);
      const shakeDuration = Math.min(100 + (damage * 5), 300);
      scene.cameras.main.shake(shakeDuration, shakeIntensity);
      
      // Additional impact shake for heavy hits
      if (damage > 20) {
        scene.time.delayedCall(100, () => {
          scene.cameras.main.shake(150, shakeIntensity * 0.6);
        });
      }
      
      // Camera punch effect for very heavy hits
      if (damage > 30) {
        this.createCameraPunchEffect(damage);
      }
      
      // Extended hitstun based on damage
      const hitstunTime = 300 + (damage * 8);
      this.scene.time.delayedCall(hitstunTime, () => {
        this.hitstunFrames = 0;
        if (this.engineChar.state === 'hit_stun') {
          this.changeState('idle');
          this.engineChar.state = 'idle';
        }
      });
    }
    
    this.engineChar.health = Math.max(0, this.engineChar.health - damage);
    
    // MvC-style damage number
    this.showDamageNumber(damage, isBlocked);
  }

  createHitStaggerEffect() {
    // Motion blur trail during knockback
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 30, () => {
        const ghost = this.scene.add.rectangle(
          this.x + (i * 15 * this.facing),
          this.y,
          this.displayWidth * 0.8,
          this.displayHeight * 0.8,
          0xff0000,
          0.4 - (i * 0.07)
        );
        this.scene.tweens.add({
          targets: ghost,
          alpha: 0,
          scaleX: 0.5,
          duration: 150,
          onComplete: () => ghost.destroy()
        });
      });
    }
    
    // Impact ring effect
    const impactRing = this.scene.add.circle(this.x, this.y, 30, 0xffffff, 0);
    impactRing.setStrokeStyle(4, 0xff6600);
    this.scene.tweens.add({
      targets: impactRing,
      scale: 3,
      alpha: 0,
      duration: 200,
      onComplete: () => impactRing.destroy()
    });
  }

  createLaunchEffect() {
    // Vertical launch streak
    const launchStreak = this.scene.add.rectangle(
      this.x,
      this.y + 100,
      30,
      200,
      0x00ffff,
      0.6
    );
    this.scene.tweens.add({
      targets: launchStreak,
      y: this.y - 100,
      alpha: 0,
      scaleY: 0.2,
      duration: 300,
      onComplete: () => launchStreak.destroy()
    });
    
    // Launch particles
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-30, 30),
        this.y,
        8,
        0x00ffff,
        0.8
      );
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 150,
        x: particle.x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  createCameraPunchEffect(damage: number) {
    const scene = this.scene as FightingGameScene;
    const camera = scene.cameras.main;
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;
    const punchOffset = Math.min(damage * 0.5, 20);
    
    // Quick camera punch in hit direction
    scene.tweens.add({
      targets: camera,
      scrollX: originalX + (punchOffset * -this.facing),
      scrollY: originalY - (punchOffset * 0.5),
      duration: 50,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        camera.scrollX = originalX;
        camera.scrollY = originalY;
      }
    });
    
    // Screen flash for heavy impact
    const flash = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      0xff0000,
      0.3
    );
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 100,
      onComplete: () => flash.destroy()
    });
  }

  createBlockSpark() {
    const colors = [0x4444ff, 0x6666ff, 0x8888ff];
    for (let i = 0; i < 6; i++) {
      const spark = this.scene.add.circle(
        this.x + Phaser.Math.Between(-30, 30),
        this.y + Phaser.Math.Between(-40, 40),
        10,
        colors[i % colors.length]
      );
      this.scene.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-50, 50),
        y: spark.y + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0.2,
        duration: 200,
        onComplete: () => spark.destroy()
      });
    }
  }

  createMvCHitSpark() {
    // Large central impact flash
    const mainSpark = this.scene.add.circle(this.x, this.y, 40, 0xffffff);
    this.scene.tweens.add({
      targets: mainSpark,
      scale: 2.5,
      alpha: 0,
      duration: 120,
      ease: 'Power2',
      onComplete: () => mainSpark.destroy()
    });
    
    // Inner bright core
    const core = this.scene.add.circle(this.x, this.y, 25, 0xffff00);
    this.scene.tweens.add({
      targets: core,
      scale: 1.8,
      alpha: 0,
      duration: 100,
      onComplete: () => core.destroy()
    });
    
    // Radiating sparks with trails
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 100 + Phaser.Math.Between(0, 40);
      const spark = this.scene.add.circle(
        this.x,
        this.y,
        Phaser.Math.Between(8, 15),
        HIT_SPARK_COLORS[i % HIT_SPARK_COLORS.length]
      );
      this.scene.tweens.add({
        targets: spark,
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 180,
        ease: 'Power2',
        onComplete: () => spark.destroy()
      });
    }
    
    // Diagonal slash lines (MvC style)
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 4) + (i * Math.PI / 2);
      const slashLine = this.scene.add.rectangle(
        this.x,
        this.y,
        80,
        6,
        0xffffff,
        0.9
      ).setRotation(angle);
      this.scene.tweens.add({
        targets: slashLine,
        scaleX: 2,
        alpha: 0,
        duration: 150,
        onComplete: () => slashLine.destroy()
      });
    }
    
    // Hit flash sequence
    this.setTint(0xffffff);
    this.scene.time.delayedCall(40, () => this.setTint(0xff6600));
    this.scene.time.delayedCall(80, () => this.setTint(0xff3300));
    this.scene.time.delayedCall(120, () => this.clearTint());
  }

  showDamageNumber(damage: number, isBlocked: boolean) {
    const damageText = this.scene.add.text(
      this.x + Phaser.Math.Between(-20, 20),
      this.y - 100,
      Math.floor(damage).toString(),
      {
        fontSize: isBlocked ? '28px' : '48px',
        color: isBlocked ? '#6666ff' : '#ff3300',
        fontFamily: 'Impact, sans-serif',
        stroke: '#000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: damageText,
      y: this.y - 180,
      alpha: 0,
      scale: isBlocked ? 0.8 : 1.3,
      duration: 800,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }

  updateComboDisplay() {
    if (this.comboCounter > 1) {
      this.comboText.setText(`${this.comboCounter} HIT`);
      this.comboText.setVisible(true);
      this.damageText.setText(`${Math.floor(this.comboDamage)} DMG`);
      this.damageText.setVisible(true);
      
      // Pulsing effect for high combos
      if (this.comboCounter >= 5) {
        this.comboText.setColor('#ff00ff');
        this.comboText.setFontSize('72px');
      } else if (this.comboCounter >= 3) {
        this.comboText.setColor('#ffaa00');
        this.comboText.setFontSize('64px');
      } else {
        this.comboText.setColor('#ffcc00');
        this.comboText.setFontSize('56px');
      }
    } else {
      this.comboText.setVisible(false);
      this.damageText.setVisible(false);
    }
  }

  update(delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.attackBox.setPosition(this.x + (this.facing * 60), this.y);
    this.comboText.setPosition(this.x, this.y - 180);
    this.damageText.setPosition(this.x, this.y - 130);
    
    this.updateAnimation(delta);
    this.updateComboDisplay();
    
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.hitstunFrames > 0) this.hitstunFrames--;
    if (this.blockstunFrames > 0) this.blockstunFrames--;
    
    if (body.touching.down) {
      this.engineChar.inAir = false;
      this.airActionsRemaining = 2;
      if (this.animState === 'jump' || this.animState === 'air_dash') {
        this.changeState('land');
        this.scene.time.delayedCall(80, () => {
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
    I: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key; // Assist call
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
  private aiAggressiveness = 0.6;
  private comboResetTimer = 0;
  
  // Assist system
  private playerAssist?: AssistConfig;
  private opponentAssist?: AssistConfig;
  private playerAssistCooldown = 0;
  private opponentAssistCooldown = 0;
  private assistCooldownMax = 8000; // 8 seconds
  private assistIndicator?: Phaser.GameObjects.Graphics;
  
  // Parallax layers
  private bgLayers: Phaser.GameObjects.TileSprite[] = [];

  constructor() {
    super({ key: 'FightingGameScene' });
  }

  init(data: {
    playerConfig: FighterConfig;
    opponentConfig: FighterConfig;
    arenaKey: string;
    playerSuperMove?: string;
    opponentSuperMove?: string;
    playerAssist?: AssistConfig;
    opponentAssist?: AssistConfig;
    onGameEnd?: (playerWon: boolean) => void;
  }) {
    if (data.playerConfig && data.opponentConfig && data.arenaKey) {
      this.playerConfig = data.playerConfig;
      this.opponentConfig = data.opponentConfig;
      this.arenaKey = data.arenaKey;
      this.playerSuperMove = data.playerSuperMove || "Divine Strike";
      this.opponentSuperMove = data.opponentSuperMove || "Dark Punishment";
      this.playerAssist = data.playerAssist;
      this.opponentAssist = data.opponentAssist;
      this.onGameEnd = data.onGameEnd;
      this.gameOver = false;
      this.projectiles = [];
      this.playerAssistCooldown = 0;
      this.opponentAssistCooldown = 0;
      this.aiCooldown = 0;
    }
  }

  preload() {
    // Note: Images are loaded dynamically in create() because 
    // the config is set in init() which runs after preload()
  }

  create() {
    if (!this.playerConfig || !this.opponentConfig) return;
    
    // Load character images dynamically
    const imagesToLoad: { key: string; url: string }[] = [];
    
    if (this.playerConfig.imageUrl) {
      const playerKey = 'fighter-' + this.playerConfig.name.replace(/\s+/g, '-').toLowerCase();
      if (!this.textures.exists(playerKey)) {
        imagesToLoad.push({ key: playerKey, url: this.playerConfig.imageUrl });
      }
    }
    if (this.opponentConfig.imageUrl) {
      const opponentKey = 'fighter-' + this.opponentConfig.name.replace(/\s+/g, '-').toLowerCase();
      if (!this.textures.exists(opponentKey)) {
        imagesToLoad.push({ key: opponentKey, url: this.opponentConfig.imageUrl });
      }
    }
    if (this.playerAssist && (this.playerAssist as any).imageUrl) {
      const assistKey = 'fighter-' + this.playerAssist.name.replace(/\s+/g, '-').toLowerCase();
      if (!this.textures.exists(assistKey)) {
        imagesToLoad.push({ key: assistKey, url: (this.playerAssist as any).imageUrl });
      }
    }
    if (this.opponentAssist && (this.opponentAssist as any).imageUrl) {
      const assistKey = 'fighter-' + this.opponentAssist.name.replace(/\s+/g, '-').toLowerCase();
      if (!this.textures.exists(assistKey)) {
        imagesToLoad.push({ key: assistKey, url: (this.opponentAssist as any).imageUrl });
      }
    }
    
    if (imagesToLoad.length > 0) {
      // Show loading text
      const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading fighters...', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Impact, sans-serif'
      }).setOrigin(0.5);
      
      // Load images dynamically
      imagesToLoad.forEach(img => {
        this.load.image(img.key, img.url);
      });
      
      this.load.once('complete', () => {
        loadingText.destroy();
        this.setupGame();
      });
      
      this.load.start();
    } else {
      this.setupGame();
    }
  }
  
  private setupGame() {
    // MvC-style parallax background
    this.createParallaxBackground();
    
    // MvC-style HUD
    this.createMvCHUD();
    
    // Ground with platform
    this.createStage();
    
    // Create fighters
    this.player = new FighterSprite(this, 250, 420, this.playerConfig, true, this.playerSuperMove);
    this.opponent = new FighterSprite(this, this.scale.width - 250, 420, this.opponentConfig, false, this.opponentSuperMove);
    this.opponent.facing = -1;
    
    // Initialize base scale for animation system
    this.player.initializeBaseScale();
    this.opponent.initializeBaseScale();

    // Input setup
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      J: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      K: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      L: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      U: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      I: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E), // Assist
    };

    // Physics collisions
    const ground = this.children.getByName('ground') as Phaser.GameObjects.Rectangle;
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.opponent, ground);
    
    // Attack collision handlers
    this.setupCombatCollisions();

    // Fight intro
    this.showFightIntro();
    
    // Booster spawns
    this.boosterTimer = this.time.addEvent({
      delay: Phaser.Math.Between(12000, 18000),
      callback: this.spawnBoosterPickup,
      callbackScope: this,
      loop: true
    });
  }

  createParallaxBackground() {
    // Far background - dark sky
    const bg1 = this.add.graphics();
    bg1.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x0d0518, 0x0d0518, 1);
    bg1.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Mid background - distant structures
    const bg2 = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      bg2.fillStyle(0x2a1a3e + i * 0x050505, 0.6);
      const height = 100 + Math.random() * 200;
      bg2.fillRect(i * 150 - 50, this.scale.height - height - 100, 80 + Math.random() * 60, height);
    }
    
    // Near background - ground details
    const bg3 = this.add.graphics();
    bg3.fillStyle(0x3a2a4e, 0.8);
    for (let i = 0; i < 15; i++) {
      bg3.fillRect(i * 80, this.scale.height - 180, 3, 80);
    }
    
    // Atmospheric particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.scale.width),
        Phaser.Math.Between(100, this.scale.height - 200),
        Phaser.Math.Between(1, 3),
        0xffffff,
        0.3
      );
      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, this.scale.width);
          particle.y = this.scale.height - 150;
          particle.alpha = 0.3;
        }
      });
    }
  }

  createMvCHUD() {
    const hudHeight = 100;
    
    // HUD background
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.85);
    hudBg.fillRect(0, 0, this.scale.width, hudHeight);
    hudBg.lineStyle(4, 0xd4af37);
    hudBg.strokeRect(5, 5, this.scale.width - 10, hudHeight - 10);
    
    // Player portrait frame
    this.createPortraitFrame(60, 50, this.playerConfig, true);
    this.createPortraitFrame(this.scale.width - 60, 50, this.opponentConfig, false);
    
    // VS emblem
    const vsText = this.add.text(this.scale.width / 2, 50, 'VS', {
      fontSize: '36px',
      color: '#d4af37',
      fontFamily: 'Impact, sans-serif',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Health bar labels
    this.add.text(130, 25, this.playerConfig.name.toUpperCase(), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000',
      strokeThickness: 3
    });
    
    this.add.text(this.scale.width - 130, 25, this.opponentConfig.name.toUpperCase(), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(1, 0);
  }

  createPortraitFrame(x: number, y: number, config: FighterConfig, isPlayer: boolean) {
    const color = config.alignment === 'Good' ? 0x3388ff : 0xff3333;
    
    // Portrait background
    const portrait = this.add.circle(x, y, 40, color, 0.8);
    portrait.setStrokeStyle(4, 0xd4af37);
    
    // Inner ring
    const innerRing = this.add.circle(x, y, 35, 0x000000, 0.3);
    
    // Try to use actual character image as portrait
    const textureKey = 'fighter-' + config.name.replace(/\s+/g, '-').toLowerCase();
    if (this.textures.exists(textureKey)) {
      // Create a circular masked portrait using the actual character image
      const portraitImg = this.add.image(x, y, textureKey);
      portraitImg.setDisplaySize(70, 70);
      
      // Create circular mask
      const maskShape = this.make.graphics({});
      maskShape.fillCircle(x, y, 32);
      const mask = maskShape.createGeometryMask();
      portraitImg.setMask(mask);
    } else {
      // Fallback to character initial
      this.add.text(x, y, config.name.charAt(0).toUpperCase(), {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Impact, sans-serif',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);
    }
  }

  createStage() {
    // Main platform
    const ground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 60,
      this.scale.width,
      120,
      0x4a3a5a
    );
    ground.setName('ground');
    this.physics.add.existing(ground, true);
    
    // Platform details
    const platformDetails = this.add.graphics();
    platformDetails.lineStyle(4, 0x6a5a7a);
    platformDetails.strokeRect(10, this.scale.height - 120, this.scale.width - 20, 4);
    platformDetails.fillStyle(0x5a4a6a);
    platformDetails.fillRect(0, this.scale.height - 60, this.scale.width, 60);
    
    // Edge highlights
    platformDetails.lineStyle(3, 0xd4af37, 0.5);
    platformDetails.strokeRect(5, this.scale.height - 118, this.scale.width - 10, 56);
  }

  setupCombatCollisions() {
    // Player attacking opponent
    this.physics.add.overlap(this.player.attackBox, this.opponent, () => {
      if (this.player.hitboxActive && this.opponent.hitstunFrames === 0) {
        const isBlocked = this.opponent.engineChar.state === 'blocking';
        const isLauncher = this.player.animState === 'launcher';
        const baseDamage = this.player.animState === 'heavy_attack' ? 15 : 
                          this.player.animState === 'launcher' ? 12 : 8;
        
        // Combo scaling
        const comboScale = Math.max(0.5, 1 - (this.player.comboCounter * 0.08));
        const damage = baseDamage * comboScale;
        
        this.opponent.takeDamage(damage, 250, isBlocked, isLauncher);
        
        if (!isBlocked) {
          this.player.comboCounter++;
          this.player.comboDamage += damage;
          this.player.engineChar.meter = Math.min(100, this.player.engineChar.meter + 6);
          this.comboResetTimer = 0;
        }
      }
    });
    
    // Opponent attacking player
    this.physics.add.overlap(this.opponent.attackBox, this.player, () => {
      if (this.opponent.hitboxActive && this.player.hitstunFrames === 0) {
        const isBlocked = this.player.engineChar.state === 'blocking';
        const damage = this.opponent.animState === 'heavy_attack' ? 15 : 8;
        this.player.takeDamage(damage, 250, isBlocked);
        
        if (!isBlocked) {
          this.opponent.comboCounter++;
          this.opponent.comboDamage += damage;
          this.opponent.engineChar.meter = Math.min(100, this.opponent.engineChar.meter + 6);
        }
      }
    });
  }

  showFightIntro() {
    // Dramatic intro sequence
    const introTexts = ['READY?', 'FIGHT!'];
    
    introTexts.forEach((text, index) => {
      this.time.delayedCall(index * 800, () => {
        const introText = this.add.text(this.scale.width / 2, this.scale.height / 2, text, {
          fontSize: '96px',
          color: index === 1 ? '#ff0000' : '#ffff00',
          fontFamily: 'Impact, sans-serif',
          stroke: '#000',
          strokeThickness: 12
        }).setOrigin(0.5);
        
        this.tweens.add({
          targets: introText,
          scale: index === 1 ? 2.5 : 1.5,
          alpha: 0,
          duration: 700,
          ease: 'Power2',
          onComplete: () => introText.destroy()
        });
        
        if (index === 1) {
          this.cameras.main.shake(200, 0.01);
        }
      });
    });
  }

  spawnBoosterPickup() {
    if (this.boosterPickup || this.gameOver) return;

    const x = Phaser.Math.Between(250, this.scale.width - 250);
    const y = this.scale.height - 200;

    const boosterGraphics = this.add.graphics();
    const boosterType = Math.random() > 0.5 ? 'spirit' : 'armor';
    const color = boosterType === 'spirit' ? 0x00ffff : 0xffd700;
    
    boosterGraphics.fillStyle(color, 0.9);
    boosterGraphics.fillCircle(0, 0, 30);
    boosterGraphics.lineStyle(5, 0xffffff, 0.8);
    boosterGraphics.strokeCircle(0, 0, 30);
    boosterGraphics.fillStyle(0xffffff, 0.5);
    boosterGraphics.fillCircle(-8, -8, 10);
    boosterGraphics.generateTexture('booster-pickup', 70, 70);
    boosterGraphics.destroy();

    this.boosterPickup = this.add.sprite(x, y, 'booster-pickup');
    this.physics.add.existing(this.boosterPickup);
    (this.boosterPickup as any).boosterType = boosterType;

    this.tweens.add({
      targets: this.boosterPickup,
      scale: 1.4,
      alpha: 0.7,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.boosterPickup,
      y: y - 30,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.physics.add.overlap(this.player, this.boosterPickup, this.collectBooster, undefined, this);
    this.physics.add.overlap(this.opponent, this.boosterPickup, this.collectBooster, undefined, this);
  }

  collectBooster(fighter: any, booster: any) {
    if (!this.boosterPickup) return;

    const boosterType = (booster as any).boosterType;
    const collectorName = fighter === this.player ? this.playerConfig.name : this.opponentConfig.name;

    if (boosterType === 'spirit') {
      fighter.engineChar.meter = Math.min(100, fighter.engineChar.meter + 60);
      this.showBoosterText(`${collectorName} +METER!`, fighter.x, fighter.y - 120, 0x00ffff);
    } else {
      fighter.engineChar.defense *= 1.4;
      this.showBoosterText(`${collectorName} +ARMOR!`, fighter.x, fighter.y - 120, 0xffd700);
      this.time.delayedCall(10000, () => {
        fighter.engineChar.defense /= 1.4;
      });
    }

    this.boosterPickup.destroy();
    this.boosterPickup = undefined;
  }

  showBoosterText(message: string, x: number, y: number, color: number) {
    const text = this.add.text(x, y, message, {
      fontSize: '36px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'Impact, sans-serif',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      scale: 1.3,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }

  update(time: number, delta: number) {
    if (this.gameOver) return;

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Combo reset timer
    this.comboResetTimer += delta;
    if (this.comboResetTimer > 1500) {
      if (this.player.comboCounter > 0) {
        this.player.comboCounter = 0;
        this.player.comboDamage = 0;
      }
      if (this.opponent.comboCounter > 0) {
        this.opponent.comboCounter = 0;
        this.opponent.comboDamage = 0;
      }
    }
    
    // Player movement
    if (!this.player.isAttacking && this.player.animState !== 'hit') {
      if (this.cursors.left.isDown) {
        playerBody.setVelocityX(-280);
        this.player.facing = -1;
        this.player.setFlipX(true);
        if (playerBody.touching.down && this.player.animState !== 'walk') {
          this.player.changeState('walk');
        }
      } else if (this.cursors.right.isDown) {
        playerBody.setVelocityX(280);
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

    // Jump (super jump with up+up)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      if (playerBody.touching.down && !this.player.isAttacking) {
        playerBody.setVelocityY(-600);
        this.player.changeState('jump');
      }
    }
    
    // Air dash
    if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
      if (this.player.engineChar.inAir) {
        this.player.airDash(this.player.facing);
      }
    }

    // Attacks
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      this.player.lightAttack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
      this.player.heavyAttack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
      this.player.launcherAttack();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.U)) {
      if (this.player.engineChar.meter >= 25) {
        this.player.specialMove('projectile');
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
      if (this.player.engineChar.meter >= 100) {
        this.player.superMove();
      }
    }
    
    // Block
    if (this.keys.L.isDown) {
      this.player.block();
    } else {
      this.player.stopBlock();
    }
    
    // Assist call
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      this.callAssist(true);
    }
    
    // Update assist cooldowns
    if (this.playerAssistCooldown > 0) {
      this.playerAssistCooldown -= delta;
    }
    if (this.opponentAssistCooldown > 0) {
      this.opponentAssistCooldown -= delta;
    }

    // AI
    this.updateAI(delta);
    
    // Update fighters
    this.player.update(delta);
    this.opponent.update(delta);
    
    // Update UI
    this.player.updateHealthBar(130, 45, 320);
    this.player.updateMeterBar(130, 72, 320);
    this.opponent.updateHealthBar(this.scale.width - 450, 45, 320);
    this.opponent.updateMeterBar(this.scale.width - 450, 72, 320);
    
    // Update assist cooldown indicators
    this.updateAssistIndicators();

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
    
    this.aiAggressiveness = 0.4 + (1 - healthPercent) * 0.4;
    
    if (!this.opponent.isAttacking && this.opponent.hitstunFrames === 0) {
      if (distance > 180) {
        if (this.opponent.x < this.player.x) {
          opponentBody.setVelocityX(220);
          this.opponent.facing = 1;
          this.opponent.setFlipX(false);
        } else {
          opponentBody.setVelocityX(-220);
          this.opponent.facing = -1;
          this.opponent.setFlipX(true);
        }
      } else if (distance < 100) {
        if (Math.random() < this.aiAggressiveness) {
          this.performAIAttack();
        } else {
          opponentBody.setVelocityX(this.opponent.x < this.player.x ? -150 : 150);
        }
      } else {
        opponentBody.setVelocityX(0);
        if (Math.random() < this.aiAggressiveness * 0.5) {
          this.performAIAttack();
        }
      }
      
      if (this.player.isAttacking && distance < 140 && Math.random() < 0.6) {
        this.opponent.block();
        this.time.delayedCall(350, () => this.opponent.stopBlock());
      }
    }
  }

  performAIAttack() {
    const meter = this.opponent.engineChar.meter;
    const rand = Math.random();
    
    // AI can call assist
    if (this.opponentAssist && this.opponentAssistCooldown <= 0 && rand < 0.15) {
      this.callAssist(false);
      this.aiCooldown = 1500;
      return;
    }
    
    if (meter >= 100 && rand < 0.12) {
      this.opponent.superMove();
      this.aiCooldown = 2500;
    } else if (meter >= 25 && rand < 0.2) {
      this.opponent.specialMove('projectile');
      this.aiCooldown = 1200;
    } else if (rand < 0.15) {
      this.opponent.launcherAttack();
      this.aiCooldown = 800;
    } else if (rand < 0.55) {
      this.opponent.lightAttack();
      this.aiCooldown = 500;
    } else {
      this.opponent.heavyAttack();
      this.aiCooldown = 900;
    }
  }

  callAssist(isPlayer: boolean) {
    const assist = isPlayer ? this.playerAssist : this.opponentAssist;
    const cooldown = isPlayer ? this.playerAssistCooldown : this.opponentAssistCooldown;
    const fighter = isPlayer ? this.player : this.opponent;
    const target = isPlayer ? this.opponent : this.player;
    
    if (!assist || cooldown > 0) return;
    
    // Set cooldown
    if (isPlayer) {
      this.playerAssistCooldown = this.assistCooldownMax;
    } else {
      this.opponentAssistCooldown = this.assistCooldownMax;
    }
    
    // Create assist character appearance
    const assistColor = assist.alignment === 'Good' ? 0x3388ff : 0xff3333;
    const startX = isPlayer ? -100 : this.scale.width + 100;
    const targetX = fighter.x + (fighter.facing * 80);
    
    // Assist character graphic
    const assistSprite = this.add.graphics();
    assistSprite.fillStyle(assistColor, 0.9);
    assistSprite.fillRoundedRect(-30, -60, 60, 120, 10);
    assistSprite.fillStyle(0xffcc99);
    assistSprite.fillCircle(0, -70, 22);
    assistSprite.lineStyle(3, 0xffffff, 0.6);
    assistSprite.strokeRoundedRect(-30, -60, 60, 120, 10);
    assistSprite.setPosition(startX, this.scale.height - 180);
    
    // Announce assist
    const assistText = this.add.text(
      this.scale.width / 2,
      200,
      `${assist.name.toUpperCase()} ASSIST!`,
      {
        fontSize: '48px',
        color: `#${assistColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'Impact, sans-serif',
        stroke: '#000',
        strokeThickness: 8
      }
    ).setOrigin(0.5);
    
    this.tweens.add({
      targets: assistText,
      alpha: 0,
      y: 150,
      duration: 1000,
      onComplete: () => assistText.destroy()
    });
    
    // Assist entry animation
    this.tweens.add({
      targets: assistSprite,
      x: targetX,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Perform assist attack based on type
        this.performAssistAttack(assist, assistSprite, target, isPlayer);
      }
    });
  }

  performAssistAttack(assist: AssistConfig, assistSprite: Phaser.GameObjects.Graphics, target: FighterSprite, isPlayer: boolean) {
    const facing = isPlayer ? this.player.facing : this.opponent.facing;
    const attackColor = assist.alignment === 'Good' ? 0x00ffff : 0xff6600;
    
    // Flash effect
    assistSprite.setAlpha(1.2);
    this.time.delayedCall(100, () => assistSprite.setAlpha(0.9));
    
    switch (assist.assistType) {
      case 'projectile':
        // Fire multiple projectiles
        for (let i = 0; i < 3; i++) {
          this.time.delayedCall(i * 100, () => {
            const proj = this.add.circle(
              assistSprite.x + (facing * 50),
              assistSprite.y - 20 + (i * 20),
              18,
              attackColor
            );
            this.physics.add.existing(proj);
            const body = proj.body as Phaser.Physics.Arcade.Body;
            body.setVelocityX(facing * 500);
            
            this.tweens.add({
              targets: proj,
              scale: 0.7,
              alpha: 0.6,
              duration: 100,
              yoyo: true,
              repeat: -1
            });
            
            // Collision check
            this.physics.add.overlap(proj, target, () => {
              const damage = assist.attack * 0.08;
              target.takeDamage(damage, 150, target.engineChar.state === 'blocking');
              proj.destroy();
            });
            
            this.time.delayedCall(1500, () => proj.destroy());
          });
        }
        break;
        
      case 'rush':
        // Rush attack - dash through
        this.tweens.add({
          targets: assistSprite,
          x: assistSprite.x + (facing * 300),
          duration: 400,
          onUpdate: () => {
            // Check collision during rush
            if (Math.abs(assistSprite.x - target.x) < 60 && Math.abs(assistSprite.y - target.y) < 80) {
              const damage = assist.attack * 0.12;
              target.takeDamage(damage, 200, target.engineChar.state === 'blocking');
            }
          }
        });
        
        // Rush trail effect
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 60, () => {
            const trail = this.add.circle(assistSprite.x, assistSprite.y, 20, attackColor, 0.5);
            this.tweens.add({
              targets: trail,
              alpha: 0,
              scale: 0.3,
              duration: 200,
              onComplete: () => trail.destroy()
            });
          });
        }
        break;
        
      case 'anti-air':
        // Rising attack
        const aaEffect = this.add.circle(assistSprite.x, assistSprite.y, 30, attackColor, 0.8);
        
        this.tweens.add({
          targets: [assistSprite, aaEffect],
          y: assistSprite.y - 200,
          duration: 400,
          ease: 'Power2',
          onUpdate: () => {
            if (Math.abs(assistSprite.x - target.x) < 80 && assistSprite.y < target.y + 50) {
              const damage = assist.attack * 0.1;
              target.takeDamage(damage, 100, target.engineChar.state === 'blocking', true);
            }
          }
        });
        
        this.tweens.add({
          targets: aaEffect,
          scale: 3,
          alpha: 0,
          duration: 500,
          onComplete: () => aaEffect.destroy()
        });
        break;
    }
    
    // Assist exit animation
    this.time.delayedCall(800, () => {
      this.tweens.add({
        targets: assistSprite,
        x: isPlayer ? -100 : this.scale.width + 100,
        alpha: 0,
        duration: 300,
        onComplete: () => assistSprite.destroy()
      });
    });
  }

  updateAssistIndicators() {
    // Create or update assist cooldown display
    if (!this.assistIndicator) {
      this.assistIndicator = this.add.graphics();
    }
    
    this.assistIndicator.clear();
    
    // Player assist indicator (bottom left)
    if (this.playerAssist) {
      const cooldownPercent = Math.max(0, 1 - (this.playerAssistCooldown / this.assistCooldownMax));
      const indicatorX = 60;
      const indicatorY = this.scale.height - 30;
      
      // Background
      this.assistIndicator.fillStyle(0x222222, 0.8);
      this.assistIndicator.fillRoundedRect(indicatorX - 50, indicatorY - 12, 100, 24, 6);
      
      // Cooldown fill
      const fillColor = cooldownPercent >= 1 ? 0x00ff00 : 0x888888;
      this.assistIndicator.fillStyle(fillColor);
      this.assistIndicator.fillRoundedRect(indicatorX - 48, indicatorY - 10, 96 * cooldownPercent, 20, 4);
      
      // Ready flash
      if (cooldownPercent >= 1) {
        this.assistIndicator.lineStyle(2, 0x00ff00, 0.8);
        this.assistIndicator.strokeRoundedRect(indicatorX - 50, indicatorY - 12, 100, 24, 6);
      }
    }
    
    // Opponent assist indicator (bottom right) 
    if (this.opponentAssist) {
      const cooldownPercent = Math.max(0, 1 - (this.opponentAssistCooldown / this.assistCooldownMax));
      const indicatorX = this.scale.width - 60;
      const indicatorY = this.scale.height - 30;
      
      this.assistIndicator.fillStyle(0x222222, 0.8);
      this.assistIndicator.fillRoundedRect(indicatorX - 50, indicatorY - 12, 100, 24, 6);
      
      const fillColor = cooldownPercent >= 1 ? 0xff6600 : 0x888888;
      this.assistIndicator.fillStyle(fillColor);
      this.assistIndicator.fillRoundedRect(indicatorX - 48, indicatorY - 10, 96 * cooldownPercent, 20, 4);
    }
  }

  endGame(playerWon: boolean) {
    this.gameOver = true;
    
    if (this.boosterTimer) this.boosterTimer.remove();
    if (this.boosterPickup) this.boosterPickup.destroy();
    this.projectiles.forEach(proj => proj.destroy());
    this.projectiles = [];
    
    // MvC-style victory screen
    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.7
    );
    
    const winnerName = playerWon ? this.playerConfig.name : this.opponentConfig.name;
    
    const winText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      playerWon ? 'K.O.!' : 'DEFEATED',
      {
        fontSize: '96px',
        color: playerWon ? '#00ff00' : '#ff0000',
        fontFamily: 'Impact, sans-serif',
        stroke: '#000',
        strokeThickness: 12
      }
    ).setOrigin(0.5);
    
    const subText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 50,
      `${winnerName.toUpperCase()} WINS`,
      {
        fontSize: '48px',
        color: '#d4af37',
        fontFamily: 'Impact, sans-serif',
        stroke: '#000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    // Victory animation
    this.tweens.add({
      targets: winText,
      scale: 1.3,
      duration: 400,
      yoyo: true,
      repeat: 2
    });
    
    this.cameras.main.shake(300, 0.02);

    this.time.delayedCall(2500, () => {
      if (this.onGameEnd) {
        this.onGameEnd(playerWon);
      }
    });
  }
}
