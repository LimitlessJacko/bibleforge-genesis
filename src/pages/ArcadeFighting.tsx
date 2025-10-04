import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Swords, Heart, Zap, Shield, Flame, Crown, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fightingEngine, 
  type CharacterState, 
  type InputBuffer, 
  type Character as EngineCharacter 
} from "@/lib/fighting-engine";
import { PhaserGame } from "@/components/PhaserGame";
import type { FighterConfig } from "@/lib/phaser-fighting-game";

// Import character images
import mosesImg from "@/assets/characters/moses.png";
import davidImg from "@/assets/characters/david.png";
import estherImg from "@/assets/characters/esther.png";
import elijahImg from "@/assets/characters/elijah.png";
import maryImg from "@/assets/characters/mary.png";
import michaelImg from "@/assets/characters/michael.png";
import pharaohImg from "@/assets/characters/pharaoh.png";
import goliathImg from "@/assets/characters/goliath.png";
import jezebelImg from "@/assets/characters/jezebel.png";
import nebuchadnezzarImg from "@/assets/characters/nebuchadnezzar.png";
import herodImg from "@/assets/characters/herod.png";
import satanImg from "@/assets/characters/satan.png";
import jesusImg from "@/assets/characters/jesus.png";
import paulImg from "@/assets/characters/paul.png";
import luciferImg from "@/assets/characters/lucifer.png";
import solomonImg from "@/assets/characters/solomon.png";
import deborahImg from "@/assets/characters/deborah.png";
import nehemiahImg from "@/assets/characters/nehemiah.png";
import judasImg from "@/assets/characters/judas.png";
import ancientOfDaysImg from "@/assets/characters/ancient-of-days.png";
import beastImg from "@/assets/characters/beast.png";

// Import booster images
import holySpiritImg from "@/assets/boosters/holy-spirit.png";
import armorOfGodImg from "@/assets/boosters/armor-of-god.png";

// Import arena images
import redSeaArena from "@/assets/arenas/red-sea.png";
import jerusalemTempleArena from "@/assets/arenas/jerusalem-temple.png";
import valleyOfElahArena from "@/assets/arenas/valley-of-elah.png";

const characterImages: { [key: string]: string } = {
  "Moses": mosesImg,
  "David": davidImg,
  "Esther": estherImg,
  "Elijah": elijahImg,
  "Mary": maryImg,
  "Michael": michaelImg,
  "Pharaoh": pharaohImg,
  "Goliath": goliathImg,
  "Jezebel": jezebelImg,
  "Nebuchadnezzar": nebuchadnezzarImg,
  "Herod": herodImg,
  "Satan": satanImg,
  "Jesus": jesusImg,
  "Paul": paulImg,
  "Lucifer": luciferImg,
  "Solomon": solomonImg,
  "Deborah": deborahImg,
  "Nehemiah": nehemiahImg,
  "Judas": judasImg,
  "Ancient of Days": ancientOfDaysImg,
  "The Beast": beastImg
};

type Booster = {
  id: string;
  name: string;
  image: string;
  effect: "speed" | "defense" | "attack";
  multiplier: number;
  description: string;
};

const boosters: Booster[] = [
  { 
    id: "boost_1", 
    name: "Holy Spirit", 
    image: holySpiritImg, 
    effect: "speed", 
    multiplier: 1.3,
    description: "Increases attack speed and meter gain"
  },
  { 
    id: "boost_2", 
    name: "Armor of God", 
    image: armorOfGodImg, 
    effect: "defense", 
    multiplier: 1.5,
    description: "Reduces damage taken significantly"
  }
];

const arenas = [
  { id: "arena_1", name: "Red Sea", image: redSeaArena },
  { id: "arena_2", name: "Jerusalem Temple", image: jerusalemTempleArena },
  { id: "arena_3", name: "Valley of Elah", image: valleyOfElahArena }
];

const characters = [
  // Good Characters
  { id: "char_0001", name: "Moses", health: 800, attack: 200, defense: 170, spirit: 450, alignment: "Good", superMove: "Plague Strike" },
  { id: "char_0002", name: "David", health: 700, attack: 220, defense: 140, spirit: 380, alignment: "Good", superMove: "Sling of Faith" },
  { id: "char_0003", name: "Esther", health: 650, attack: 180, defense: 150, spirit: 400, alignment: "Good", superMove: "Royal Decree" },
  { id: "char_0004", name: "Elijah", health: 750, attack: 240, defense: 160, spirit: 500, alignment: "Good", superMove: "Fire from Heaven" },
  { id: "char_0005", name: "Mary", health: 700, attack: 160, defense: 180, spirit: 480, alignment: "Good", superMove: "Grace Aura" },
  { id: "char_0006", name: "Michael", health: 850, attack: 260, defense: 200, spirit: 520, alignment: "Good", superMove: "Angelic Sword" },
  { id: "char_0016", name: "Solomon", health: 780, attack: 210, defense: 190, spirit: 450, alignment: "Good", superMove: "Wisdom Strike" },
  { id: "char_0017", name: "Deborah", health: 720, attack: 230, defense: 160, spirit: 430, alignment: "Good", superMove: "Judge's Verdict" },
  { id: "char_0018", name: "Nehemiah", health: 820, attack: 200, defense: 200, spirit: 410, alignment: "Good", superMove: "Wall Breaker" },
  
  // Evil Characters
  { id: "char_0007", name: "Pharaoh", health: 800, attack: 210, defense: 180, spirit: 350, alignment: "Evil", superMove: "Chariot Charge" },
  { id: "char_0008", name: "Goliath", health: 950, attack: 300, defense: 220, spirit: 250, alignment: "Evil", superMove: "Giant's Roar" },
  { id: "char_0009", name: "Jezebel", health: 700, attack: 190, defense: 150, spirit: 420, alignment: "Evil", superMove: "Wicked Curse" },
  { id: "char_0010", name: "Nebuchadnezzar", health: 850, attack: 230, defense: 200, spirit: 380, alignment: "Evil", superMove: "Furnace Rage" },
  { id: "char_0011", name: "Herod", health: 750, attack: 200, defense: 170, spirit: 340, alignment: "Evil", superMove: "Tyrant's Wrath" },
  { id: "char_0012", name: "Satan", health: 900, attack: 280, defense: 190, spirit: 550, alignment: "Evil", superMove: "Abyss Chains" },
  { id: "char_0019", name: "Judas", health: 770, attack: 220, defense: 165, spirit: 360, alignment: "Evil", superMove: "Betrayal Strike" },
  
  // Unlockable Characters
  { id: "char_0013", name: "Jesus", health: 1000, attack: 350, defense: 250, spirit: 999, alignment: "Good", unlockable: true, superMove: "Divine Radiance" },
  { id: "char_0014", name: "Paul", health: 800, attack: 270, defense: 210, spirit: 600, alignment: "Good", unlockable: true, superMove: "Gospel Thunder" },
  { id: "char_0015", name: "Lucifer", health: 950, attack: 320, defense: 230, spirit: 666, alignment: "Evil", unlockable: true, superMove: "Fallen Wings" },
  { id: "char_0020", name: "Ancient of Days", health: 1100, attack: 400, defense: 280, spirit: 999, alignment: "Good", unlockable: true, superMove: "Eternal Judgment" },
  { id: "char_0021", name: "The Beast", health: 1000, attack: 340, defense: 240, spirit: 777, alignment: "Evil", unlockable: true, superMove: "Mark of Chaos" }
];

const ArcadeFighting = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"selection" | "booster" | "arena" | "battle" | "victory">("selection");
  const [player, setPlayer] = useState<typeof characters[0] | null>(null);
  const [opponent, setOpponent] = useState<typeof characters[0] | null>(null);
  const [playerBooster, setPlayerBooster] = useState<Booster | null>(null);
  const [selectedArena, setSelectedArena] = useState<typeof arenas[0] | null>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [playerSpirit, setPlayerSpirit] = useState(100);
  const [playerMeter, setPlayerMeter] = useState(0);
  const [opponentMeter, setOpponentMeter] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [canComboBreak, setCanComboBreak] = useState(false);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  
  // Engine state
  const [playerEngine, setPlayerEngine] = useState<EngineCharacter | null>(null);
  const [opponentEngine, setOpponentEngine] = useState<EngineCharacter | null>(null);
  const inputBufferRef = useRef<InputBuffer>(fightingEngine.createInputBuffer());
  const lastHitTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number>();
  
  // Load unlocked characters and wins from localStorage
  useEffect(() => {
    const savedUnlocks = localStorage.getItem('spiritualWarfare_unlocks');
    const savedWins = localStorage.getItem('spiritualWarfare_wins');
    if (savedUnlocks) setUnlockedCharacters(JSON.parse(savedUnlocks));
    if (savedWins) setWins(parseInt(savedWins));
  }, []);
  
  // Gamepad support
  useEffect(() => {
    const handleGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];
      
      if (gamepad && gameState === "battle") {
        // Button 0 (A/Cross) - Light Attack
        if (gamepad.buttons[0]?.pressed) lightAttack();
        // Button 1 (B/Circle) - Heavy Attack
        if (gamepad.buttons[1]?.pressed) heavyAttack();
        // Button 2 (X/Square) - Launcher
        if (gamepad.buttons[2]?.pressed) launcherAttack();
        // Button 3 (Y/Triangle) - Combo Breaker
        if (gamepad.buttons[3]?.pressed) comboBreaker();
        // Button 5 (RB/R1) - Hyper Combo
        if (gamepad.buttons[5]?.pressed) hyperCombo();
      }
    };
    
    const interval = setInterval(handleGamepad, 100);
    return () => clearInterval(interval);
  }, [gameState, playerMeter, canComboBreak]);

  // Combo timer effect
  useEffect(() => {
    return () => {
      if (comboTimer) clearTimeout(comboTimer);
    };
  }, [comboTimer]);
  
  // Track highest combo
  useEffect(() => {
    if (comboCount > highestCombo) {
      setHighestCombo(comboCount);
    }
  }, [comboCount, highestCombo]);

  const selectCharacter = (char: typeof characters[0], isPlayer: boolean) => {
    // Check if character is locked
    if (char.unlockable && !unlockedCharacters.includes(char.id)) {
      toast({
        title: "Character Locked",
        description: `Win ${char.alignment === "Good" ? "10" : "15"} battles to unlock ${char.name}!`,
        variant: "destructive"
      });
      return;
    }
    
    if (isPlayer) {
      setPlayer(char);
      setPlayerHP(100);
      setPlayerSpirit(100);
      setPlayerMeter(0);
    } else {
      setOpponent(char);
      setOpponentHP(100);
      setOpponentMeter(0);
    }
  };
  
  const proceedToBoosterSelection = () => {
    if (player && opponent) {
      setGameState("booster");
    }
  };
  
  const proceedToArenaSelection = () => {
    setGameState("arena");
  };

  const startBattle = () => {
    if (player && opponent && selectedArena) {
      setGameState("battle");
      setComboCount(0);
      setHighestCombo(0);
      setBattleLog([`${player.name} vs ${opponent.name} - FIGHT!`]);
      
      toast({
        title: "FIGHT!",
        description: `${player.name} vs ${opponent.name}`,
        duration: 2000
      });
    }
  };

  // Main game loop using requestAnimationFrame
  const startGameLoop = () => {
    const gameLoop = () => {
      if (gameState === "battle" && playerEngine && opponentEngine) {
        updateGameState();
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Stop game loop
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update game state each frame
  const updateGameState = () => {
    if (!playerEngine || !opponentEngine) return;

    // Update physics and states
    fightingEngine.updatePhysics(playerEngine);
    fightingEngine.updatePhysics(opponentEngine);
    fightingEngine.updateState(playerEngine);
    fightingEngine.updateState(opponentEngine);

    // Update facing direction
    if (playerEngine.position.x < opponentEngine.position.x) {
      playerEngine.facing = "right";
      opponentEngine.facing = "left";
    } else {
      playerEngine.facing = "left";
      opponentEngine.facing = "right";
    }

    // Combo reset check
    fightingEngine.checkComboReset(
      playerEngine, 
      Date.now() - lastHitTimeRef.current
    );

    // Sync with React state
    setPlayerHP(Math.max(0, playerEngine.health));
    setOpponentHP(Math.max(0, opponentEngine.health));
    setPlayerMeter(playerEngine.meter);
    setOpponentMeter(opponentEngine.meter);
    setComboCount(playerEngine.comboCount);

    // Check win conditions
    if (playerEngine.health <= 0 || opponentEngine.health <= 0) {
      finishBattle(playerEngine.health > 0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    // Update engines in state
    setPlayerEngine({...playerEngine});
    setOpponentEngine({...opponentEngine});
  };

  const resetCombo = () => {
    if (comboCount > 0) {
      setBattleLog(prev => [...prev, `Combo broken! ${comboCount} hits`]);
    }
    setComboCount(0);
    setCanComboBreak(false);
  };

  const addComboHit = () => {
    setComboCount(prev => prev + 1);
    const meterGain = playerBooster?.effect === "speed" ? 12 : 8;
    setPlayerMeter(prev => Math.min(100, prev + meterGain));
    
    if (comboTimer) clearTimeout(comboTimer);
    const timer = setTimeout(resetCombo, 2000);
    setComboTimer(timer);

    if (comboCount >= 2) {
      setCanComboBreak(true);
    }
  };

  const lightAttack = useCallback(() => {
    if (!playerEngine || !opponentEngine || gameState !== "battle") return;
    if (playerEngine.state !== "idle" && playerEngine.state !== "walking") return;

    // Add input to buffer
    fightingEngine.addInput(inputBufferRef.current, "light");

    // Check for special move
    if (fightingEngine.checkSpecialMove(inputBufferRef.current)) {
      specialMove();
      return;
    }

    playerEngine.state = "light_attack";
    playerEngine.currentFrame = 0;

    // Process hit
    setTimeout(() => {
      if (!playerEngine || !opponentEngine) return;
      
      const hitResult = fightingEngine.processHit(
        playerEngine,
        opponentEngine,
        opponentEngine.state === "blocking"
      );

      if (hitResult) {
        lastHitTimeRef.current = Date.now();
        const comboText = hitResult.comboCount > 1 ? ` (${hitResult.comboCount} HIT COMBO!)` : "";
        setBattleLog(prev => [...prev.slice(-5), 
          `${player?.name} light attack! ${Math.floor(hitResult.damage)} damage${comboText}`
        ]);
      }
    }, 100);
  }, [playerEngine, opponentEngine, gameState, player]);

  const heavyAttack = useCallback(() => {
    if (!playerEngine || !opponentEngine || gameState !== "battle") return;
    if (playerEngine.state !== "idle" && playerEngine.state !== "walking") return;

    fightingEngine.addInput(inputBufferRef.current, "heavy");

    playerEngine.state = "heavy_attack";
    playerEngine.currentFrame = 0;

    setTimeout(() => {
      if (!playerEngine || !opponentEngine) return;
      
      const hitResult = fightingEngine.processHit(
        playerEngine,
        opponentEngine,
        opponentEngine.state === "blocking"
      );

      if (hitResult) {
        lastHitTimeRef.current = Date.now();
        setBattleLog(prev => [...prev.slice(-5), 
          `${player?.name} HEAVY STRIKE! ${Math.floor(hitResult.damage)} damage!`
        ]);
      }

      // AI counter
      setTimeout(() => opponentAIAction(), 800);
    }, 200);
  }, [playerEngine, opponentEngine, gameState, player]);

  const launcherAttack = useCallback(() => {
    if (!playerEngine || !opponentEngine || gameState !== "battle") return;
    if (playerEngine.state !== "idle" && playerEngine.state !== "walking") return;

    playerEngine.state = "launcher";
    playerEngine.currentFrame = 0;

    setTimeout(() => {
      if (!playerEngine || !opponentEngine) return;
      
      const hitResult = fightingEngine.processHit(
        playerEngine,
        opponentEngine,
        opponentEngine.state === "blocking"
      );

      if (hitResult) {
        lastHitTimeRef.current = Date.now();
        setBattleLog(prev => [...prev.slice(-5), 
          `${player?.name} LAUNCHER! ${Math.floor(hitResult.damage)} damage! Air combo ready!`
        ]);
        toast({
          title: "LAUNCHER!",
          description: "Follow up with more attacks!",
          duration: 1500
        });
      }
    }, 250);
  }, [playerEngine, opponentEngine, gameState, player]);

  const comboBreaker = useCallback(() => {
    if (!canComboBreak || playerMeter < 20) return;

    setPlayerMeter(prev => prev - 20);
    resetCombo();
    setBattleLog(prev => [...prev, `${player.name} COMBO BREAKER! Opponent's combo stopped!`]);
    toast({ title: "C-C-C-COMBO BREAKER!", description: "Combo interrupted!" });
  }, [canComboBreak, playerMeter, player]);

  const specialMove = useCallback(() => {
    if (!playerEngine || !opponentEngine || gameState !== "battle") return;
    if (playerEngine.meter < 30) {
      toast({ title: "Not enough meter!", variant: "destructive", duration: 1000 });
      return;
    }

    playerEngine.state = "special_move";
    playerEngine.currentFrame = 0;
    playerEngine.meter -= 30;

    setTimeout(() => {
      if (!playerEngine || !opponentEngine) return;
      
      const hitResult = fightingEngine.processHit(
        playerEngine,
        opponentEngine,
        opponentEngine.state === "blocking"
      );

      if (hitResult) {
        lastHitTimeRef.current = Date.now();
        const superMoveName = player?.superMove || "SPECIAL MOVE";
        setBattleLog(prev => [...prev.slice(-5), 
          `${player?.name} ${superMoveName}! ${Math.floor(hitResult.damage)} damage!`
        ]);
        toast({
          title: `⚡ ${superMoveName}!`,
          description: `${player?.name} unleashes their signature move!`,
          duration: 1500
        });
      }
    }, 300);
  }, [playerEngine, opponentEngine, gameState, player]);

  const hyperCombo = useCallback(() => {
    if (!playerEngine || !opponentEngine || gameState !== "battle") return;
    if (playerEngine.meter < 100) {
      toast({ title: "Need full meter!", variant: "destructive", duration: 1000 });
      return;
    }

    playerEngine.state = "special_move";
    playerEngine.currentFrame = 0;
    playerEngine.meter = 0;

    // Multiple hits
    const hyperHits = [0, 150, 300, 450];
    hyperHits.forEach((delay) => {
      setTimeout(() => {
        if (!playerEngine || !opponentEngine) return;
        
        const hitResult = fightingEngine.processHit(
          playerEngine,
          opponentEngine,
          false // Hyper combos are unblockable
        );

        if (hitResult) {
          lastHitTimeRef.current = Date.now();
        }
      }, delay);
    });

    const superMoveName = player?.superMove || "HYPER COMBO";
    setBattleLog(prev => [...prev.slice(-5), 
      `${player?.name} ${superMoveName}!!! ULTIMATE ATTACK!`
    ]);
    
    toast({ 
      title: `🔥 ${superMoveName}! 🔥`, 
      description: `${player?.name} unleashes ultimate power!`,
      className: "text-xl font-bold"
    });
  }, [playerEngine, opponentEngine, gameState, player]);

  const opponentAIAction = () => {
    if (!opponentEngine || !playerEngine || gameState !== "battle") return;
    if (opponentEngine.state !== "idle") return;

    // Simple AI logic
    const distance = Math.abs(playerEngine.position.x - opponentEngine.position.x);
    const random = Math.random();

    if (distance < 80) {
      // Close range - attack
      if (random > 0.7) {
        opponentEngine.state = "heavy_attack";
      } else {
        opponentEngine.state = "light_attack";
      }
      opponentEngine.currentFrame = 0;

      setTimeout(() => {
        if (!playerEngine || !opponentEngine) return;
        
        const hitResult = fightingEngine.processHit(
          opponentEngine,
          playerEngine,
          playerEngine.state === "blocking"
        );

        if (hitResult) {
          setBattleLog(prev => [...prev.slice(-5), 
            `${opponent?.name} attacks! ${Math.floor(hitResult.damage)} damage!`
          ]);
        }
      }, 150);
    } else if (distance < 150 && random > 0.8) {
      // Mid range - special or launcher
      if (opponentEngine.meter > 40) {
        opponentEngine.state = "special_move";
        opponentEngine.meter -= 30;
      } else {
        opponentEngine.state = "launcher";
      }
      opponentEngine.currentFrame = 0;
    }
  };

  const finishBattle = (playerWon: boolean) => {
    setGameState("victory");
    
    // Update wins and check for unlocks
    if (playerWon) {
      const newWins = wins + 1;
      setWins(newWins);
      localStorage.setItem('spiritualWarfare_wins', newWins.toString());
      
      // Check for character unlocks
      const newUnlocks = [...unlockedCharacters];
      let unlockedNewChar = false;
      
      if (newWins >= 5 && !newUnlocks.includes("char_0006")) {
        newUnlocks.push("char_0006"); // Michael
        unlockedNewChar = true;
        toast({ title: "🎉 NEW CHARACTER UNLOCKED!", description: "Michael is now available!", className: "text-2xl font-bold" });
      }
      if (newWins >= 10 && !newUnlocks.includes("char_0013")) {
        newUnlocks.push("char_0013"); // Jesus
        unlockedNewChar = true;
        toast({ title: "🎉 NEW CHARACTER UNLOCKED!", description: "Jesus is now available!", className: "text-2xl font-bold" });
      }
      if (newWins >= 10 && !newUnlocks.includes("char_0014")) {
        newUnlocks.push("char_0014"); // Paul
        unlockedNewChar = true;
        toast({ title: "🎉 NEW CHARACTER UNLOCKED!", description: "Paul is now available!", className: "text-2xl font-bold" });
      }
      if (newWins >= 15 && !newUnlocks.includes("char_0015")) {
        newUnlocks.push("char_0015"); // Lucifer
        unlockedNewChar = true;
        toast({ title: "🎉 NEW CHARACTER UNLOCKED!", description: "Lucifer is now available!", className: "text-2xl font-bold" });
      }
      if (newWins >= 20 && !newUnlocks.includes("char_0020")) {
        newUnlocks.push("char_0020"); // Ancient of Days
        unlockedNewChar = true;
        toast({ title: "🎉 LEGENDARY CHARACTER UNLOCKED!", description: "Ancient of Days has been revealed!", className: "text-2xl font-bold" });
      }
      if (opponent?.name === "Lucifer" && playerWon && !newUnlocks.includes("char_0021")) {
        newUnlocks.push("char_0021"); // The Beast (unlock by defeating Lucifer)
        unlockedNewChar = true;
        toast({ title: "🎉 SECRET CHARACTER UNLOCKED!", description: "The Beast has been unleashed!", className: "text-2xl font-bold" });
      }
      
      if (unlockedNewChar) {
        setUnlockedCharacters(newUnlocks);
        localStorage.setItem('spiritualWarfare_unlocks', JSON.stringify(newUnlocks));
      }
    }
    
    if (playerWon && highestCombo >= 10) {
      toast({ 
        title: "ULTRA COMBO!!!", 
        description: `${player?.name} achieves a ${highestCombo} hit Ultra Combo victory!`,
        className: "text-2xl font-bold"
      });
    } else {
      toast({ 
        title: playerWon ? "Victory!" : "Defeat", 
        description: playerWon ? `${player?.name} wins!` : `${opponent?.name} wins!`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-glow">
          Spiritual Warfare
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          2D Arcade Fighting • {wins} Wins
        </p>

        {gameState === "selection" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Select Your Warrior</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {characters.map((char) => (
                  <Card
                    key={char.id}
                    className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 group ${
                      player?.id === char.id ? "ring-4 ring-primary shadow-[0_0_30px_rgba(var(--primary),0.6)]" : ""
                    } ${char.alignment === "Evil" ? "border-destructive/50" : "border-primary/50"} ${
                      char.unlockable ? "border-accent/70 shadow-[0_0_20px_rgba(var(--accent),0.4)]" : ""
                    }`}
                    onClick={() => selectCharacter(char, true)}
                    style={{
                      background: char.alignment === "Evil" 
                        ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0.3))" 
                        : "linear-gradient(135deg, rgba(var(--primary),0.1), rgba(0,0,0,0.2))"
                    }}
                  >
                    {/* Character Image with animation */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={characterImages[char.name]}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 animate-[float_3s_ease-in-out_infinite]"
                        style={{
                          filter: player?.id === char.id 
                            ? "brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(var(--primary),0.6))" 
                            : "brightness(0.9)",
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${
                        char.alignment === "Evil" 
                          ? "from-destructive/80 via-destructive/20 to-transparent" 
                          : "from-primary/80 via-primary/20 to-transparent"
                      } group-hover:opacity-90 transition-opacity`} />
                      
                      {/* Unlockable badge */}
                      {char.unlockable && (
                        <Badge className="absolute top-2 left-2 bg-accent/90 animate-pulse text-xs shadow-lg">
                          🔒 UNLOCKABLE
                        </Badge>
                      )}
                    </div>

                    {/* Character Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={char.alignment === "Good" ? "default" : "destructive"} className="text-xs">
                          {char.alignment}
                        </Badge>
                        {player?.id === char.id && (
                          <Badge className="bg-primary animate-pulse">SELECTED</Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-center text-lg">{char.name}</h3>
                       <div className="text-xs space-y-1 pt-2 border-t border-border">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">ATK:</span>
                           <span className="font-semibold">{char.attack}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">DEF:</span>
                           <span className="font-semibold">{char.defense}</span>
                         </div>
                         {char.superMove && (
                           <div className="flex flex-col pt-1 border-t border-border/50">
                             <span className="text-muted-foreground">Super:</span>
                             <span className="font-semibold text-accent text-[10px]">{char.superMove}</span>
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className={`absolute inset-0 ${
                        char.alignment === "Evil" 
                          ? "shadow-[inset_0_0_30px_rgba(239,68,68,0.3)]" 
                          : "shadow-[inset_0_0_30px_rgba(var(--primary),0.3)]"
                      }`} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Select Opponent</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {characters.map((char) => (
                  <Card
                    key={char.id}
                    className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 group ${
                      opponent?.id === char.id ? "ring-4 ring-destructive shadow-[0_0_30px_rgba(239,68,68,0.6)]" : ""
                    } ${char.alignment === "Evil" ? "border-destructive/50" : "border-primary/50"} ${
                      char.unlockable ? "border-accent/70 shadow-[0_0_20px_rgba(var(--accent),0.4)]" : ""
                    }`}
                    onClick={() => selectCharacter(char, false)}
                    style={{
                      background: char.alignment === "Evil" 
                        ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0.3))" 
                        : "linear-gradient(135deg, rgba(var(--primary),0.1), rgba(0,0,0,0.2))"
                    }}
                  >
                    {/* Character Image with animation */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={characterImages[char.name]}
                        alt={char.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 animate-[float_3s_ease-in-out_infinite]"
                        style={{
                          filter: opponent?.id === char.id 
                            ? "brightness(1.2) contrast(1.1) drop-shadow(0 0 10px rgba(239,68,68,0.6))" 
                            : "brightness(0.9)",
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${
                        char.alignment === "Evil" 
                          ? "from-destructive/80 via-destructive/20 to-transparent" 
                          : "from-primary/80 via-primary/20 to-transparent"
                      } group-hover:opacity-90 transition-opacity`} />
                      
                      {/* Unlockable badge */}
                      {char.unlockable && (
                        <Badge className="absolute top-2 left-2 bg-accent/90 animate-pulse text-xs shadow-lg">
                          🔒 UNLOCKABLE
                        </Badge>
                      )}
                    </div>

                    {/* Character Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={char.alignment === "Good" ? "default" : "destructive"} className="text-xs">
                          {char.alignment}
                        </Badge>
                        {opponent?.id === char.id && (
                          <Badge className="bg-destructive animate-pulse">SELECTED</Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-center text-lg">{char.name}</h3>
                       <div className="text-xs space-y-1 pt-2 border-t border-border">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">ATK:</span>
                           <span className="font-semibold">{char.attack}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">DEF:</span>
                           <span className="font-semibold">{char.defense}</span>
                         </div>
                         {char.superMove && (
                           <div className="flex flex-col pt-1 border-t border-border/50">
                             <span className="text-muted-foreground">Super:</span>
                             <span className="font-semibold text-accent text-[10px]">{char.superMove}</span>
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className={`absolute inset-0 ${
                        char.alignment === "Evil" 
                          ? "shadow-[inset_0_0_30px_rgba(239,68,68,0.3)]" 
                          : "shadow-[inset_0_0_30px_rgba(var(--primary),0.3)]"
                      }`} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {player && opponent && (
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={proceedToBoosterSelection} className="text-lg px-8 animate-pulse">
                  <Sparkles className="mr-2 h-5 w-5" /> SELECT BOOSTER
                </Button>
              </div>
            )}
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              Total Wins: <span className="font-bold text-primary">{wins}</span>
              {wins < 5 && <p className="mt-2">Win {5 - wins} more battles to unlock Michael!</p>}
              {wins >= 5 && wins < 10 && <p className="mt-2">Win {10 - wins} more battles to unlock Jesus & Paul!</p>}
              {wins >= 10 && wins < 15 && <p className="mt-2">Win {15 - wins} more battles to unlock Lucifer!</p>}
              {wins >= 15 && wins < 20 && <p className="mt-2">Win {20 - wins} more battles to unlock Ancient of Days!</p>}
              {wins >= 20 && <p className="mt-2 text-accent">🌟 Defeat Lucifer to unlock The Beast!</p>}
            </div>
            
            {/* Controls Info */}
            <Card className="max-w-2xl mx-auto p-6 bg-background/50">
              <h3 className="font-bold text-center mb-4">⌨️ Controls & 🎮 Gamepad</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Gamepad (Auto-detected):</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• A/Cross - Light Attack</li>
                    <li>• B/Circle - Heavy Attack</li>
                    <li>• X/Square - Launcher</li>
                    <li>• Y/Triangle - Combo Breaker</li>
                    <li>• RB/R1 - Hyper Combo</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Keyboard & Mouse:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Click buttons to attack</li>
                    <li>• Select characters with mouse</li>
                    <li>• Choose boosters & arenas</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {gameState === "booster" && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-semibold text-center text-glow">Select Your Booster</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card
                className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${
                  !playerBooster ? "ring-4 ring-primary" : "opacity-50"
                }`}
                onClick={() => setPlayerBooster(null)}
              >
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">🚫</div>
                  <h3 className="text-xl font-bold mb-2">No Booster</h3>
                  <p className="text-sm text-muted-foreground">Fight with raw skill</p>
                </div>
              </Card>
              
              {boosters.map((booster) => (
                <Card
                  key={booster.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${
                    playerBooster?.id === booster.id ? "ring-4 ring-primary shadow-glow-divine" : ""
                  }`}
                  onClick={() => setPlayerBooster(booster)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={booster.image}
                      alt={booster.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-bold text-center">{booster.name}</h3>
                    <Badge className="w-full justify-center">{booster.effect.toUpperCase()} +{Math.floor((booster.multiplier - 1) * 100)}%</Badge>
                    <p className="text-sm text-muted-foreground text-center">{booster.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setGameState("selection")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button size="lg" onClick={proceedToArenaSelection} className="text-lg px-8">
                <Crown className="mr-2 h-5 w-5" /> SELECT ARENA
              </Button>
            </div>
          </div>
        )}

        {gameState === "arena" && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-semibold text-center text-glow">Choose Your Battlefield</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {arenas.map((arena) => (
                <Card
                  key={arena.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${
                    selectedArena?.id === arena.id ? "ring-4 ring-primary shadow-glow-divine" : ""
                  }`}
                  onClick={() => setSelectedArena(arena)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={arena.image}
                      alt={arena.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{arena.name}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setGameState("booster")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                size="lg" 
                onClick={startBattle} 
                disabled={!selectedArena}
                className="text-lg px-8 animate-pulse"
              >
                <Swords className="mr-2 h-5 w-5" /> START BATTLE
              </Button>
            </div>
          </div>
        )}

        {gameState === "battle" && player && opponent && selectedArena && (
          <div className="space-y-6">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">{player.name}</h3>
                <Badge variant={player.alignment === "Good" ? "default" : "destructive"}>
                  {player.alignment}
                </Badge>
              </div>
              <div className="text-4xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-destructive mb-2">{opponent.name}</h3>
                <Badge variant={opponent.alignment === "Good" ? "default" : "destructive"}>
                  {opponent.alignment}
                </Badge>
              </div>
            </div>

            <PhaserGame
              playerConfig={{
                name: player.name,
                health: player.health,
                attack: player.attack,
                defense: player.defense,
                speed: 5,
                jumpPower: 12,
                spriteKey: player.id,
                alignment: player.alignment as 'Good' | 'Evil'
              }}
              opponentConfig={{
                name: opponent.name,
                health: opponent.health,
                attack: opponent.attack,
                defense: opponent.defense,
                speed: 4,
                jumpPower: 10,
                spriteKey: opponent.id,
                alignment: opponent.alignment as 'Good' | 'Evil'
              }}
              arenaKey={selectedArena.id}
              onGameEnd={finishBattle}
              playerSuperMove={player.superMove}
              opponentSuperMove={opponent.superMove}
            />

            <div className="text-center">
              <Button variant="outline" onClick={() => {
                setGameState("selection");
                setPlayer(null);
                setOpponent(null);
                setSelectedArena(null);
                setPlayerBooster(null);
              }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
              </Button>
            </div>
          </div>
        )}

        {/* Remove the old battle UI - keeping victory screen */}
        {gameState === "victory" && false && player && opponent && selectedArena && (
          <div 
            className="max-w-5xl mx-auto space-y-6 relative p-6 rounded-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${selectedArena.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Arena Name Badge */}
            <div className="absolute top-2 right-2">
              <Badge className="bg-background/90 text-lg px-4 py-2">
                <Crown className="mr-2 h-4 w-4" /> {selectedArena.name}
              </Badge>
            </div>
            
            {/* Gamepad indicator */}
            {navigator.getGamepads && navigator.getGamepads()[0] && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-accent/90 text-xs px-3 py-1 animate-pulse">
                  🎮 Gamepad Connected
                </Badge>
              </div>
            )}
            
            {/* Booster indicator */}
            {playerBooster && (
              <div className="text-center">
                <Badge className="bg-primary/90 text-sm px-4 py-2 shadow-glow-divine">
                  <Sparkles className="mr-2 h-4 w-4 inline" />
                  {playerBooster.name} Active
                </Badge>
              </div>
            )}
            {/* Combo Counter */}
            {comboCount > 0 && (
              <div className="text-center">
                <div className="inline-block animate-bounce">
                  <Badge className="text-3xl px-6 py-2 bg-gradient-to-r from-primary to-accent">
                    {comboCount} HIT COMBO!
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-primary/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-primary">{player.name}</h3>
                  <Badge variant={player.alignment === "Good" ? "default" : "destructive"}>
                    {player.alignment}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Health</span>
                      <span className="font-bold">{Math.floor(playerHP)}%</span>
                    </div>
                    <Progress value={playerHP} className="h-4" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Spirit</span>
                      <span className="font-bold">{Math.floor(playerSpirit)}%</span>
                    </div>
                    <Progress value={playerSpirit} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Flame className="h-4 w-4" /> Hyper Meter
                      </span>
                      <span className="font-bold text-accent">{Math.floor(playerMeter)}%</span>
                    </div>
                    <Progress value={playerMeter} className="h-3 [&>div]:bg-accent" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-destructive/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-destructive">{opponent.name}</h3>
                  <Badge variant={opponent.alignment === "Good" ? "default" : "destructive"}>
                    {opponent.alignment}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Health</span>
                      <span className="font-bold">{Math.floor(opponentHP)}%</span>
                    </div>
                    <Progress value={opponentHP} className="h-4" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Flame className="h-4 w-4" /> Hyper Meter
                      </span>
                      <span className="font-bold text-accent">{Math.floor(opponentMeter)}%</span>
                    </div>
                    <Progress value={opponentMeter} className="h-3 [&>div]:bg-accent" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Control Panel */}
            <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5">
              <h3 className="text-lg font-bold mb-4 text-center">Combat Controls</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Basic Attacks</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={lightAttack} variant="outline" className="w-full">
                      <Swords className="mr-2 h-4 w-4" /> Light
                    </Button>
                    <Button onClick={heavyAttack} variant="outline" className="w-full">
                      <Swords className="mr-2 h-4 w-4" /> Heavy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Special Moves</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={launcherAttack} variant="secondary" className="w-full">
                      <Zap className="mr-2 h-4 w-4" /> Launcher
                    </Button>
                    <Button 
                      onClick={comboBreaker} 
                      variant="destructive"
                      disabled={!canComboBreak || playerMeter < 20}
                      className="w-full"
                    >
                      <Shield className="mr-2 h-4 w-4" /> Break (20)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={hyperCombo}
                  disabled={playerMeter < 100}
                  size="lg"
                  className="text-lg px-8 bg-gradient-to-r from-accent to-primary hover:scale-105 transition-transform"
                >
                  <Flame className="mr-2 h-5 w-5" /> HYPER COMBO (100)
                </Button>
              </div>
            </Card>

            <Card className="p-4 max-h-64 overflow-y-auto bg-black/20">
              <h3 className="font-semibold mb-2 text-accent">Battle Log</h3>
              <div className="space-y-1 text-sm font-mono">
                {battleLog.slice().reverse().map((log, i) => (
                  <p key={i} className={`${log.includes('COMBO') || log.includes('HYPER') ? 'text-accent font-bold' : 'text-muted-foreground'}`}>
                    {log}
                  </p>
                ))}
              </div>
            </Card>
          </div>
        )}

        {gameState === "victory" && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className={`text-6xl font-bold ${playerHP > 0 ? 'text-primary' : 'text-destructive'}`}>
              {playerHP > 0 ? "🏆 VICTORY! 🏆" : "💀 DEFEAT 💀"}
            </div>
            
            {playerHP > 0 && highestCombo >= 10 && (
              <div className="text-4xl font-bold text-accent animate-pulse">
                ⚡ ULTRA COMBO FINISH! ⚡
              </div>
            )}

            <Card className="max-w-2xl mx-auto p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Winner</p>
                    <p className="text-2xl font-bold">{playerHP > 0 ? player?.name : opponent?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Highest Combo</p>
                    <p className="text-2xl font-bold text-accent">{highestCombo} hits</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Wins</p>
                    <p className="text-2xl font-bold text-primary">{wins}</p>
                  </div>
                </div>
                
                {playerBooster && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Booster Used</p>
                    <Badge className="text-base px-4 py-2">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {playerBooster.name}
                    </Badge>
                  </div>
                )}
                
                {playerHP > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Unlock Progress</p>
                    <div className="space-y-2">
                      {wins < 10 && (
                        <p className="text-sm">
                          <span className="font-bold">{10 - wins}</span> more wins to unlock Jesus & Paul
                        </p>
                      )}
                      {wins >= 10 && wins < 15 && (
                        <p className="text-sm">
                          <span className="font-bold">{15 - wins}</span> more wins to unlock Lucifer
                        </p>
                      )}
                      {wins >= 15 && (
                        <p className="text-sm font-bold text-accent">All characters unlocked! 🎉</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => {
                setGameState("selection");
                setPlayer(null);
                setOpponent(null);
                setPlayerBooster(null);
                setSelectedArena(null);
                setBattleLog([]);
                setComboCount(0);
                setHighestCombo(0);
              }}>
                Fight Again
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                Return Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArcadeFighting;
