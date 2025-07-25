import type { ChessPiece } from "@/types/chess"
import Image from "next/image"

interface ChessPieceProps {
  piece: ChessPiece | null
  size?: number
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
  if (!piece) return null

  return (
    <Image alt="piece" src={`/images/${piece.color}_${piece.type}.svg`} width={size} height={size} priority quality={100} draggable="false" className="select-none cursor-pointer flex items-center justify-center" />
    // <span className="select-none cursor-pointer flex items-center justify-center" style={{ fontSize: `${size}px` }}>
    //   {pieceSymbols[piece.color][piece.type]}
    // </span>
  )
}
