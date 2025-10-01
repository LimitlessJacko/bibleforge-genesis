// Fighting Game Engine - Core Systems
// Inspired by Sakuga Engine architecture

export type CharacterState = 
  | "idle" 
  | "walking" 
  | "crouching"
  | "jumping"
  | "light_attack"
  | "heavy_attack"
  | "special_move"
  | "blocking"
  | "hit_stun"
  | "block_stun"
  | "knockdown"
  | "launcher"
  | "air_combo";

export type InputButton = 
  | "light" 
  | "heavy" 
  | "special" 
  | "block" 
  | "up" 
  | "down" 
  | "left" 
  | "right";

export interface FrameData {
  startup: number;      // Frames before attack becomes active
  active: number;       // Frames the attack is active
  recovery: number;     // Frames after attack before returning to neutral
  damage: number;       // Base damage
  meterGain: number;    // Meter gained on hit
  blockable: boolean;   // Can this attack be blocked
  knockback: number;    // Horizontal knockback force
  juggleState?: boolean; // Can juggle opponent
  cancelable?: boolean;  // Can cancel into other moves
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Character {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  state: CharacterState;
  health: number;
  meter: number;
  frameData: Map<CharacterState, FrameData>;
  currentFrame: number;
  stunFrames: number;
  facing: "left" | "right";
  inAir: boolean;
  canAirDash: boolean;
  comboCount: number;
  hitstop: number; // Frames to freeze on hit
}

export interface InputBuffer {
  inputs: Array<{ button: InputButton; timestamp: number }>;
  maxSize: number;
  windowMs: number;
}

export class FightingEngine {
  private gravity = 0.5;
  private groundY = 400;
  private walkSpeed = 3;
  private dashSpeed = 8;
  private jumpForce = -12;
  private airDashSpeed = 10;

  // Frame data for different attacks
  getDefaultFrameData(): Map<CharacterState, FrameData> {
    const frameData = new Map<CharacterState, FrameData>();
    
    frameData.set("light_attack", {
      startup: 3,
      active: 4,
      recovery: 8,
      damage: 8,
      meterGain: 8,
      blockable: true,
      knockback: 5,
      cancelable: true
    });

    frameData.set("heavy_attack", {
      startup: 8,
      active: 6,
      recovery: 16,
      damage: 20,
      meterGain: 12,
      blockable: true,
      knockback: 15,
      cancelable: false
    });

    frameData.set("special_move", {
      startup: 12,
      active: 8,
      recovery: 20,
      damage: 30,
      meterGain: 20,
      blockable: true,
      knockback: 25,
      cancelable: false
    });

    frameData.set("launcher", {
      startup: 10,
      active: 6,
      recovery: 18,
      damage: 15,
      meterGain: 15,
      blockable: true,
      knockback: 10,
      juggleState: true,
      cancelable: true
    });

    return frameData;
  }

  // Input buffer system
  createInputBuffer(): InputBuffer {
    return {
      inputs: [],
      maxSize: 10,
      windowMs: 200
    };
  }

  addInput(buffer: InputBuffer, button: InputButton): void {
    const now = Date.now();
    buffer.inputs.push({ button, timestamp: now });
    
    // Remove old inputs
    buffer.inputs = buffer.inputs.filter(
      input => now - input.timestamp < buffer.windowMs
    );
    
    // Maintain max size
    if (buffer.inputs.length > buffer.maxSize) {
      buffer.inputs.shift();
    }
  }

  // Check for special move inputs (e.g., quarter circle forward + attack)
  checkSpecialMove(buffer: InputBuffer): boolean {
    if (buffer.inputs.length < 3) return false;
    
    const recent = buffer.inputs.slice(-4);
    const hasQCF = recent.some((input, i) => 
      i < recent.length - 2 &&
      input.button === "down" &&
      recent[i + 1]?.button === "right" &&
      (recent[i + 2]?.button === "light" || recent[i + 2]?.button === "heavy")
    );
    
    return hasQCF;
  }

  // Physics update
  updatePhysics(char: Character): void {
    // Apply gravity
    if (char.position.y < this.groundY || char.inAir) {
      char.velocity.y += this.gravity;
      char.inAir = true;
    }

    // Update position
    char.position.x += char.velocity.x;
    char.position.y += char.velocity.y;

    // Ground collision
    if (char.position.y >= this.groundY) {
      char.position.y = this.groundY;
      char.velocity.y = 0;
      char.inAir = false;
      char.canAirDash = true;
    }

    // Apply friction
    if (!char.inAir && char.state === "idle") {
      char.velocity.x *= 0.8;
    }
  }

  // State machine update
  updateState(char: Character): void {
    char.currentFrame++;

    // Handle hitstop (freeze frames)
    if (char.hitstop > 0) {
      char.hitstop--;
      return;
    }

    // Handle stun frames
    if (char.stunFrames > 0) {
      char.stunFrames--;
      if (char.stunFrames === 0) {
        char.state = "idle";
        char.currentFrame = 0;
      }
      return;
    }

    // Check frame data for current state
    const frameData = char.frameData.get(char.state);
    if (!frameData) return;

    const totalFrames = frameData.startup + frameData.active + frameData.recovery;
    
    if (char.currentFrame >= totalFrames) {
      // Attack finished, return to idle
      char.state = "idle";
      char.currentFrame = 0;
    }
  }

  // Collision detection
  checkCollision(attackerBox: Hitbox, defenderBox: Hitbox): boolean {
    return !(
      attackerBox.x + attackerBox.width < defenderBox.x ||
      attackerBox.x > defenderBox.x + defenderBox.width ||
      attackerBox.y + attackerBox.height < defenderBox.y ||
      attackerBox.y > defenderBox.y + defenderBox.height
    );
  }

  // Hit detection and response
  processHit(
    attacker: Character,
    defender: Character,
    isBlocked: boolean
  ): { damage: number; meterGain: number; comboCount: number } | null {
    const frameData = attacker.frameData.get(attacker.state);
    if (!frameData) return null;

    // Check if attack is in active frames
    const inActiveFrames = 
      attacker.currentFrame >= frameData.startup &&
      attacker.currentFrame < frameData.startup + frameData.active;

    if (!inActiveFrames) return null;

    let damage = frameData.damage;
    const meterGain = frameData.meterGain;

    if (isBlocked && frameData.blockable) {
      // Blocked - reduced damage and block stun
      damage *= 0.2;
      defender.state = "block_stun";
      defender.stunFrames = Math.floor(frameData.active * 1.5);
      defender.comboCount = 0;
    } else {
      // Hit confirmed
      damage *= (1 + attacker.comboCount * 0.1); // Combo scaling
      defender.state = "hit_stun";
      defender.stunFrames = frameData.active + 8;
      
      // Apply knockback
      const knockbackDir = attacker.facing === "right" ? 1 : -1;
      defender.velocity.x = frameData.knockback * knockbackDir;
      
      // Juggle state
      if (frameData.juggleState) {
        defender.velocity.y = -8;
        defender.inAir = true;
      }

      attacker.comboCount++;
    }

    // Hitstop for impact feel
    attacker.hitstop = 3;
    defender.hitstop = 3;

    defender.health -= damage;
    attacker.meter = Math.min(100, attacker.meter + meterGain);

    return { 
      damage, 
      meterGain, 
      comboCount: attacker.comboCount 
    };
  }

  // Reset combo when hit doesn't connect in time
  checkComboReset(char: Character, timeSinceLastHit: number): void {
    if (timeSinceLastHit > 1000 && char.comboCount > 0) {
      char.comboCount = 0;
    }
  }

  // Create character with default values
  createCharacter(
    stats: { health: number; attack: number; defense: number }
  ): Omit<Character, "frameData"> {
    return {
      position: { x: 0, y: this.groundY },
      velocity: { x: 0, y: 0 },
      state: "idle",
      health: 100,
      meter: 0,
      currentFrame: 0,
      stunFrames: 0,
      facing: "right",
      inAir: false,
      canAirDash: true,
      comboCount: 0,
      hitstop: 0
    };
  }
}

export const fightingEngine = new FightingEngine();
