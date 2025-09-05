import type { ChessPiece } from "@/types/chess";
import Image from "next/image";

interface ChessPieceProps {
  piece: (ChessPiece & { count?: number }) | null;
  size?: number;
}

// const pieceSymbols = {
//   white: {
//     king: "♔",
//     queen: "♕",
//     rook: "♖",
//     bishop: "♗",
//     knight: "♘",
//     pawn: "♙",
//   },
//   black: {
//     king: "♚",
//     queen: "♛",
//     rook: "♜",
//     bishop: "♝",
//     knight: "♞",
//     pawn: "♟",
//   },
// }

export function ChessPieceComponent({ piece, size = 40 }: ChessPieceProps) {
  if (!piece) return null;

  return (
    <div className="relative">
      <Image
        alt="piece"
        src={`/images/${piece.color}_${piece.type}.svg`}
        width={size}
        height={size}
        priority
        quality={100}
        draggable="false"
        className="select-none cursor-pointer flex items-center justify-center"
      />
      {piece?.count && piece.count > 0 && (
        <p className="absolute -bottom-0.5 bg-slate-200 right-0.5 text-[8px]  p-0.5 rounded-full size-2 flex justify-center items-center">
          {piece.count}
        </p>
      )}
    </div>
  );
}
