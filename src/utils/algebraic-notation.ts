import type { ChessPiece, Position, Move } from "@/types/chess";

export function positionToAlgebraic(pos: Position): string {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[pos.col] + ranks[pos.row];
}

export function pieceToSymbol(piece: ChessPiece): string {
  const symbols = {
    king: "K",
    queen: "Q",
    rook: "R",
    bishop: "B",
    knight: "N",
    pawn: "",
  };
  return symbols[piece.type];
}

export function moveToAlgebraicNotation(
  move: Move,
  board: (ChessPiece | null)[][],
  isCapture: boolean,
  isCheck: boolean,
  isCheckmate: boolean,
  moveHistory: Move[]
): string {
  const piece = move.piece;
  const fromSquare = positionToAlgebraic(move.from);
  const toSquare = positionToAlgebraic(move.to);

  // Handle castling
  if (piece.type === "king" && Math.abs(move.from.col - move.to.col) === 2) {
    return move.to.col > move.from.col ? "O-O" : "O-O-O";
  }

  let notation = pieceToSymbol(piece);

  // Add disambiguation if needed (for pieces other than pawns and kings)
  if (piece.type !== "pawn" && piece.type !== "king") {
    const disambiguation = getDisambiguation(move, board, moveHistory);
    notation += disambiguation;
  }

  // Handle pawn captures
  if (piece.type === "pawn" && isCapture) {
    notation = fromSquare[0]; // file of the pawn
  }

  // Add capture symbol
  if (isCapture) {
    notation += "x";
  }

  // Add destination square
  notation += toSquare;

  // Add promotion
  if (move.promotionPiece) {
    notation += "=" + pieceToSymbol({ ...piece, type: move.promotionPiece });
  }

  // Add check/checkmate
  if (isCheckmate) {
    notation += "#";
  } else if (isCheck) {
    notation += "+";
  }

  return notation;
}

function getDisambiguation(
  move: Move,
  board: (ChessPiece | null)[][],
  moveHistory: Move[]
): string {
  // This is a simplified disambiguation - in a full implementation,
  // you'd check for other pieces of the same type that could move to the same square
  // console.log(move, moveHistory, board);
  return "";
}

export function formatMoveNumber(
  moveIndex: number,
  isWhiteMove: boolean
): string {
  const moveNumber = Math.floor(moveIndex / 2) + 1;
  if (isWhiteMove || moveIndex % 2 === 0) {
    return `${moveNumber}.`;
  }
  return "";
}
