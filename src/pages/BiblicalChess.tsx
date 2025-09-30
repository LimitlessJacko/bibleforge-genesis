import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Import character images
import jesusImg from "@/assets/characters/jesus.jpg";
import davidImg from "@/assets/characters/david.jpg";
import solomonImg from "@/assets/characters/solomon.jpg";
import deborahImg from "@/assets/characters/deborah.jpg";
import nehemiahImg from "@/assets/characters/nehemiah.jpg";
import elijahImg from "@/assets/characters/elijah.jpg";
import michaelImg from "@/assets/characters/michael.jpg";
import satanImg from "@/assets/characters/satan.jpg";
import goliathImg from "@/assets/characters/goliath.jpg";
import pharaohImg from "@/assets/characters/pharaoh.jpg";
import jezebelImg from "@/assets/characters/jezebel.jpg";
import judasImg from "@/assets/characters/judas.jpg";

type PieceType = "king" | "queen" | "rook" | "knight" | "bishop" | "pawn" | null;
type Player = "light" | "dark";

interface ChessPiece {
  type: PieceType;
  player: Player;
  character: string;
  image: string;
  hasMoved?: boolean;
}

interface Move {
  from: [number, number];
  to: [number, number];
  piece: ChessPiece;
  captured?: ChessPiece;
}

const initialBoard: (ChessPiece | null)[][] = [
  [
    { type: "rook", player: "dark", character: "Goliath", image: goliathImg, hasMoved: false },
    { type: "knight", player: "dark", character: "Pharaoh", image: pharaohImg, hasMoved: false },
    { type: "bishop", player: "dark", character: "Jezebel", image: jezebelImg, hasMoved: false },
    { type: "queen", player: "dark", character: "Satan", image: satanImg, hasMoved: false },
    { type: "king", player: "dark", character: "Judas", image: judasImg, hasMoved: false },
    { type: "bishop", player: "dark", character: "Jezebel", image: jezebelImg, hasMoved: false },
    { type: "knight", player: "dark", character: "Pharaoh", image: pharaohImg, hasMoved: false },
    { type: "rook", player: "dark", character: "Goliath", image: goliathImg, hasMoved: false }
  ],
  Array(8).fill(null).map(() => ({ type: "pawn" as PieceType, player: "dark" as Player, character: "Demon", image: satanImg, hasMoved: false })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: "pawn" as PieceType, player: "light" as Player, character: "Angel", image: michaelImg, hasMoved: false })),
  [
    { type: "rook", player: "light", character: "Nehemiah", image: nehemiahImg, hasMoved: false },
    { type: "knight", player: "light", character: "David", image: davidImg, hasMoved: false },
    { type: "bishop", player: "light", character: "Solomon", image: solomonImg, hasMoved: false },
    { type: "queen", player: "light", character: "Deborah", image: deborahImg, hasMoved: false },
    { type: "king", player: "light", character: "Jesus", image: jesusImg, hasMoved: false },
    { type: "bishop", player: "light", character: "Elijah", image: elijahImg, hasMoved: false },
    { type: "knight", player: "light", character: "Michael", image: michaelImg, hasMoved: false },
    { type: "rook", player: "light", character: "Nehemiah", image: nehemiahImg, hasMoved: false }
  ]
];

const BiblicalChess = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(JSON.parse(JSON.stringify(initialBoard)));
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("light");
  const [capturedPieces, setCapturedPieces] = useState<{ light: string[], dark: string[] }>({
    light: [],
    dark: []
  });
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<[number, number, number, number] | null>(null);
  const [isInCheck, setIsInCheck] = useState<Player | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const getPieceIcon = (piece: ChessPiece | null) => {
    if (!piece || !piece.type) return "";
    const icons: Record<string, string> = {
      king: "♔",
      queen: "♕",
      rook: "♖",
      knight: "♘",
      bishop: "♗",
      pawn: "♙"
    };
    return icons[piece.type] || "";
  };

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) return false;
      currentRow += rowDir;
      currentCol += colDir;
    }
    
    return true;
  };

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number, testBoard = board): boolean => {
    const piece = testBoard[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = testBoard[toRow][toCol];
    if (targetPiece && targetPiece.player === piece.player) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case "pawn":
        const direction = piece.player === "light" ? -1 : 1;
        const startRow = piece.player === "light" ? 6 : 1;
        
        // Forward move
        if (colDiff === 0 && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + (2 * direction) && isPathClear(fromRow, fromCol, toRow, toCol)) {
            return true;
          }
        }
        // Capture
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) return true;
        return false;

      case "rook":
        if (rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case "knight":
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case "bishop":
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case "queen":
        if (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;

      case "king":
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const findKing = (player: Player, testBoard = board): [number, number] | null => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col];
        if (piece && piece.type === "king" && piece.player === player) {
          return [row, col];
        }
      }
    }
    return null;
  };

  const isSquareUnderAttack = (row: number, col: number, by: Player, testBoard = board): boolean => {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = testBoard[fromRow][fromCol];
        if (piece && piece.player === by) {
          if (isValidMove(fromRow, fromCol, row, col, testBoard)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isInCheckmate = (player: Player): boolean => {
    // Check if player has any legal moves
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (piece && piece.player === player) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                // Simulate the move
                const testBoard = board.map(r => [...r]);
                testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
                testBoard[fromRow][fromCol] = null;
                
                const kingPos = findKing(player, testBoard);
                if (kingPos && !isSquareUnderAttack(kingPos[0], kingPos[1], player === "light" ? "dark" : "light", testBoard)) {
                  return false; // Found a legal move
                }
              }
            }
          }
        }
      }
    }
    return true;
  };

  const calculateValidMoves = (row: number, col: number): [number, number][] => {
    const moves: [number, number][] = [];
    const piece = board[row][col];
    if (!piece) return moves;

    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        if (isValidMove(row, col, toRow, toCol)) {
          // Check if move would leave king in check
          const testBoard = board.map(r => [...r]);
          testBoard[toRow][toCol] = testBoard[row][col];
          testBoard[row][col] = null;
          
          const kingPos = findKing(piece.player, testBoard);
          if (kingPos && !isSquareUnderAttack(kingPos[0], kingPos[1], piece.player === "light" ? "dark" : "light", testBoard)) {
            moves.push([toRow, toCol]);
          }
        }
      }
    }
    return moves;
  };

  useEffect(() => {
    const kingPos = findKing(currentPlayer);
    if (kingPos) {
      const inCheck = isSquareUnderAttack(kingPos[0], kingPos[1], currentPlayer === "light" ? "dark" : "light");
      setIsInCheck(inCheck ? currentPlayer : null);
      
      if (inCheck && isInCheckmate(currentPlayer)) {
        setGameOver(true);
        toast({
          title: "Checkmate!",
          description: `${currentPlayer === "light" ? "Dark" : "Light"} wins the game!`,
          className: "text-xl font-bold"
        });
      }
    }
  }, [currentPlayer, board]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      
      // Check if clicking on a valid move
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        const piece = board[fromRow][fromCol];
        if (!piece) return;

        const newBoard = board.map(r => [...r]);
        const capturedPiece = newBoard[row][col];
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], capturedPiece.character]
          }));
        }

        // Update piece
        const movedPiece = { ...piece, hasMoved: true };
        newBoard[row][col] = movedPiece;
        newBoard[fromRow][fromCol] = null;
        
        setBoard(newBoard);
        setMoveHistory(prev => [...prev, {
          from: [fromRow, fromCol],
          to: [row, col],
          piece: movedPiece,
          captured: capturedPiece || undefined
        }]);
        setLastMove([fromRow, fromCol, row, col]);
        setCurrentPlayer(currentPlayer === "light" ? "dark" : "light");
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // Clicking on another piece of same color
        const clickedPiece = board[row][col];
        if (clickedPiece && clickedPiece.player === currentPlayer) {
          setSelectedSquare([row, col]);
          setValidMoves(calculateValidMoves(row, col));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.player === currentPlayer) {
        setSelectedSquare([row, col]);
        setValidMoves(calculateValidMoves(row, col));
      }
    }
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard)));
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer("light");
    setCapturedPieces({ light: [], dark: [] });
    setMoveHistory([]);
    setLastMove(null);
    setIsInCheck(null);
    setGameOver(false);
  };

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
    const isLastMoveSquare = lastMove && ((lastMove[0] === row && lastMove[1] === col) || (lastMove[2] === row && lastMove[3] === col));
    const piece = board[row][col];
    const isKingInCheck = isInCheck && piece && piece.type === "king" && piece.player === isInCheck;

    if (isKingInCheck) return "bg-destructive/60";
    if (isSelected) return "bg-primary/50 ring-4 ring-primary";
    if (isValidMove) return isLight ? "bg-primary/30 hover:bg-primary/40" : "bg-primary/40 hover:bg-primary/50";
    if (isLastMoveSquare) return isLight ? "bg-secondary/30" : "bg-secondary/40";
    return isLight ? "bg-primary/10 hover:bg-primary/15" : "bg-primary/30 hover:bg-primary/35";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-glow">
          Biblical Chess
        </h1>

        {isInCheck && (
          <div className="flex justify-center mb-4">
            <Badge variant="destructive" className="text-lg px-6 py-2 animate-pulse">
              <AlertTriangle className="mr-2 h-5 w-5" />
              {isInCheck === "light" ? "Light" : "Dark"} King in Check!
            </Badge>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr,auto,1fr] gap-6 items-start">
          {/* Dark Captured */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-destructive">
              <Crown className="h-5 w-5" /> Dark Captured
            </h3>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.dark.map((char, i) => (
                <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{char}</span>
              ))}
            </div>
          </Card>

          {/* Chess Board */}
          <div className="space-y-4">
            <div className="text-center">
              <Badge className={`text-lg px-4 py-2 ${currentPlayer === "light" ? "bg-primary" : "bg-destructive"}`}>
                Current Turn: {currentPlayer === "light" ? "Light" : "Dark"}
              </Badge>
            </div>

            <div className="relative">
              {/* Column labels (a-h) */}
              <div className="flex justify-center mb-1">
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((label, i) => (
                  <div key={i} className="w-[72px] text-center text-sm text-muted-foreground font-semibold">
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Row labels (8-1) */}
                <div className="flex flex-col justify-center mr-1">
                  {[8, 7, 6, 5, 4, 3, 2, 1].map((label) => (
                    <div key={label} className="h-[72px] flex items-center justify-center text-sm text-muted-foreground font-semibold w-6">
                      {label}
                    </div>
                  ))}
                </div>

                {/* Board with 3D perspective */}
                <div 
                  className="aspect-square w-full max-w-[576px] border-4 border-primary/20 rounded-lg overflow-hidden shadow-glow"
                  style={{ perspective: "1200px" }}
                >
                  <div 
                    className="grid grid-cols-8 h-full"
                    style={{ 
                      transform: "rotateX(15deg)",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {board.map((row, rowIndex) =>
                      row.map((piece, colIndex) => {
                        const isLight = (rowIndex + colIndex) % 2 === 0;
                        return (
                          <button
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                            disabled={gameOver}
                            className={`
                              aspect-square flex items-center justify-center transition-all
                              ${getSquareColor(rowIndex, colIndex)}
                              ${piece && !gameOver ? "cursor-pointer" : ""}
                              ${gameOver ? "opacity-50" : ""}
                              relative group
                            `}
                            style={{
                              background: isLight 
                                ? "linear-gradient(135deg, hsl(45, 85%, 75%), hsl(45, 70%, 65%))" 
                                : "linear-gradient(135deg, hsl(35, 60%, 45%), hsl(30, 55%, 35%))",
                              boxShadow: isLight 
                                ? "inset 0 -4px 8px rgba(0,0,0,0.1)" 
                                : "inset 0 -4px 8px rgba(0,0,0,0.3)",
                              transform: "translateZ(0)",
                              transformStyle: "preserve-3d"
                            }}
                          >
                            {piece && (
                              <div 
                                className="relative"
                                style={{
                                  transform: "translateZ(15px)",
                                  transformStyle: "preserve-3d"
                                }}
                              >
                                <img
                                  src={piece.image}
                                  alt={piece.character}
                                  title={`${piece.character} (${piece.type})`}
                                  className={`
                                    w-14 h-14 rounded-full object-cover
                                    border-3 ${piece.player === "light" ? "border-yellow-400" : "border-purple-600"}
                                    shadow-[0_8px_16px_rgba(0,0,0,0.5)]
                                    group-hover:scale-110 transition-transform duration-200
                                  `}
                                  style={{
                                    filter: piece.player === "light" 
                                      ? "drop-shadow(0 4px 8px rgba(234,179,8,0.7)) brightness(1.1)" 
                                      : "drop-shadow(0 4px 8px rgba(147,51,234,0.7)) brightness(0.9)"
                                  }}
                                />
                                {/* Piece type indicator */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded-full bg-background/95 border border-primary/50 shadow-md">
                                  {piece.type === "king" ? "👑" : 
                                   piece.type === "queen" ? "♛" : 
                                   piece.type === "rook" ? "🏰" : 
                                   piece.type === "bishop" ? "⛪" : 
                                   piece.type === "knight" ? "🐴" : "⚔️"}
                                </div>
                              </div>
                            )}
                            {/* Valid move indicator */}
                            {validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && !piece && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-primary/60 shadow-lg"></div>
                              </div>
                            )}
                            {/* Capture indicator */}
                            {validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && piece && (
                              <div className="absolute inset-0 border-4 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.6)] rounded-lg"></div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={resetGame} size="lg">
                <RotateCcw className="mr-2 h-4 w-4" /> New Game
              </Button>
            </div>
          </div>

          {/* Light Captured */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-primary">
              <Crown className="h-5 w-5" /> Light Captured
            </h3>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.light.map((char, i) => (
                <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{char}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Piece Reference */}
        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <h3 className="font-bold mb-4 text-center text-xl">Biblical Piece Mapping</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♔</span>
                <span className="font-semibold">King</span>
              </div>
              <p className="text-xs text-muted-foreground">Jesus/Solomon</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♕</span>
                <span className="font-semibold">Queen</span>
              </div>
              <p className="text-xs text-muted-foreground">Deborah/Esther</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♖</span>
                <span className="font-semibold">Rook</span>
              </div>
              <p className="text-xs text-muted-foreground">Angel Guardian</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♘</span>
                <span className="font-semibold">Knight</span>
              </div>
              <p className="text-xs text-muted-foreground">Prophet Warrior</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♗</span>
                <span className="font-semibold">Bishop</span>
              </div>
              <p className="text-xs text-muted-foreground">Priest/Levite</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">♙</span>
                <span className="font-semibold">Pawn</span>
              </div>
              <p className="text-xs text-muted-foreground">Disciple/Follower</p>
            </div>
          </div>
        </Card>

        {/* Move History */}
        {moveHistory.length > 0 && (
          <Card className="max-w-4xl mx-auto mt-8 p-6">
            <h3 className="font-bold mb-4 text-center text-xl">Move History</h3>
            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {moveHistory.map((move, i) => (
                  <div key={i} className="p-2 bg-muted/30 rounded">
                    <span className="font-semibold">{i + 1}.</span> {move.piece.character}
                    {move.captured && <span className="text-destructive"> x{move.captured.character}</span>}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BiblicalChess;
