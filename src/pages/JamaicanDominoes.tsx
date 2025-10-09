import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Trophy, Shuffle } from "lucide-react";
import { toast } from "sonner";

interface Domino {
  id: string;
  left: number;
  right: number;
  playedBy?: number;
}

interface Player {
  id: number;
  name: string;
  hand: Domino[];
  isAI: boolean;
  team: number;
}

interface GameState {
  players: Player[];
  board: Domino[];
  currentPlayer: number;
  leftEnd: number | null;
  rightEnd: number | null;
  scores: { team1: number; team2: number };
  gameOver: boolean;
  winner: number | null;
}

const JamaicanDominoes = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedDomino, setSelectedDomino] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [gameStarted, setGameStarted] = useState(false);

  const createDominoSet = (): Domino[] => {
    const dominoes: Domino[] = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        dominoes.push({
          id: `${i}-${j}`,
          left: i,
          right: j
        });
      }
    }
    return dominoes;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    const dominoes = shuffleArray(createDominoSet());
    const tilesPerPlayer = playerCount === 2 ? 7 : 7;
    
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: i === 0 ? "You" : `Player ${i + 1}`,
      hand: dominoes.slice(i * tilesPerPlayer, (i + 1) * tilesPerPlayer),
      isAI: i !== 0,
      team: i % 2 === 0 ? 1 : 2
    }));

    setGameState({
      players,
      board: [],
      currentPlayer: 0,
      leftEnd: null,
      rightEnd: null,
      scores: { team1: 0, team2: 0 },
      gameOver: false,
      winner: null
    });
    setGameStarted(true);
    toast.success(`Game started with ${playerCount} players!`);
  };

  const canPlayDomino = (domino: Domino, leftEnd: number | null, rightEnd: number | null): { canPlay: boolean; side?: "left" | "right" | "both" } => {
    if (leftEnd === null && rightEnd === null) {
      return { canPlay: true, side: "both" };
    }

    const canPlayLeft = leftEnd !== null && (domino.left === leftEnd || domino.right === leftEnd);
    const canPlayRight = rightEnd !== null && (domino.left === rightEnd || domino.right === rightEnd);

    if (canPlayLeft && canPlayRight) {
      return { canPlay: true, side: "both" };
    } else if (canPlayLeft) {
      return { canPlay: true, side: "left" };
    } else if (canPlayRight) {
      return { canPlay: true, side: "right" };
    }

    return { canPlay: false };
  };

  const playDomino = (dominoId: string, side: "left" | "right") => {
    if (!gameState || gameState.gameOver) return;

    const currentPlayerData = gameState.players[gameState.currentPlayer];
    const domino = currentPlayerData.hand.find(d => d.id === dominoId);
    
    if (!domino) return;

    const playCheck = canPlayDomino(domino, gameState.leftEnd, gameState.rightEnd);
    if (!playCheck.canPlay) {
      toast.error("Cannot play this domino!");
      return;
    }

    let newBoard = [...gameState.board];
    let newLeftEnd = gameState.leftEnd;
    let newRightEnd = gameState.rightEnd;
    let playedDomino = { ...domino, playedBy: gameState.currentPlayer };

    // First domino played
    if (gameState.board.length === 0) {
      newBoard = [playedDomino];
      newLeftEnd = domino.left;
      newRightEnd = domino.right;
    } else if (side === "left" && gameState.leftEnd !== null) {
      // Play on left side
      if (domino.right === gameState.leftEnd) {
        newBoard = [playedDomino, ...newBoard];
        newLeftEnd = domino.left;
      } else if (domino.left === gameState.leftEnd) {
        playedDomino = { ...playedDomino, left: domino.right, right: domino.left };
        newBoard = [playedDomino, ...newBoard];
        newLeftEnd = domino.right;
      }
    } else if (side === "right" && gameState.rightEnd !== null) {
      // Play on right side
      if (domino.left === gameState.rightEnd) {
        newBoard = [...newBoard, playedDomino];
        newRightEnd = domino.right;
      } else if (domino.right === gameState.rightEnd) {
        playedDomino = { ...playedDomino, left: domino.right, right: domino.left };
        newBoard = [...newBoard, playedDomino];
        newRightEnd = domino.left;
      }
    }

    // Update player's hand
    const newPlayers = gameState.players.map((player, idx) => {
      if (idx === gameState.currentPlayer) {
        return {
          ...player,
          hand: player.hand.filter(d => d.id !== dominoId)
        };
      }
      return player;
    });

    // Check if player won
    if (newPlayers[gameState.currentPlayer].hand.length === 0) {
      const winningTeam = currentPlayerData.team;
      const newScores = { ...gameState.scores };
      if (winningTeam === 1) {
        newScores.team1 += 1;
      } else {
        newScores.team2 += 1;
      }

      toast.success(`${currentPlayerData.name} wins the round!`, {
        description: `Team ${winningTeam} scores a point!`
      });

      setGameState({
        ...gameState,
        players: newPlayers,
        board: newBoard,
        leftEnd: newLeftEnd,
        rightEnd: newRightEnd,
        scores: newScores,
        gameOver: true,
        winner: winningTeam
      });
      return;
    }

    // Move to next player
    const nextPlayer = (gameState.currentPlayer + 1) % playerCount;

    setGameState({
      ...gameState,
      players: newPlayers,
      board: newBoard,
      currentPlayer: nextPlayer,
      leftEnd: newLeftEnd,
      rightEnd: newRightEnd
    });

    setSelectedDomino(null);
    toast.success(`${currentPlayerData.name} played a domino!`);
  };

  const handleDominoClick = (dominoId: string) => {
    if (!gameState || gameState.currentPlayer !== 0) return;
    
    if (selectedDomino === dominoId) {
      setSelectedDomino(null);
    } else {
      setSelectedDomino(dominoId);
    }
  };

  const handlePass = () => {
    if (!gameState || gameState.gameOver) return;

    const currentPlayerData = gameState.players[gameState.currentPlayer];
    toast.info(`${currentPlayerData.name} passed their turn`);

    const nextPlayer = (gameState.currentPlayer + 1) % playerCount;
    setGameState({
      ...gameState,
      currentPlayer: nextPlayer
    });
  };

  // AI Turn Logic
  useEffect(() => {
    if (!gameState || gameState.gameOver) return;
    
    const currentPlayerData = gameState.players[gameState.currentPlayer];
    
    if (currentPlayerData.isAI) {
      const timeout = setTimeout(() => {
        // Find playable dominoes
        const playableDominoes = currentPlayerData.hand.filter(domino => 
          canPlayDomino(domino, gameState.leftEnd, gameState.rightEnd).canPlay
        );

        if (playableDominoes.length > 0) {
          // Play random playable domino
          const randomDomino = playableDominoes[Math.floor(Math.random() * playableDominoes.length)];
          const playCheck = canPlayDomino(randomDomino, gameState.leftEnd, gameState.rightEnd);
          
          // Determine which side to play on
          let side: "left" | "right" = "right";
          if (playCheck.side === "left") {
            side = "left";
          } else if (playCheck.side === "both") {
            side = Math.random() > 0.5 ? "left" : "right";
          }
          
          playDomino(randomDomino.id, side);
        } else {
          handlePass();
        }
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [gameState?.currentPlayer]);

  const renderDomino = (domino: Domino, isInHand: boolean = false) => {
    const isSelected = selectedDomino === domino.id;
    const canPlay = gameState ? canPlayDomino(domino, gameState.leftEnd, gameState.rightEnd).canPlay : false;
    
    return (
      <div
        key={domino.id}
        onClick={() => isInHand && handleDominoClick(domino.id)}
        className={`
          relative flex items-center justify-between gap-2 p-3 rounded-lg border-2 
          bg-gradient-to-br from-card to-card/80 transition-all
          ${isInHand ? 'cursor-pointer hover:scale-105' : ''}
          ${isSelected ? 'border-primary scale-110 shadow-lg' : 'border-border'}
          ${isInHand && !canPlay ? 'opacity-50' : ''}
          ${isInHand && canPlay ? 'hover:border-primary/50' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-background">
          <div className="grid grid-cols-2 gap-0.5">
            {Array.from({ length: domino.left }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
            ))}
          </div>
        </div>
        <div className="w-0.5 h-full bg-border" />
        <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-background">
          <div className="grid grid-cols-2 gap-0.5">
            {Array.from({ length: domino.right }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 p-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              Jamaican Dominoes
            </h1>
            <p className="text-xl text-muted-foreground">
              Classic Caribbean domino game with team play
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Number of Players</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[2, 4].map(count => (
                      <Button
                        key={count}
                        variant={playerCount === count ? "default" : "outline"}
                        onClick={() => setPlayerCount(count)}
                        className="h-20"
                      >
                        <Users className="w-5 h-5 mr-2" />
                        {count} Players
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold mb-3">Game Rules</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Match the ends of dominoes to play them on the board</li>
                    <li>• Players take turns clockwise</li>
                    <li>• First player to play all their dominoes wins the round</li>
                    <li>• In 4-player games, teammates sit opposite each other</li>
                    <li>• First team to 6 points wins the match</li>
                  </ul>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={startGame}
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  const currentPlayerData = gameState.players[gameState.currentPlayer];
  const humanPlayer = gameState.players[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              setGameStarted(false);
              setGameState(null);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Game
          </Button>

          <div className="flex gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Team 1: {gameState.scores.team1}
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Team 2: {gameState.scores.team2}
            </Badge>
          </div>
        </div>

        {/* Players Info */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {gameState.players.map((player) => (
            <Card
              key={player.id}
              className={`
                ${player.id === gameState.currentPlayer ? 'border-primary border-2' : 'border-border'}
                ${player.team === 1 ? 'bg-primary/5' : 'bg-accent/5'}
              `}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Team {player.team} • {player.hand.length} tiles
                    </p>
                  </div>
                  {player.id === gameState.currentPlayer && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Board */}
        <Card className="bg-card/50 backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Game Board</h3>
              <p className="text-sm text-muted-foreground">
                {gameState.board.length === 0 ? "Play your first domino!" : `${gameState.board.length} dominoes played`}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center items-center min-h-[120px] p-4 bg-background/50 rounded-lg">
              {gameState.board.length === 0 ? (
                <p className="text-muted-foreground">No dominoes played yet</p>
              ) : (
                gameState.board.map((domino) => renderDomino(domino))
              )}
            </div>

            {gameState.board.length > 0 && (
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <div>Left End: {gameState.leftEnd}</div>
                <div>Right End: {gameState.rightEnd}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Hand */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your Hand</h3>
              {currentPlayerData.id === 0 && selectedDomino && (() => {
                const selectedDominoData = humanPlayer.hand.find(d => d.id === selectedDomino);
                if (!selectedDominoData) return null;
                
                return (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => playDomino(selectedDomino, "left")}
                      disabled={gameState.board.length > 0 && !canPlayDomino(
                        selectedDominoData,
                        gameState.leftEnd,
                        gameState.rightEnd
                      ).canPlay}
                    >
                      Play Left
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => playDomino(selectedDomino, "right")}
                      disabled={gameState.board.length > 0 && !canPlayDomino(
                        selectedDominoData,
                        gameState.leftEnd,
                        gameState.rightEnd
                      ).canPlay}
                    >
                      Play Right
                    </Button>
                    <Button variant="ghost" onClick={handlePass}>
                      Pass
                    </Button>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {humanPlayer.hand.length === 0 ? (
                <p className="text-muted-foreground">No dominoes left!</p>
              ) : (
                humanPlayer.hand.map((domino) => renderDomino(domino, true))
              )}
            </div>

            {currentPlayerData.id !== 0 && (
              <div className="mt-4 text-center">
                <Badge variant="secondary">
                  Waiting for {currentPlayerData.name}...
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {gameState.gameOver && (
          <Card className="fixed inset-0 m-auto w-96 h-fit bg-card/95 backdrop-blur-sm border-primary">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Round Over!</h2>
              <p className="text-xl mb-6">
                Team {gameState.winner} Wins!
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setGameStarted(false);
                    setGameState(null);
                  }}
                >
                  New Game
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={startGame}
                >
                  Next Round
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JamaicanDominoes;
