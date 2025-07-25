/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback } from "react"
import { ChessBoard } from "@/components/chess-board"
import { GameControls } from "@/components/game-controls"
import { CapturedPieces } from "@/components/captured-pieces"
import type { GameState, Position, Move, GameMode, PieceColor, LastMoveHighlight, ChessPiece } from "@/types/chess"
import { initialBoard, getValidMoves, makeMove, isInCheck, isCheckmate, isStalemate } from "@/utils/chess-logic"
import { getBotMove } from "@/utils/chess-ai"
import { ChessAudio } from "@/utils/sounds"

const initialGameState: GameState = {
  board: initialBoard,
  currentPlayer: "white",
  gameMode: "custom",
  isGameOver: false,
  winner: null,
  moveHistory: [],
  selectedSquare: null,
  validMoves: [],
  isInCheck: false,
  lastMove: null,
}

export default function ChessGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const audio = ChessAudio.getInstance()

  const checkGameEnd = useCallback((board: (ChessPiece | null)[][], currentPlayer: PieceColor, moveHistory: Move[]) => {
    if (isCheckmate(board, currentPlayer, moveHistory)) {
      return { isGameOver: true, winner: currentPlayer === "white" ? "black" : "white" }
    }
    if (isStalemate(board, currentPlayer, moveHistory)) {
      return { isGameOver: true, winner: "draw" }
    }
    return { isGameOver: false, winner: null }
  }, [])

  const playMoveSound = useCallback(
    (move: Move, wasInCheck: boolean, isNowInCheck: boolean, isGameEnd: boolean) => {
      if (!soundEnabled) return

      if (isGameEnd) {
        audio.playGameEndSound()
      } else if (move.isCastling) {
        audio.playCastleSound()
      } else if (isNowInCheck) {
        audio.playCheckSound()
      } else if (move.capturedPiece) {
        audio.playCaptureSound()
      } else {
        audio.playMoveSound()
      }
    },
    [audio, soundEnabled],
  )

  const handleSquareClick = useCallback(
    (position: Position) => {
      if (gameState.isGameOver) return

      // If it's bot's turn in vs-bot mode, don't allow human moves for black
      if (gameState.gameMode === "vs-bot" && gameState.currentPlayer === "black") {
        return
      }

      setGameState((prevState) => {
        const { board, selectedSquare, currentPlayer, moveHistory } = prevState

        // If no square is selected, select this square if it has a piece of current player
        if (!selectedSquare) {
          const piece = board[position.row][position.col]
          if (piece && piece.color === currentPlayer) {
            const validMoves = getValidMoves(board, position, moveHistory)
            return {
              ...prevState,
              selectedSquare: position,
              validMoves,
            }
          }
          return prevState
        }

        // If clicking on the same square, deselect
        if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
          return {
            ...prevState,
            selectedSquare: null,
            validMoves: [],
          }
        }

        // If clicking on another piece of the same color, select that piece
        const clickedPiece = board[position.row][position.col]
        if (clickedPiece && clickedPiece.color === currentPlayer) {
          const validMoves = getValidMoves(board, position, moveHistory)
          return {
            ...prevState,
            selectedSquare: position,
            validMoves,
          }
        }

        // Check if the move is valid
        const isValidMove = prevState.validMoves.some((move) => move.row === position.row && move.col === position.col)

        if (!isValidMove) {
          return {
            ...prevState,
            selectedSquare: null,
            validMoves: [],
          }
        }

        // Make the move
        try {
          const wasInCheck = prevState.isInCheck
          const { newBoard, move } = makeMove(board, selectedSquare, position)
          const nextPlayer = currentPlayer === "white" ? "black" : "white"
          const newMoveHistory = [...moveHistory, move]
          const inCheck = isInCheck(newBoard, nextPlayer)
          const gameEnd = checkGameEnd(newBoard, nextPlayer, newMoveHistory)

          // Play sound
          playMoveSound(move, wasInCheck, inCheck, gameEnd.isGameOver)

          return {
            ...prevState,
            board: newBoard,
            currentPlayer: nextPlayer,
            moveHistory: newMoveHistory,
            selectedSquare: null,
            validMoves: [],
            isInCheck: inCheck,
            isGameOver: gameEnd.isGameOver,
            winner: gameEnd.winner as PieceColor | "draw" | null,
            lastMove: { from: selectedSquare, to: position },
          }
        } catch (error) {
          console.error("Invalid move:", error)
          return {
            ...prevState,
            selectedSquare: null,
            validMoves: [],
          }
        }
      })
    },
    [gameState.isGameOver, gameState.gameMode, gameState.currentPlayer, checkGameEnd, playMoveSound],
  )

  // Bot move effect
  useEffect(() => {
    if (gameState.gameMode === "vs-bot" && gameState.currentPlayer === "black" && !gameState.isGameOver) {
      const timer = setTimeout(() => {
        const botMove = getBotMove(gameState.board, "black", gameState.moveHistory)
        if (botMove) {
          try {
            const wasInCheck = gameState.isInCheck
            const { newBoard, move } = makeMove(gameState.board, botMove.from, botMove.to)
            const inCheck = isInCheck(newBoard, "white")
            const gameEnd = checkGameEnd(newBoard, "white", [...gameState.moveHistory, move])

            // Play sound
            playMoveSound(move, wasInCheck, inCheck, gameEnd.isGameOver)

            setGameState((prevState) => ({
              ...prevState,
              board: newBoard,
              currentPlayer: "white",
              moveHistory: [...prevState.moveHistory, move],
              isInCheck: inCheck,
              isGameOver: gameEnd.isGameOver,
              winner: gameEnd.winner as PieceColor | "draw" | null,
              lastMove: { from: botMove.from, to: botMove.to },
            }))
          } catch (error) {
            console.error("Bot move error:", error)
          }
        }
      }, 1000) // 1 second delay for bot move

      return () => clearTimeout(timer)
    }
  }, [
    gameState.gameMode,
    gameState.currentPlayer,
    gameState.isGameOver,
    gameState.board,
    gameState.moveHistory,
    gameState.isInCheck,
    checkGameEnd,
    playMoveSound,
  ])

  const handleUndo = useCallback(() => {
    if (gameState.moveHistory.length === 0) return

    setGameState((prevState) => {
      const newMoveHistory = [...prevState.moveHistory]

      // In vs-bot mode, undo two moves (player + bot)
      const movesToUndo = prevState.gameMode === "vs-bot" ? 2 : 1

      for (let i = 0; i < movesToUndo && newMoveHistory.length > 0; i++) {
        newMoveHistory.pop()
      }

      // Reconstruct board from move history
      let newBoard = initialBoard.map((row) => row.map((piece) => (piece ? { ...piece } : null)))
      let currentPlayer: PieceColor = "white"
      let newLastMove: LastMoveHighlight | null = null

      for (const move of newMoveHistory) {
        const { newBoard: tempBoard } = makeMove(newBoard, move.from, move.to)
        newBoard = tempBoard
        currentPlayer = currentPlayer === "white" ? "black" : "white"
        newLastMove = { from: move.from, to: move.to }
      }

      const inCheck = isInCheck(newBoard, currentPlayer)
      const gameEnd = checkGameEnd(newBoard, currentPlayer, newMoveHistory)

      return {
        ...prevState,
        board: newBoard,
        currentPlayer,
        moveHistory: newMoveHistory,
        selectedSquare: null,
        validMoves: [],
        isInCheck: inCheck,
        isGameOver: gameEnd.isGameOver,
        winner: gameEnd.winner as PieceColor | "draw" | null,
        lastMove: newLastMove,
      }
    })
  }, [gameState.moveHistory, gameState.gameMode, checkGameEnd])

  const handleNewGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      gameMode: gameState.gameMode,
    })
  }, [gameState.gameMode])

  const handleModeChange = useCallback((mode: GameMode) => {
    setGameState({
      ...initialGameState,
      gameMode: mode,
    })
  }, [])

  const handleSoundToggle = useCallback(() => {
    const newSoundState = audio.toggleSound()
    setSoundEnabled(newSoundState)
  }, [audio])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-amber-900 mb-2">Chess Game</h1>
          <p className="text-sm sm:text-base text-amber-700">Full-featured chess with castling and captures</p>
        </div>

        <div className="flex flex-col xl:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="order-2 xl:order-1">
            <ChessBoard
              board={gameState.board}
              selectedSquare={gameState.selectedSquare}
              validMoves={gameState.validMoves}
              lastMove={gameState.lastMove}
              onSquareClick={handleSquareClick}
              flipped={gameState.gameMode === "vs-bot"}
            />
          </div>

          <div className="flex flex-col sm:flex-row xl:flex-col gap-4 sm:gap-6 order-1 xl:order-2 w-full xl:w-auto">
            <div className="flex-1 sm:flex-none">
              <GameControls
                gameMode={gameState.gameMode}
                currentPlayer={gameState.currentPlayer}
                isGameOver={gameState.isGameOver}
                winner={gameState.winner}
                isInCheck={gameState.isInCheck}
                moveCount={gameState.moveHistory.length}
                onUndo={handleUndo}
                onNewGame={handleNewGame}
                onModeChange={handleModeChange}
                onSoundToggle={handleSoundToggle}
                canUndo={gameState.moveHistory.length > 0}
                soundEnabled={soundEnabled}
              />
            </div>

            <div className="flex-1 sm:flex-none">
              <CapturedPieces moves={gameState.moveHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
