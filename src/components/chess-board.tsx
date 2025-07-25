"use client"

import { useState, useEffect } from "react"
import type { ChessPiece, Position } from "@/types/chess"
import { ChessPieceComponent } from "./chess-piece"

interface ChessBoardProps {
  board: (ChessPiece | null)[][]
  selectedSquare: Position | null
  validMoves: Position[]
  lastMove: { from: Position; to: Position } | null
  onSquareClick: (position: Position) => void
  flipped?: boolean
}

export function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick,
  flipped = false,
}: ChessBoardProps) {
  const [boardSize, setBoardSize] = useState(512)

  useEffect(() => {
    const updateBoardSize = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      const maxSize = Math.min(512, minDimension - 100) // Leave some margin
      setBoardSize(Math.max(320, maxSize)) // Minimum 320px
    }

    updateBoardSize()
    window.addEventListener("resize", updateBoardSize)
    return () => window.removeEventListener("resize", updateBoardSize)
  }, [])

  const squareSize = boardSize / 8
  const files = flipped ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"]
  const ranks = flipped ? ["1", "2", "3", "4", "5", "6", "7", "8"] : ["8", "7", "6", "5", "4", "3", "2", "1"]

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col
  }

  const isValidMove = (row: number, col: number) => {
    return validMoves.some((move) => move.row === row && move.col === col)
  }

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false
    return (
      (lastMove.from.row === row && lastMove.from.col === col) || (lastMove.to.row === row && lastMove.to.col === col)
    )
  }

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0
    if (isSquareSelected(row, col)) {
      return "bg-yellow-400"
    }
    if (isLastMoveSquare(row, col)) {
      return isLight ? "bg-blue-200" : "bg-blue-400"
    }
    if (isValidMove(row, col)) {
      return isLight ? "bg-green-200" : "bg-green-300"
    }
    return isLight ? "bg-amber-100" : "bg-amber-800"
  }

  const renderBoard = () => {
    const rows = []
    for (let row = 0; row < 8; row++) {
      const cols = []
      for (let col = 0; col < 8; col++) {
        const displayRow = flipped ? 7 - row : row
        const displayCol = flipped ? 7 - col : col
        const piece = board[displayRow][displayCol]
        const isLight = (displayRow + displayCol) % 2 === 0
        const pieceSize = Math.max(24, squareSize * 0.65)

        cols.push(
          <div
            key={`${displayRow}-${displayCol}`}
            className={`flex items-center justify-center cursor-pointer relative ${getSquareColor(displayRow, displayCol)}`}
            style={{ width: squareSize, height: squareSize }}
            onClick={() => onSquareClick({ row: displayRow, col: displayCol })}
          >
            <ChessPieceComponent piece={piece} size={pieceSize} />
            {isValidMove(displayRow, displayCol) && !piece && (
              <div
                className="absolute bg-green-600 rounded-full opacity-60"
                style={{
                  width: squareSize * 0.25,
                  height: squareSize * 0.25,
                }}
              />
            )}

            {/* File labels (bottom row) */}
            {row === 7 && (
              <div
                className="absolute bottom-1 right-1 text-xs font-semibold pointer-events-none select-none"
                style={{ fontSize: Math.max(10, squareSize * 0.15) }}
              >
                <span className={isLight ? "text-amber-800" : "text-amber-100"}>{files[col]}</span>
              </div>
            )}

            {/* Rank labels (left column) */}
            {col === 0 && (
              <div
                className="absolute top-1 left-1 text-xs font-semibold pointer-events-none select-none"
                style={{ fontSize: Math.max(10, squareSize * 0.15) }}
              >
                <span className={isLight ? "text-amber-800" : "text-amber-100"}>{ranks[row]}</span>
              </div>
            )}
          </div>,
        )
      }
      rows.push(
        <div key={row} className="flex">
          {cols}
        </div>,
      )
    }
    return rows
  }

  return (
    <div className="flex flex-col items-center">
      {/* Chess board */}
      <div
        className="relative border-4 border-amber-900 bg-amber-900 shadow-2xl"
      // style={{ width: boardSize, height: boardSize }}
      >
        <div className="border-2 border-amber-700 relative bg-amber-100">{renderBoard()}</div>
      </div>
    </div>
  )
}
