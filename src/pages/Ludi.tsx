import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Dices, Trophy, Users, Swords, Shield, Zap, Crown } from "lucide-react";

type PlayerColor = "righteous" | "faithful" | "redeemed" | "sanctified";
type PiecePosition = number; // -1 = home, 0-51 = board path, 52-57 = final stretch

interface Piece {
  id: number;
  position: PiecePosition;
  isHome: boolean;
  isFinished: boolean;
}

interface Player {
  color: PlayerColor;
  pieces: Piece[];
  isAI: boolean;
  name: string;
}

const SPIRITUAL_THEMES = {
  righteous: { 
    name: "Righteous Warriors",
    icon: Swords,
    bg: "bg-gradient-to-br from-red-600 to-red-800", 
    border: "border-red-400", 
    text: "text-red-400",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.5)]"
  },
  faithful: { 
    name: "Faithful Servants",
    icon: Shield,
    bg: "bg-gradient-to-br from-blue-600 to-blue-800", 
    border: "border-blue-400", 
    text: "text-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]"
  },
  redeemed: { 
    name: "Redeemed Souls",
    icon: Zap,
    bg: "bg-gradient-to-br from-green-600 to-green-800", 
    border: "border-green-400", 
    text: "text-green-400",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.5)]"
  },
  sanctified: { 
    name: "Sanctified Saints",
    icon: Crown,
    bg: "bg-gradient-to-br from-yellow-600 to-yellow-800", 
    border: "border-yellow-400", 
    text: "text-yellow-400",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.5)]"
  },
};

const PLAYER_STARTS = { righteous: 0, redeemed: 13, sanctified: 26, faithful: 39 };
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47]; // Holy Ground

export default function Ludi() {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [numHumanPlayers, setNumHumanPlayers] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [canMove, setCanMove] = useState(false);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  useEffect(() => {
    checkUnlockStatus();
  }, []);

  const checkUnlockStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to play Ludi");
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("wins")
      .eq("id", user.id)
      .single();

    if (!profile || profile.wins < 5) {
      toast.error("Unlock Ludi by winning 5 Arcade Fighting matches!");
      navigate("/");
    }
  };

  const initializeGame = (humanCount: number) => {
    const colors: PlayerColor[] = ["righteous", "faithful", "redeemed", "sanctified"];
    const initialPlayers: Player[] = colors.map((color, index) => ({
      color,
      pieces: createPieces(),
      isAI: index >= humanCount,
      name: index >= humanCount ? `AI ${SPIRITUAL_THEMES[color].name}` : `Player ${index + 1}`,
    }));
    setPlayers(initialPlayers);
    setGameStarted(true);
  };

  const startGame = (humanCount: number) => {
    setNumHumanPlayers(humanCount);
    initializeGame(humanCount);
  };

  const createPieces = (): Piece[] => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      position: -1,
      isHome: true,
      isFinished: false,
    }));
  };

  const rollDice = () => {
    if (isRolling || !players.length || winner || hasRolled) return;
    
    setIsRolling(true);
    setHasRolled(true);
    const value = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      setDiceValue(value);
      setIsRolling(false);
      
      if (value === 6) {
        setConsecutiveSixes(prev => prev + 1);
        if (consecutiveSixes >= 2) {
          toast.warning("Three 6's in a row! Turn skipped!");
          nextTurn();
          return;
        }
      } else {
        setConsecutiveSixes(0);
      }
      
      checkMovablePieces(value);
    }, 500);
  };

  const checkMovablePieces = (dice: number) => {
    const currentPlayer = players[currentPlayerIndex];
    const movable = currentPlayer.pieces.some(piece => 
      canPieceMove(piece, dice, currentPlayer.color)
    );
    
    setCanMove(movable);
    
    if (!movable) {
      toast.info("No valid moves!");
      setTimeout(nextTurn, 1000);
    }
  };

  const canPieceMove = (piece: Piece, dice: number, color: PlayerColor): boolean => {
    if (piece.isFinished) return false;
    if (piece.isHome) return dice === 6;
    
    const newPos = piece.position + dice;
    const startPos = PLAYER_STARTS[color];
    const finalStretchStart = (startPos + 50) % 52;
    
    if (piece.position < 52 && newPos >= 52) {
      return newPos <= 57;
    }
    
    return newPos <= 57;
  };

  const movePiece = (pieceId: number) => {
    if (!canMove || !diceValue || winner) return;
    
    const currentPlayer = players[currentPlayerIndex];
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    
    if (!piece || !canPieceMove(piece, diceValue, currentPlayer.color)) {
      toast.error("Invalid move!");
      return;
    }
    
    const newPlayers = [...players];
    const playerPiece = newPlayers[currentPlayerIndex].pieces[pieceId];
    
    if (playerPiece.isHome && diceValue === 6) {
      playerPiece.position = PLAYER_STARTS[currentPlayer.color];
      playerPiece.isHome = false;
      toast.success("Piece entered the board!");
    } else {
      const newPos = playerPiece.position + diceValue;
      
      if (newPos === 57) {
        playerPiece.position = 57;
        playerPiece.isFinished = true;
        toast.success("Piece reached home!");
      } else if (newPos < 57) {
        playerPiece.position = newPos;
        
        if (newPos < 52 && !SAFE_SPOTS.includes(newPos)) {
          captureOpponentPieces(newPos, currentPlayerIndex, newPlayers);
        }
      }
    }
    
    setPlayers(newPlayers);
    setCanMove(false);
    
    if (checkWinner(newPlayers[currentPlayerIndex])) {
      setWinner(currentPlayer.color);
      toast.success(`${currentPlayer.name} wins! 🎉`);
      return;
    }
    
    if (diceValue !== 6) {
      setTimeout(nextTurn, 1000);
    } else {
      setHasRolled(false);
      setDiceValue(null);
    }
  };

  const captureOpponentPieces = (position: number, attackerIndex: number, allPlayers: Player[]) => {
    allPlayers.forEach((player, pIndex) => {
      if (pIndex !== attackerIndex) {
        player.pieces.forEach(piece => {
          if (piece.position === position && !piece.isHome && !piece.isFinished) {
            piece.position = -1;
            piece.isHome = true;
            toast.warning(`${player.name}'s piece captured!`);
          }
        });
      }
    });
  };

  const checkWinner = (player: Player): boolean => {
    return player.pieces.every(piece => piece.isFinished);
  };

  const nextTurn = () => {
    setDiceValue(null);
    setCanMove(false);
    setSelectedPieceId(null);
    setHasRolled(false);
    setConsecutiveSixes(0);
    
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    
    setTimeout(() => {
      if (players[nextIndex]?.isAI) {
        performAIMove();
      }
    }, 1000);
  };

  const performAIMove = () => {
    if (winner) return;
    
    setIsRolling(true);
    const dice = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      setDiceValue(dice);
      setIsRolling(false);
      
      const currentPlayer = players[currentPlayerIndex];
      const movablePieces = currentPlayer.pieces.filter(piece => 
        canPieceMove(piece, dice, currentPlayer.color)
      );
      
      if (movablePieces.length > 0) {
        const randomPiece = movablePieces[Math.floor(Math.random() * movablePieces.length)];
        setTimeout(() => movePiece(randomPiece.id), 800);
      } else {
        setTimeout(nextTurn, 1000);
      }
    }, 1000);
  };

  const renderBoard = () => {
    return (
      <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-background via-card to-background border-4 border-primary rounded-lg shadow-2xl glow-divine">
        {/* Home areas in corners - Spiritual Camps */}
        <div className={`absolute top-0 left-0 w-[40%] h-[40%] ${SPIRITUAL_THEMES.righteous.bg} border-4 ${SPIRITUAL_THEMES.righteous.border} rounded-tl-lg ${SPIRITUAL_THEMES.righteous.glow}`}>
          {renderHomeArea("righteous")}
        </div>
        <div className={`absolute top-0 right-0 w-[40%] h-[40%] ${SPIRITUAL_THEMES.faithful.bg} border-4 ${SPIRITUAL_THEMES.faithful.border} rounded-tr-lg ${SPIRITUAL_THEMES.faithful.glow}`}>
          {renderHomeArea("faithful")}
        </div>
        <div className={`absolute bottom-0 left-0 w-[40%] h-[40%] ${SPIRITUAL_THEMES.redeemed.bg} border-4 ${SPIRITUAL_THEMES.redeemed.border} rounded-bl-lg ${SPIRITUAL_THEMES.redeemed.glow}`}>
          {renderHomeArea("redeemed")}
        </div>
        <div className={`absolute bottom-0 right-0 w-[40%] h-[40%] ${SPIRITUAL_THEMES.sanctified.bg} border-4 ${SPIRITUAL_THEMES.sanctified.border} rounded-br-lg ${SPIRITUAL_THEMES.sanctified.glow}`}>
          {renderHomeArea("sanctified")}
        </div>
        
        {/* Center - Throne of Glory */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-primary via-secondary to-accent border-4 border-secondary rounded-full flex items-center justify-center animate-pulse-glow">
          <Trophy className="w-12 h-12 text-primary-foreground" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>
    );
  };

  const renderHomeArea = (color: PlayerColor) => {
    const player = players.find(p => p.color === color);
    if (!player) return null;
    
    const Icon = SPIRITUAL_THEMES[color].icon;
    
    return (
      <div className="grid grid-cols-2 gap-2 p-4 h-full">
        {player.pieces.map(piece => (
          piece.isHome && (
            <button
              key={piece.id}
              onClick={() => movePiece(piece.id)}
              disabled={!canMove || diceValue !== 6}
              className={`
                bg-background/90
                rounded-full 
                border-4 ${SPIRITUAL_THEMES[color].border}
                aspect-square
                transition-all
                flex items-center justify-center
                ${canMove && diceValue === 6 ? 'hover:scale-110 cursor-pointer animate-pulse ' + SPIRITUAL_THEMES[color].glow : 'opacity-70'}
              `}
            >
              <Icon className={`w-6 h-6 ${SPIRITUAL_THEMES[color].text}`} />
            </button>
          )
        ))}
      </div>
    );
  };

  // Setup Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <Button onClick={() => navigate("/")} variant="outline" size="lg">
              <Home className="mr-2" /> Back to Home
            </Button>
            <h1 className="text-5xl font-bold text-secondary text-glow">
              ⚔️ Spiritual Ludi Battle 🛡️
            </h1>
            <div className="w-32" />
          </div>

          <Card className="p-8 bg-card border-primary glow-divine">
            <h2 className="text-3xl font-bold text-center mb-6 text-primary">
              Choose Your Warriors
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Select how many human players will join the spiritual battle
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((count) => (
                <Card
                  key={count}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
                    numHumanPlayers === count ? 'border-primary glow-divine' : 'border-border'
                  }`}
                  onClick={() => setNumHumanPlayers(count)}
                >
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">{count} Player{count > 1 ? 's' : ''}</h3>
                    <p className="text-sm text-muted-foreground">
                      {4 - count} AI Opponent{4 - count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-primary">Spiritual Forces:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(SPIRITUAL_THEMES) as PlayerColor[]).map((color) => {
                  const theme = SPIRITUAL_THEMES[color];
                  const Icon = theme.icon;
                  return (
                    <div key={color} className={`p-4 rounded-lg ${theme.bg} ${theme.glow} border-2 ${theme.border}`}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-white" />
                        <span className="text-lg font-bold text-white">{theme.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => startGame(numHumanPlayers)}
              size="lg"
              className="w-full text-xl py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Swords className="mr-2" />
              Begin Spiritual Battle
              <Shield className="ml-2" />
            </Button>
          </Card>

          <Card className="mt-6 p-6 bg-card/50 border-accent">
            <h4 className="font-bold mb-3 text-accent">Divine Rules:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Roll 6 to deploy your spiritual warriors</li>
              <li>• Land on enemies to send them back to camp</li>
              <li>• Holy Ground (safe spots) protects your warriors</li>
              <li>• Guide all 4 warriors to the Throne to win</li>
              <li>• Roll 6 to receive another divine turn</li>
              <li>• Three 6's in a row = turn skipped by divine intervention!</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  if (!players.length) return null;

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => navigate("/")} variant="outline" size="lg">
            <Home className="mr-2" /> Back to Home
          </Button>
          <h1 className="text-5xl font-bold text-secondary text-glow">
            ⚔️ Spiritual Ludi Battle 🛡️
          </h1>
          <div className="w-32" />
        </div>

        {winner && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-primary to-secondary border-4 border-secondary animate-bounce glow-divine">
            <h2 className="text-3xl font-bold text-center text-primary-foreground flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10" />
              {players.find(p => p.color === winner)?.name} Achieves Victory!
              <Trophy className="w-10 h-10" />
            </h2>
          </Card>
        )}

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Game Board */}
          <div className="flex items-center justify-center">
            {renderBoard()}
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <Card className={`p-6 border-4 ${SPIRITUAL_THEMES[currentPlayer.color].border} ${SPIRITUAL_THEMES[currentPlayer.color].glow}`}>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                {(() => {
                  const Icon = SPIRITUAL_THEMES[currentPlayer.color].icon;
                  return <Icon className={SPIRITUAL_THEMES[currentPlayer.color].text} />;
                })()}
                Current Turn: {currentPlayer.name}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={rollDice}
                    disabled={isRolling || winner !== null || currentPlayer.isAI || hasRolled}
                    size="lg"
                    className="w-full h-24 text-2xl font-bold"
                  >
                    {isRolling ? (
                      <Dices className="animate-spin" />
                    ) : (
                      <>
                        <Dices className="mr-2" />
                        {diceValue ? diceValue : "Roll Dice"}
                      </>
                    )}
                  </Button>
                </div>

                {diceValue && (
                  <div className="text-center p-4 bg-card rounded-lg border-4 border-primary glow-divine">
                    <div className="text-6xl font-bold animate-bounce text-secondary">
                      {diceValue}
                    </div>
                    {diceValue === 6 && (
                      <p className="text-sm text-primary mt-2 font-bold">Divine Favor!</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Players Status */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-bold mb-4 text-primary">Warrior Status</h3>
              <div className="space-y-3">
                {players.map((player, index) => {
                  const Icon = SPIRITUAL_THEMES[player.color].icon;
                  return (
                    <div
                      key={player.color}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${index === currentPlayerIndex ? 'ring-4 ring-primary ' + SPIRITUAL_THEMES[player.color].glow : ''}
                        ${SPIRITUAL_THEMES[player.color].border}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${SPIRITUAL_THEMES[player.color].bg} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold">{player.name}</span>
                        </div>
                        <div className="text-sm font-bold text-primary">
                          {player.pieces.filter(p => p.isFinished).length}/4
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-accent">
              <h4 className="font-bold mb-2 text-accent">Divine Rules:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Roll 6 to deploy warriors</li>
                <li>• Capture enemies on contact</li>
                <li>• Holy Ground = safe zones</li>
                <li>• All 4 warriors home = victory</li>
                <li>• Roll 6 = extra turn</li>
                <li>• Three 6's = divine skip!</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
