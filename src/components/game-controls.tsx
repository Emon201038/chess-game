"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GameMode, PieceColor } from "@/types/chess"
import { RotateCcw, Play, Square, Volume2, VolumeX } from "lucide-react"

interface GameControlsProps {
  gameMode: GameMode
  currentPlayer: PieceColor
  isGameOver: boolean
  winner: PieceColor | "draw" | null
  isInCheck: boolean
  moveCount: number
  onUndo: () => void
  onNewGame: () => void
  onModeChange: (mode: GameMode) => void
  onSoundToggle: () => void
  canUndo: boolean
  soundEnabled: boolean
}

export function GameControls({
  gameMode,
  currentPlayer,
  isGameOver,
  winner,
  isInCheck,
  moveCount,
  onUndo,
  onNewGame,
  onModeChange,
  onSoundToggle,
  canUndo,
  soundEnabled,
}: GameControlsProps) {
  return (
    <Card className="w-full sm:w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square className="w-5 h-5" />
          Chess Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Game Mode</div>
          <div className="flex gap-2">
            <Button
              variant={gameMode === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange("custom")}
              className="flex-1 sm:flex-none"
            >
              Custom
            </Button>
            <Button
              variant={gameMode === "vs-bot" ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange("vs-bot")}
              className="flex-1 sm:flex-none"
            >
              vs Bot
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Game Status</div>
          <div className="flex flex-col gap-2">
            {!isGameOver && (
              <Badge variant={currentPlayer === "white" ? "default" : "secondary"}>
                {currentPlayer === "white" ? "White" : "Black"} to move
              </Badge>
            )}
            {isInCheck && !isGameOver && <Badge variant="destructive">Check!</Badge>}
            {isGameOver && <Badge variant="outline">{winner === "draw" ? "Draw" : `${winner} wins!`}</Badge>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Moves: {Math.floor(moveCount / 2) + 1}</div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || isGameOver}
            className="flex items-center gap-2 bg-transparent flex-1 sm:flex-none"
          >
            <RotateCcw className="w-4 h-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNewGame}
            className="flex items-center gap-2 bg-transparent flex-1 sm:flex-none"
          >
            <Play className="w-4 h-4" />
            New Game
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSoundToggle}
          className="flex items-center gap-2 w-full bg-transparent"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Sound {soundEnabled ? "On" : "Off"}
        </Button>
      </CardContent>
    </Card>
  )
}
