import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, Castle, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PieceType = "king" | "queen" | "rook" | "knight" | "bishop" | "pawn" | null;
type Player = "light" | "dark";

interface ChessPiece {
  type: PieceType;
  player: Player;
  character: string;
}

const initialBoard: (ChessPiece | null)[][] = [
  [
    { type: "rook", player: "dark", character: "Angel" },
    { type: "knight", player: "dark", character: "Prophet" },
    { type: "bishop", player: "dark", character: "Priest" },
    { type: "queen", player: "dark", character: "Deborah" },
    { type: "king", player: "dark", character: "Solomon" },
    { type: "bishop", player: "dark", character: "Priest" },
    { type: "knight", player: "dark", character: "Prophet" },
    { type: "rook", player: "dark", character: "Angel" }
  ],
  Array(8).fill(null).map(() => ({ type: "pawn", player: "dark", character: "Disciple" })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: "pawn", player: "light", character: "Disciple" })),
  [
    { type: "rook", player: "light", character: "Angel" },
    { type: "knight", player: "light", character: "Prophet" },
    { type: "bishop", player: "light", character: "Priest" },
    { type: "queen", player: "light", character: "Esther" },
    { type: "king", player: "light", character: "Jesus" },
    { type: "bishop", player: "light", character: "Priest" },
    { type: "knight", player: "light", character: "Prophet" },
    { type: "rook", player: "light", character: "Angel" }
  ]
];

const BiblicalChess = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("light");
  const [capturedPieces, setCapturedPieces] = useState<{ light: string[], dark: string[] }>({
    light: [],
    dark: []
  });

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

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.player === piece.player) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case "pawn":
        const direction = piece.player === "light" ? -1 : 1;
        if (colDiff === 0) {
          if (toRow === fromRow + direction && !targetPiece) return true;
          if (toRow === fromRow + (2 * direction) && !targetPiece && 
              ((piece.player === "light" && fromRow === 6) || (piece.player === "dark" && fromRow === 1))) {
            return true;
          }
        }
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) return true;
        return false;

      case "rook":
        return (rowDiff === 0 || colDiff === 0);

      case "knight":
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case "bishop":
        return rowDiff === colDiff;

      case "queen":
        return rowDiff === colDiff || rowDiff === 0 || colDiff === 0;

      case "king":
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const piece = board[fromRow][fromCol];

      if (piece && piece.player === currentPlayer && isValidMove(fromRow, fromCol, row, col)) {
        const newBoard = board.map(r => [...r]);
        const capturedPiece = newBoard[row][col];
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], capturedPiece.character]
          }));

          if (capturedPiece.type === "king") {
            toast({
              title: "Checkmate!",
              description: `${currentPlayer === "light" ? "Light" : "Dark"} wins the game!`
            });
          }
        }

        newBoard[row][col] = piece;
        newBoard[fromRow][fromCol] = null;
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === "light" ? "dark" : "light");
        setSelectedSquare(null);
      } else {
        setSelectedSquare(null);
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.player === currentPlayer) {
        setSelectedSquare([row, col]);
      }
    }
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

        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr,600px,1fr] gap-6 items-start">
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" /> Dark Captured
            </h3>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.dark.map((char, i) => (
                <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{char}</span>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold">
                Current Turn: <span className={currentPlayer === "light" ? "text-primary" : "text-destructive"}>
                  {currentPlayer === "light" ? "Light" : "Dark"}
                </span>
              </p>
            </div>

            <div className="aspect-square max-w-[600px] mx-auto border-4 border-primary/20 rounded-lg overflow-hidden shadow-glow">
              <div className="grid grid-cols-8 h-full">
                {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                    
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        className={`
                          aspect-square flex items-center justify-center text-4xl transition-all
                          ${isLight ? "bg-primary/10" : "bg-primary/30"}
                          ${isSelected ? "ring-4 ring-primary" : ""}
                          hover:brightness-110
                          ${piece ? "cursor-pointer" : ""}
                        `}
                      >
                        {piece && (
                          <div className="flex flex-col items-center">
                            <span className={piece.player === "light" ? "filter brightness-150" : "filter brightness-50"}>
                              {getPieceIcon(piece)}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setBoard(initialBoard);
                setCurrentPlayer("light");
                setCapturedPieces({ light: [], dark: [] });
                setSelectedSquare(null);
              }}>
                <Crown className="mr-2 h-4 w-4" /> New Game
              </Button>
            </div>
          </div>

          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Castle className="h-5 w-5" /> Light Captured
            </h3>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.light.map((char, i) => (
                <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{char}</span>
              ))}
            </div>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto mt-8 p-6">
          <h3 className="font-bold mb-3 text-center">Piece Mapping</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div><span className="font-semibold">King:</span> Jesus/Solomon</div>
            <div><span className="font-semibold">Queen:</span> Deborah/Esther</div>
            <div><span className="font-semibold">Rook:</span> Angel Guardian</div>
            <div><span className="font-semibold">Knight:</span> Prophet Warrior</div>
            <div><span className="font-semibold">Bishop:</span> Priest/Levite</div>
            <div><span className="font-semibold">Pawn:</span> Disciple/Follower</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BiblicalChess;
