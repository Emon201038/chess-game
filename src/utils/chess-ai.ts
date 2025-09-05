import type {
  ChessPiece,
  PieceColor,
  Position,
  Move,
  PieceType,
} from "@/types/chess";
import { getValidMoves, makeMove, isInCheck } from "./chess-logic";

const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

export function getBotMove(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moveHistory: Move[]
): { from: Position; to: Position; promotionPiece?: PieceType } | null {
  const allMoves = getAllPossibleMoves(board, color, moveHistory);

  if (allMoves.length === 0) return null;

  // Simple AI: prioritize captures, then random moves
  const captureMoves = allMoves.filter(
    (move) => board[move.to.row][move.to.col] !== null
  );

  const checkMoves = allMoves.filter((move) => {
    const result = makeMove(board, move.from, move.to, move.promotionPiece);
    const opponentColor = color === "white" ? "black" : "white";
    return isInCheck(result.newBoard, opponentColor);
  });

  // Prioritize check moves, then captures, then random
  let selectedMove: {
    from: Position;
    to: Position;
    promotionPiece?: PieceType;
  };

  if (checkMoves.length > 0) {
    selectedMove = checkMoves[Math.floor(Math.random() * checkMoves.length)];
  } else if (captureMoves.length > 0) {
    // Choose the capture with highest value
    const bestCapture = captureMoves.reduce((best, move) => {
      const capturedPiece = board[move.to.row][move.to.col];
      const currentValue = capturedPiece ? PIECE_VALUES[capturedPiece.type] : 0;
      const bestValue = board[best.to.row][best.to.col]
        ? PIECE_VALUES[board[best.to.row][best.to.col]!.type]
        : 0;
      return currentValue > bestValue ? move : best;
    });
    selectedMove = bestCapture;
  } else {
    // Random move
    selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  return selectedMove;
}

function getAllPossibleMoves(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moveHistory: Move[]
): { from: Position; to: Position; promotionPiece?: PieceType }[] {
  const moves: { from: Position; to: Position; promotionPiece?: PieceType }[] =
    [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const validMoves = getValidMoves(board, from, moveHistory);

        for (const to of validMoves) {
          // Check if this is a pawn promotion
          if (piece.type === "pawn" && (to.row === 0 || to.row === 7)) {
            // For bot, always promote to queen (strongest piece)
            moves.push({ from, to, promotionPiece: "queen" });
          } else {
            moves.push({ from, to });
          }
        }
      }
    }
  }

  return moves;
}
