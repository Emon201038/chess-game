import type { Move } from "@/types/chess";

const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

export function calculateMaterialScore(moves: Move[]): {
  white: number;
  black: number;
} {
  let whiteScore = 0;
  let blackScore = 0;

  moves.forEach((move) => {
    if (move.capturedPiece) {
      const points = PIECE_VALUES[move.capturedPiece.type];
      if (move.piece.color === "white") {
        whiteScore += points;
      } else {
        blackScore += points;
      }
    }
  });

  return { white: whiteScore, black: blackScore };
}

export function determineWinnerByMaterial(
  moves: Move[]
): "white" | "black" | "draw" {
  const scores = calculateMaterialScore(moves);

  if (scores.white > scores.black) {
    return "white";
  } else if (scores.black > scores.white) {
    return "black";
  } else {
    return "draw";
  }
}
