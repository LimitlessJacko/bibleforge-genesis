import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Swords, Heart, Zap, Shield, Flame } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const characters = [
  { id: "char_0001", name: "Michael", health: 800, attack: 220, defense: 150, spirit: 400, alignment: "Good" },
  { id: "char_0002", name: "David", health: 700, attack: 180, defense: 120, spirit: 350, alignment: "Good" },
  { id: "char_0003", name: "Deborah", health: 650, attack: 190, defense: 130, spirit: 380, alignment: "Good" },
  { id: "char_0004", name: "Solomon", health: 650, attack: 130, defense: 140, spirit: 380, alignment: "Good" },
  { id: "char_0005", name: "Jesus", health: 1000, attack: 250, defense: 200, spirit: 600, alignment: "Good" },
  { id: "char_0006", name: "Nehemiah", health: 720, attack: 160, defense: 240, spirit: 320, alignment: "Good" },
  { id: "char_0007", name: "Satan", health: 950, attack: 240, defense: 180, spirit: 580, alignment: "Evil" },
  { id: "char_0008", name: "Goliath", health: 900, attack: 280, defense: 220, spirit: 200, alignment: "Evil" },
  { id: "char_0009", name: "Jezebel", health: 680, attack: 170, defense: 140, spirit: 420, alignment: "Evil" },
  { id: "char_0010", name: "Pharaoh", health: 820, attack: 200, defense: 190, spirit: 300, alignment: "Evil" },
  { id: "char_0011", name: "Judas", health: 650, attack: 210, defense: 110, spirit: 250, alignment: "Evil" },
  { id: "char_0012", name: "Herod", health: 750, attack: 180, defense: 160, spirit: 280, alignment: "Evil" },
  { id: "char_0013", name: "The Ancient of Days", health: 9999, attack: 999, defense: 999, spirit: 9999, alignment: "Good", unlockable: true },
  { id: "char_0014", name: "Elijah", health: 850, attack: 320, defense: 200, spirit: 750, alignment: "Good", unlockable: true },
  { id: "char_0015", name: "The Beast", health: 1200, attack: 350, defense: 280, spirit: 666, alignment: "Evil", unlockable: true }
];

const ArcadeFighting = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"selection" | "battle" | "victory">("selection");
  const [player, setPlayer] = useState<typeof characters[0] | null>(null);
  const [opponent, setOpponent] = useState<typeof characters[0] | null>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [playerSpirit, setPlayerSpirit] = useState(100);
  const [playerMeter, setPlayerMeter] = useState(0);
  const [opponentMeter, setOpponentMeter] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [canComboBreak, setCanComboBreak] = useState(false);

  // Combo timer effect
  useEffect(() => {
    return () => {
      if (comboTimer) clearTimeout(comboTimer);
    };
  }, [comboTimer]);

  const selectCharacter = (char: typeof characters[0], isPlayer: boolean) => {
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

  const startBattle = () => {
    if (player && opponent) {
      setGameState("battle");
      setComboCount(0);
      setPlayerMeter(0);
      setOpponentMeter(0);
      setBattleLog([`${player.name} vs ${opponent.name} - FIGHT!`]);
    }
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
    setPlayerMeter(prev => Math.min(100, prev + 8));
    
    if (comboTimer) clearTimeout(comboTimer);
    const timer = setTimeout(resetCombo, 2000);
    setComboTimer(timer);

    if (comboCount >= 2) {
      setCanComboBreak(true);
    }
  };

  const lightAttack = () => {
    if (!player || !opponent || gameState !== "battle") return;

    const baseDamage = Math.floor((player.attack / opponent.defense) * (Math.random() * 8 + 5));
    const comboMultiplier = 1 + (comboCount * 0.15);
    const damage = Math.floor(baseDamage * comboMultiplier);
    
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);
    addComboHit();
    
    const comboText = comboCount > 0 ? ` (${comboCount + 1} HIT COMBO!)` : "";
    setBattleLog(prev => [...prev, `${player.name} light attack! ${damage} damage${comboText}`]);

    if (newOpponentHP <= 0) {
      finishBattle(true);
      return;
    }

    if (comboCount === 0) {
      setTimeout(() => opponentCounterAttack(), 1000);
    }
  };

  const heavyAttack = () => {
    if (!player || !opponent || gameState !== "battle") return;

    const baseDamage = Math.floor((player.attack / opponent.defense) * (Math.random() * 15 + 20));
    const comboMultiplier = 1 + (comboCount * 0.2);
    const damage = Math.floor(baseDamage * comboMultiplier);
    
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);
    setPlayerMeter(prev => Math.min(100, prev + 12));
    
    resetCombo();
    setBattleLog(prev => [...prev, `${player.name} HEAVY STRIKE! ${damage} damage!`]);

    if (newOpponentHP <= 0) {
      finishBattle(true);
      return;
    }

    setTimeout(() => opponentCounterAttack(), 1200);
  };

  const launcherAttack = () => {
    if (!player || !opponent || gameState !== "battle") return;

    const damage = Math.floor((player.attack / opponent.defense) * (Math.random() * 12 + 15));
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);
    setPlayerMeter(prev => Math.min(100, prev + 10));
    
    setBattleLog(prev => [...prev, `${player.name} LAUNCHER! ${damage} damage! Air combo ready!`]);
    
    // Enables additional air combo hits
    addComboHit();
    addComboHit();

    if (newOpponentHP <= 0) {
      finishBattle(true);
    }
  };

  const comboBreaker = () => {
    if (!canComboBreak || playerMeter < 20) return;

    setPlayerMeter(prev => prev - 20);
    resetCombo();
    setBattleLog(prev => [...prev, `${player.name} COMBO BREAKER! Opponent's combo stopped!`]);
    toast({ title: "C-C-C-COMBO BREAKER!", description: "Combo interrupted!" });
  };

  const hyperCombo = () => {
    if (!player || !opponent || gameState !== "battle" || playerMeter < 100) return;

    const damage = Math.floor((player.attack + player.spirit) * (Math.random() * 0.8 + 1.2));
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);
    setPlayerMeter(0);
    resetCombo();
    
    setBattleLog(prev => [...prev, `${player.name} HYPER COMBO!!! MASSIVE ${damage} DAMAGE!`]);
    toast({ 
      title: "🔥 HYPER COMBO! 🔥", 
      description: `${player.name} unleashes ultimate power!`,
      className: "text-xl font-bold"
    });

    if (newOpponentHP <= 0) {
      finishBattle(true);
    }
  };

  const opponentCounterAttack = () => {
    if (!opponent || !player || gameState !== "battle") return;

    const counterDamage = Math.floor((opponent.attack / player.defense) * (Math.random() * 15 + 10));
    const newPlayerHP = Math.max(0, playerHP - counterDamage);
    setPlayerHP(newPlayerHP);
    setOpponentMeter(prev => Math.min(100, prev + 10));
    setBattleLog(prev => [...prev, `${opponent.name} counter! ${counterDamage} damage!`]);

    if (newPlayerHP <= 0) {
      finishBattle(false);
    }
  };

  const finishBattle = (playerWon: boolean) => {
    setGameState("victory");
    if (playerWon && comboCount >= 10) {
      toast({ 
        title: "ULTRA COMBO!!!", 
        description: `${player?.name} achieves a ${comboCount} hit Ultra Combo victory!`,
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

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-glow">
          Arcade Fighting
        </h1>

        {gameState === "selection" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Select Your Warrior</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {characters.map((char) => (
                  <Card
                    key={char.id}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      player?.id === char.id ? "ring-2 ring-primary shadow-glow" : ""
                    } ${char.alignment === "Evil" ? "border-destructive/50" : "border-primary/50"} ${
                      char.unlockable ? "border-accent/70 shadow-[0_0_20px_rgba(var(--accent),0.4)]" : ""
                    }`}
                    onClick={() => selectCharacter(char, true)}
                  >
                    {char.unlockable && (
                      <Badge className="mb-2 w-full bg-accent/90 animate-pulse text-xs">
                        🔒 UNLOCKABLE
                      </Badge>
                    )}
                    <Badge className="mb-2" variant={char.alignment === "Good" ? "default" : "destructive"}>
                      {char.alignment}
                    </Badge>
                    <h3 className="font-bold text-center mb-2">{char.name}</h3>
                    <div className="text-xs space-y-1">
                      <p className="text-muted-foreground">ATK: {char.attack}</p>
                      <p className="text-muted-foreground">DEF: {char.defense}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Select Opponent</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {characters.map((char) => (
                  <Card
                    key={char.id}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      opponent?.id === char.id ? "ring-2 ring-destructive shadow-glow" : ""
                    } ${char.alignment === "Evil" ? "border-destructive/50" : "border-primary/50"} ${
                      char.unlockable ? "border-accent/70 shadow-[0_0_20px_rgba(var(--accent),0.4)]" : ""
                    }`}
                    onClick={() => selectCharacter(char, false)}
                  >
                    {char.unlockable && (
                      <Badge className="mb-2 w-full bg-accent/90 animate-pulse text-xs">
                        🔒 UNLOCKABLE
                      </Badge>
                    )}
                    <Badge className="mb-2" variant={char.alignment === "Good" ? "default" : "destructive"}>
                      {char.alignment}
                    </Badge>
                    <h3 className="font-bold text-center mb-2">{char.name}</h3>
                    <div className="text-xs space-y-1">
                      <p className="text-muted-foreground">ATK: {char.attack}</p>
                      <p className="text-muted-foreground">DEF: {char.defense}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {player && opponent && (
              <div className="flex justify-center">
                <Button size="lg" onClick={startBattle} className="text-lg px-8 animate-pulse">
                  <Swords className="mr-2 h-5 w-5" /> START BATTLE
                </Button>
              </div>
            )}
          </div>
        )}

        {gameState === "battle" && player && opponent && (
          <div className="max-w-5xl mx-auto space-y-6">
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
            
            {playerHP > 0 && comboCount >= 10 && (
              <div className="text-4xl font-bold text-accent animate-pulse">
                ⚡ ULTRA COMBO FINISH! ⚡
              </div>
            )}

            <Card className="max-w-md mx-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Winner</p>
                    <p className="text-xl font-bold">{playerHP > 0 ? player?.name : opponent?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Highest Combo</p>
                    <p className="text-xl font-bold text-accent">{comboCount} hits</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => {
                setGameState("selection");
                setPlayer(null);
                setOpponent(null);
                setBattleLog([]);
                setComboCount(0);
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
