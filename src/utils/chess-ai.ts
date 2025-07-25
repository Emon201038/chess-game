import type { ChessPiece, PieceColor, Position, Move } from "@/types/chess"
import { getValidMoves, makeMove, isInCheck } from "./chess-logic"

const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
}

export function getBotMove(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moveHistory: Move[],
): { from: Position; to: Position } | null {
  const allMoves = getAllPossibleMoves(board, color, moveHistory)

  if (allMoves.length === 0) return null

  // Simple AI: prioritize captures, then random moves
  const captureMoves = allMoves.filter((move) => board[move.to.row][move.to.col] !== null)

  const checkMoves = allMoves.filter((move) => {
    const { newBoard } = makeMove(board, move.from, move.to)
    const opponentColor = color === "white" ? "black" : "white"
    return isInCheck(newBoard, opponentColor)
  })

  // Prioritize check moves, then captures, then random
  if (checkMoves.length > 0) {
    return checkMoves[Math.floor(Math.random() * checkMoves.length)]
  }

  if (captureMoves.length > 0) {
    // Choose the capture with highest value
    const bestCapture = captureMoves.reduce((best, move) => {
      const capturedPiece = board[move.to.row][move.to.col]
      const currentValue = capturedPiece ? PIECE_VALUES[capturedPiece.type] : 0
      const bestValue = board[best.to.row][best.to.col] ? PIECE_VALUES[board[best.to.row][best.to.col]!.type] : 0
      return currentValue > bestValue ? move : best
    })
    return bestCapture
  }

  // Random move
  return allMoves[Math.floor(Math.random() * allMoves.length)]
}

function getAllPossibleMoves(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moveHistory: Move[],
): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const from = { row, col }
        const validMoves = getValidMoves(board, from, moveHistory)

        for (const to of validMoves) {
          moves.push({ from, to })
        }
      }
    }
  }

  return moves
}
