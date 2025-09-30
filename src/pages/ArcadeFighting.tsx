import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Swords, Heart, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const characters = [
  { id: "char_0001", name: "Michael", health: 800, attack: 220, defense: 150, spirit: 400 },
  { id: "char_0002", name: "David", health: 700, attack: 180, defense: 120, spirit: 350 },
  { id: "char_0003", name: "Deborah", health: 650, attack: 190, defense: 130, spirit: 380 },
  { id: "char_0004", name: "Solomon", health: 650, attack: 130, defense: 140, spirit: 380 },
  { id: "char_0005", name: "Jesus", health: 1000, attack: 250, defense: 200, spirit: 600 },
  { id: "char_0006", name: "Nehemiah", health: 720, attack: 160, defense: 240, spirit: 320 }
];

const ArcadeFighting = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"selection" | "battle" | "victory">("selection");
  const [player, setPlayer] = useState<typeof characters[0] | null>(null);
  const [opponent, setOpponent] = useState<typeof characters[0] | null>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [playerSpirit, setPlayerSpirit] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const selectCharacter = (char: typeof characters[0], isPlayer: boolean) => {
    if (isPlayer) {
      setPlayer(char);
      setPlayerHP(100);
      setPlayerSpirit(100);
    } else {
      setOpponent(char);
      setOpponentHP(100);
    }
  };

  const startBattle = () => {
    if (player && opponent) {
      setGameState("battle");
      setBattleLog([`${player.name} vs ${opponent.name} - Fight begins!`]);
    }
  };

  const attack = () => {
    if (!player || !opponent || gameState !== "battle") return;

    const damage = Math.floor((player.attack / opponent.defense) * (Math.random() * 20 + 10));
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);
    setBattleLog(prev => [...prev, `${player.name} attacks for ${damage} damage!`]);

    if (newOpponentHP <= 0) {
      setGameState("victory");
      toast({ title: "Victory!", description: `${player.name} wins the battle!` });
      return;
    }

    // Opponent counter-attack
    setTimeout(() => {
      const counterDamage = Math.floor((opponent.attack / player.defense) * (Math.random() * 20 + 10));
      const newPlayerHP = Math.max(0, playerHP - counterDamage);
      setPlayerHP(newPlayerHP);
      setBattleLog(prev => [...prev, `${opponent.name} counters for ${counterDamage} damage!`]);

      if (newPlayerHP <= 0) {
        setGameState("victory");
        toast({ title: "Defeat", description: `${opponent.name} wins the battle!` });
      }
    }, 800);
  };

  const spiritAttack = () => {
    if (!player || !opponent || gameState !== "battle" || playerSpirit < 30) return;

    const damage = Math.floor((player.spirit / 2) * (Math.random() * 0.3 + 0.8));
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);
    setPlayerSpirit(prev => prev - 30);
    setBattleLog(prev => [...prev, `${player.name} unleashes Spirit Attack for ${damage} damage!`]);

    if (newOpponentHP <= 0) {
      setGameState("victory");
      toast({ title: "Victory!", description: `${player.name} wins the battle!` });
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
              <h2 className="text-2xl font-semibold mb-4 text-center">Select Your Character</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {characters.map((char) => (
                  <Card
                    key={char.id}
                    className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                      player?.id === char.id ? "ring-2 ring-primary shadow-glow" : ""
                    }`}
                    onClick={() => selectCharacter(char, true)}
                  >
                    <h3 className="font-bold text-center mb-2">{char.name}</h3>
                    <p className="text-sm text-muted-foreground text-center">ATK: {char.attack}</p>
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
                    }`}
                    onClick={() => selectCharacter(char, false)}
                  >
                    <h3 className="font-bold text-center mb-2">{char.name}</h3>
                    <p className="text-sm text-muted-foreground text-center">ATK: {char.attack}</p>
                  </Card>
                ))}
              </div>
            </div>

            {player && opponent && (
              <div className="flex justify-center">
                <Button size="lg" onClick={startBattle} className="text-lg px-8">
                  <Swords className="mr-2 h-5 w-5" /> Start Battle
                </Button>
              </div>
            )}
          </div>
        )}

        {gameState === "battle" && player && opponent && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-primary">{player.name}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span>{Math.floor(playerHP)}%</span>
                    </div>
                    <Progress value={playerHP} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spirit</span>
                      <span>{Math.floor(playerSpirit)}%</span>
                    </div>
                    <Progress value={playerSpirit} className="h-3" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 text-destructive">{opponent.name}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span>{Math.floor(opponentHP)}%</span>
                    </div>
                    <Progress value={opponentHP} className="h-3" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={attack}>
                <Heart className="mr-2 h-5 w-5" /> Attack
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={spiritAttack}
                disabled={playerSpirit < 30}
              >
                <Zap className="mr-2 h-5 w-5" /> Spirit Attack (30 SP)
              </Button>
            </div>

            <Card className="p-4 max-h-48 overflow-y-auto">
              <h3 className="font-semibold mb-2">Battle Log</h3>
              <div className="space-y-1 text-sm">
                {battleLog.map((log, i) => (
                  <p key={i} className="text-muted-foreground">{log}</p>
                ))}
              </div>
            </Card>
          </div>
        )}

        {gameState === "victory" && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">
              {playerHP > 0 ? "Victory!" : "Defeat"}
            </h2>
            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setGameState("selection");
                setPlayer(null);
                setOpponent(null);
                setBattleLog([]);
              }}>
                Play Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
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
