"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChessPieceComponent } from "./chess-piece"
import type { Move, PieceColor } from "@/types/chess"
import { Trophy } from "lucide-react"

interface CapturedPiecesProps {
  moves: Move[]
  playerColor?: PieceColor
}

export function CapturedPieces({ moves, playerColor = "white" }: CapturedPiecesProps) {
  const capturedByWhite = moves
    .filter((move) => move.piece.color === "white" && move.capturedPiece)
    .map((move) => move.capturedPiece!)

  const capturedByBlack = moves
    .filter((move) => move.piece.color === "black" && move.capturedPiece)
    .map((move) => move.capturedPiece!)

  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0,
  }

  const whiteScore = capturedByWhite.reduce((sum, piece) => sum + pieceValues[piece.type], 0)
  const blackScore = capturedByBlack.reduce((sum, piece) => sum + pieceValues[piece.type], 0)

  const advantage = whiteScore - blackScore

  return (
    <Card className="w-full sm:w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Captured Pieces
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* White's captures */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">White captured:</span>
            <span className="text-xs text-muted-foreground">+{whiteScore}</span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[40px] p-2 bg-muted/30 rounded">
            {capturedByWhite.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              capturedByWhite.map((piece, index) => (
                <div key={index} className="flex items-center justify-center w-8 h-8 bg-background rounded">
                  <ChessPieceComponent piece={piece} size={24} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Black's captures */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Black captured:</span>
            <span className="text-xs text-muted-foreground">+{blackScore}</span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[40px] p-2 bg-muted/30 rounded">
            {capturedByBlack.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              capturedByBlack.map((piece, index) => (
                <div key={index} className="flex items-center justify-center w-8 h-8 bg-background rounded">
                  <ChessPieceComponent piece={piece} size={24} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Material advantage */}
        {advantage !== 0 && (
          <div className="text-center p-2 bg-muted/50 rounded">
            <span className="text-sm font-medium">
              {advantage > 0 ? "White" : "Black"} leads by {Math.abs(advantage)} points
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
