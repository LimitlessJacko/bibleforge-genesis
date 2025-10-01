import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Dices, Trophy, Users } from "lucide-react";

type PlayerColor = "red" | "blue" | "green" | "yellow";
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

const COLORS = {
  red: { bg: "bg-red-500", border: "border-red-600", text: "text-red-500" },
  blue: { bg: "bg-blue-500", border: "border-blue-600", text: "text-blue-500" },
  green: { bg: "bg-green-500", border: "border-green-600", text: "text-green-500" },
  yellow: { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-yellow-500" },
};

const PLAYER_STARTS = { red: 0, green: 13, yellow: 26, blue: 39 };
const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

export default function Ludi() {
  const navigate = useNavigate();
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
    initializeGame();
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

  const initializeGame = () => {
    const initialPlayers: Player[] = [
      { color: "red", pieces: createPieces(), isAI: false, name: "You" },
      { color: "blue", pieces: createPieces(), isAI: true, name: "AI Blue" },
      { color: "green", pieces: createPieces(), isAI: true, name: "AI Green" },
      { color: "yellow", pieces: createPieces(), isAI: true, name: "AI Yellow" },
    ];
    setPlayers(initialPlayers);
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
      <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-amber-100 to-amber-200 border-4 border-amber-800 rounded-lg shadow-2xl">
        {/* Home areas in corners */}
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-red-200 border-4 border-red-600 rounded-tl-lg">
          {renderHomeArea("red")}
        </div>
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-200 border-4 border-blue-600 rounded-tr-lg">
          {renderHomeArea("blue")}
        </div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-green-200 border-4 border-green-600 rounded-bl-lg">
          {renderHomeArea("green")}
        </div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-yellow-200 border-4 border-yellow-600 rounded-br-lg">
          {renderHomeArea("yellow")}
        </div>
        
        {/* Center home */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-purple-600 rounded-full flex items-center justify-center">
          <Trophy className="w-12 h-12 text-white" />
        </div>
      </div>
    );
  };

  const renderHomeArea = (color: PlayerColor) => {
    const player = players.find(p => p.color === color);
    if (!player) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 p-4 h-full">
        {player.pieces.map(piece => (
          piece.isHome && (
            <button
              key={piece.id}
              onClick={() => movePiece(piece.id)}
              disabled={!canMove || diceValue !== 6}
              className={`
                ${COLORS[color].bg} 
                rounded-full 
                border-4 ${COLORS[color].border}
                aspect-square
                transition-all
                ${canMove && diceValue === 6 ? 'hover:scale-110 cursor-pointer animate-pulse' : 'opacity-70'}
              `}
            />
          )
        ))}
      </div>
    );
  };

  if (!players.length) return null;

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => navigate("/")} variant="outline" size="lg">
            <Home className="mr-2" /> Back to Home
          </Button>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            🎲 Jamaican Ludi 🇯🇲
          </h1>
          <div className="w-32" />
        </div>

        {winner && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-yellow-600 animate-bounce">
            <h2 className="text-3xl font-bold text-center text-white">
              🎉 {players.find(p => p.color === winner)?.name} Wins! 🎉
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
            <Card className={`p-6 border-4 ${COLORS[currentPlayer.color].border}`}>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className={COLORS[currentPlayer.color].text} />
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
                  <div className="text-center p-4 bg-white rounded-lg border-4 border-primary">
                    <div className="text-6xl font-bold animate-bounce">
                      {diceValue}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Players Status */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Player Status</h3>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.color}
                    className={`
                      p-3 rounded-lg border-2 
                      ${index === currentPlayerIndex ? 'ring-4 ring-primary' : ''}
                      ${COLORS[player.color].border}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${COLORS[player.color].bg}`} />
                        <span className="font-bold">{player.name}</span>
                      </div>
                      <div className="text-sm">
                        Finished: {player.pieces.filter(p => p.isFinished).length}/4
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-100 to-pink-100">
              <h4 className="font-bold mb-2">Game Rules:</h4>
              <ul className="text-sm space-y-1">
                <li>• Roll 6 to enter pieces</li>
                <li>• Land on opponents to send them home</li>
                <li>• Safe spots protect your pieces</li>
                <li>• Get all 4 pieces home to win</li>
                <li>• Roll 6 for another turn</li>
                <li>• Three 6's = skip turn!</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
