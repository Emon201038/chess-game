/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { ChessBoard } from "@/components/chess-board";
import { MoveHistory } from "@/components/move-history";
import { GameTimer } from "@/components/game-timer";
import { GameModeSelection } from "@/components/game-mode-selection";
import type {
  GameState,
  Position,
  Move,
  GameMode,
  PieceColor,
  LastMoveHighlight,
  ChessPiece,
  PieceType,
} from "@/types/chess";
import {
  initialBoard,
  getValidMoves,
  makeMove,
  isInCheck,
  isCheckmate,
  isStalemate,
} from "@/utils/chess-logic";
import { getBotMove } from "@/utils/chess-ai";
import { ChessAudio } from "@/utils/sounds";
import { determineWinnerByMaterial } from "@/utils/game-scoring";
import { ChessPieceComponent } from "@/components/chess-piece";
import { Button } from "@/components/ui/button";
import ResultCard from "@/components/result-card";
import { PromotionDialog } from "@/components/promotion-dialog";

const initialGameState: GameState = {
  phase: "selection",
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
  timeExpired: false,
  pendingPromotion: null,
};

export default function ChessGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [boardSize, setBoardSize] = useState(512);

  useEffect(() => {
    const updateBoardSize = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      const maxSize = Math.min(512, minDimension - 100); // Leave some margin
      setBoardSize(Math.max(320, maxSize)); // Minimum 320px
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  const audio = ChessAudio.getInstance();

  const checkGameEnd = useCallback(
    (
      board: (ChessPiece | null)[][],
      currentPlayer: PieceColor,
      moveHistory: Move[]
    ) => {
      if (isCheckmate(board, currentPlayer, moveHistory)) {
        return {
          isGameOver: true,
          winner: currentPlayer === "white" ? "black" : "white",
        };
      }
      if (isStalemate(board, currentPlayer, moveHistory)) {
        return { isGameOver: true, winner: "draw" };
      }
      return { isGameOver: false, winner: null };
    },
    []
  );

  const playMoveSound = useCallback(
    (
      move: Move,
      wasInCheck: boolean,
      isNowInCheck: boolean,
      isGameEnd: boolean
    ) => {
      if (!soundEnabled) return;

      if (isGameEnd) {
        audio.playGameEndSound();
      } else if (move.isCastling) {
        audio.playCastleSound();
      } else if (isNowInCheck) {
        audio.playCheckSound();
      } else if (move.capturedPiece) {
        audio.playCaptureSound();
      } else {
        audio.playMoveSound();
      }
    },
    [audio, soundEnabled]
  );

  const handleModeSelect = useCallback((mode: GameMode) => {
    setGameState({
      ...initialGameState,
      phase: "playing",
      gameMode: mode,
      gameStartTime: Date.now(),
    });
  }, []);

  const handleTimeExpired = useCallback(() => {
    if (gameState.isGameOver) return;

    const winner = determineWinnerByMaterial(gameState.moveHistory);
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: true,
      timeExpired: true,
      winner,
    }));
  }, [gameState.isGameOver, gameState.moveHistory]);

  const handleSquareClick = useCallback(
    (position: Position) => {
      if (
        gameState.isGameOver ||
        gameState.timeExpired ||
        gameState.pendingPromotion
      )
        return;

      // If it's bot's turn in vs-bot mode, don't allow human moves for black
      if (
        gameState.gameMode === "vs-bot" &&
        gameState.currentPlayer === "black"
      ) {
        return;
      }

      setGameState((prevState) => {
        const { board, selectedSquare, currentPlayer, moveHistory } = prevState;

        // If no square is selected, select this square if it has a piece of current player
        if (!selectedSquare) {
          const piece = board[position.row][position.col];
          if (piece && piece.color === currentPlayer) {
            const validMoves = getValidMoves(board, position, moveHistory);
            return {
              ...prevState,
              selectedSquare: position,
              validMoves,
            };
          }
          return prevState;
        }

        // If clicking on the same square, deselect
        if (
          selectedSquare.row === position.row &&
          selectedSquare.col === position.col
        ) {
          return {
            ...prevState,
            selectedSquare: null,
            validMoves: [],
          };
        }

        // If clicking on another piece of the same color, select that piece
        const clickedPiece = board[position.row][position.col];
        if (clickedPiece && clickedPiece.color === currentPlayer) {
          const validMoves = getValidMoves(board, position, moveHistory);
          return {
            ...prevState,
            selectedSquare: position,
            validMoves,
          };
        }

        // Check if the move is valid
        const isValidMove = prevState.validMoves.some(
          (move) => move.row === position.row && move.col === position.col
        );

        if (!isValidMove) {
          return {
            ...prevState,
            selectedSquare: null,
            validMoves: [],
          };
        }

        // Make the move
        try {
          const result = makeMove(board, selectedSquare, position);

          // Check if promotion is needed
          if (result.needsPromotion) {
            return {
              ...prevState,
              pendingPromotion: {
                from: selectedSquare,
                to: position,
                color: currentPlayer,
              },
              selectedSquare: null,
              validMoves: [],
            };
          }

          const wasInCheck = prevState.isInCheck;
          const { newBoard, move } = result;
          const nextPlayer = currentPlayer === "white" ? "black" : "white";
          const newMoveHistory = [...moveHistory, move];
          const inCheck = isInCheck(newBoard, nextPlayer);
          const gameEnd = checkGameEnd(newBoard, nextPlayer, newMoveHistory);

          // Play sound
          playMoveSound(move, wasInCheck, inCheck, gameEnd.isGameOver);

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
          };
        } catch (error) {
          console.error("Invalid move:", error);
          return {
            ...prevState,
            selectedSquare: null,
            validMoves: [],
          };
        }
      });
    },
    [
      gameState.isGameOver,
      gameState.timeExpired,
      gameState.pendingPromotion,
      gameState.gameMode,
      gameState.currentPlayer,
      checkGameEnd,
      playMoveSound,
    ]
  );

  const handlePromotion = useCallback(
    (pieceType: PieceType) => {
      if (!gameState.pendingPromotion) return;

      const { from, to } = gameState.pendingPromotion;

      setGameState((prevState) => {
        try {
          const wasInCheck = prevState.isInCheck;
          const { newBoard, move } = makeMove(
            prevState.board,
            from,
            to,
            pieceType
          );
          const nextPlayer =
            prevState.currentPlayer === "white" ? "black" : "white";
          const newMoveHistory = [...prevState.moveHistory, move];
          const inCheck = isInCheck(newBoard, nextPlayer);
          const gameEnd = checkGameEnd(newBoard, nextPlayer, newMoveHistory);

          // Play sound
          playMoveSound(move, wasInCheck, inCheck, gameEnd.isGameOver);

          return {
            ...prevState,
            board: newBoard,
            currentPlayer: nextPlayer,
            moveHistory: newMoveHistory,
            isInCheck: inCheck,
            isGameOver: gameEnd.isGameOver,
            winner: gameEnd.winner as PieceColor | "draw" | null,
            lastMove: { from, to },
            pendingPromotion: null,
          };
        } catch (error) {
          console.error("Promotion error:", error);
          return {
            ...prevState,
            pendingPromotion: null,
          };
        }
      });
    },
    [gameState.pendingPromotion, checkGameEnd, playMoveSound]
  );

  // Bot move effect
  useEffect(() => {
    if (
      gameState.gameMode === "vs-bot" &&
      gameState.currentPlayer === "black" &&
      !gameState.isGameOver &&
      !gameState.timeExpired &&
      !gameState.pendingPromotion
    ) {
      const timer = setTimeout(() => {
        const botMove = getBotMove(
          gameState.board,
          "black",
          gameState.moveHistory
        );
        if (botMove) {
          try {
            const wasInCheck = gameState.isInCheck;
            const { newBoard, move } = makeMove(
              gameState.board,
              botMove.from,
              botMove.to,
              botMove.promotionPiece
            );
            const inCheck = isInCheck(newBoard, "white");
            const gameEnd = checkGameEnd(newBoard, "white", [
              ...gameState.moveHistory,
              move,
            ]);

            // Play sound
            playMoveSound(move, wasInCheck, inCheck, gameEnd.isGameOver);

            setGameState((prevState) => ({
              ...prevState,
              board: newBoard,
              currentPlayer: "white",
              moveHistory: [...prevState.moveHistory, move],
              isInCheck: inCheck,
              isGameOver: gameEnd.isGameOver,
              winner: gameEnd.winner as PieceColor | "draw" | null,
              lastMove: { from: botMove.from, to: botMove.to },
            }));
          } catch (error) {
            console.error("Bot move error:", error);
          }
        }
      }, 1000); // 1 second delay for bot move

      return () => clearTimeout(timer);
    }
  }, [
    gameState.gameMode,
    gameState.currentPlayer,
    gameState.isGameOver,
    gameState.timeExpired,
    gameState.pendingPromotion,
    gameState.board,
    gameState.moveHistory,
    gameState.isInCheck,
    checkGameEnd,
    playMoveSound,
  ]);

  const handleUndo = useCallback(() => {
    if (gameState.moveHistory.length === 0) return;

    setGameState((prevState) => {
      const newMoveHistory = [...prevState.moveHistory];

      // In vs-bot mode, undo two moves (player + bot)
      const movesToUndo = prevState.gameMode === "vs-bot" ? 2 : 1;

      for (let i = 0; i < movesToUndo && newMoveHistory.length > 0; i++) {
        newMoveHistory.pop();
      }

      // Reconstruct board from move history
      let newBoard = initialBoard.map((row) =>
        row.map((piece) => (piece ? { ...piece } : null))
      );
      let currentPlayer: PieceColor = "white";
      let newLastMove: LastMoveHighlight | null = null;

      for (const move of newMoveHistory) {
        const { newBoard: tempBoard } = makeMove(newBoard, move.from, move.to);
        newBoard = tempBoard;
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        newLastMove = { from: move.from, to: move.to };
      }

      const inCheck = isInCheck(newBoard, currentPlayer);
      const gameEnd = checkGameEnd(newBoard, currentPlayer, newMoveHistory);

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
      };
    });
  }, [gameState.moveHistory, gameState.gameMode, checkGameEnd]);

  const handleNewGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  // const handleModeChange = useCallback((mode: GameMode) => {
  //   setGameState({
  //     ...initialGameState,
  //     phase: "playing",
  //     gameMode: mode,
  //     gameStartTime: Date.now(),
  //   });
  // }, []);

  // const handleSoundToggle = useCallback(() => {
  //   const newSoundState = audio.toggleSound();
  //   setSoundEnabled(newSoundState);
  // }, [audio]);

  // Show game mode selection screen
  if (gameState.phase === "selection") {
    return <GameModeSelection onModeSelect={handleModeSelect} />;
  }

  const whiteCapturedPieces = gameState.moveHistory
    .filter((move) => move.piece.color === "white" && move.capturedPiece)
    .map((move) => move.capturedPiece!)
    .reduce((acc, piece) => {
      if (!acc[piece.type]) {
        acc[piece.type] = { type: piece.type, count: 0, color: piece.color };
      }
      acc[piece.type].count++;
      return acc; // ✅ return accumulator
    }, {} as Record<string, { type: PieceType; count: number; color: PieceColor }>);

  const blackCapturedPieces = gameState.moveHistory
    .filter((move) => move.piece.color === "black" && move.capturedPiece)
    .map((move) => move.capturedPiece!)
    .reduce((acc, piece) => {
      if (!acc[piece.type]) {
        acc[piece.type] = { type: piece.type, count: 0, color: piece.color };
      }
      acc[piece.type].count++;
      return acc; // ✅ return accumulator
    }, {} as Record<string, { type: PieceType; count: number; color: PieceColor }>);

  const whiteScore = Object.values(whiteCapturedPieces).reduce((sum, piece) => {
    const pieceValues: Record<PieceType, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
    };
    return ((sum + pieceValues[piece.type]) as number) * piece.count;
  }, 0);

  const blackScore = Object.values(blackCapturedPieces).reduce((sum, piece) => {
    const pieceValues: Record<PieceType, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
    };
    return ((sum + pieceValues[piece.type]) as number) * piece.count;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-amber-900 mb-2">
            Chess Game
          </h1>
          <p className="text-sm sm:text-base text-amber-700">
            Full-featured chess with castling and captures
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div style={{ width: boardSize }} className="flex flex-col">
            <div className="flex justify-between items-center">
              <GameTimer
                isGameActive={
                  gameState.phase === "playing" && !gameState.isGameOver
                }
                onTimeExpired={handleTimeExpired}
                gameStartTime={gameState.gameStartTime}
              />
              <div className="flex gap-2">
                <p>Moves: </p>
                <p>{Math.floor(gameState.moveHistory.length / 2) + 1}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-1">
                  {Object.values(whiteCapturedPieces).map((piece, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center w-8 h-8 bg-background rounded"
                    >
                      <ChessPieceComponent piece={piece} size={24} />
                    </div>
                  ))}
                </div>
                {whiteScore > 0 && (
                  <p className="bg-white text-black p-1 size-6 flex justify-center items-center rounded-full border">
                    {whiteScore}
                  </p>
                )}
              </div>
              <div className="flex flex-row-reverse justify-between items-center gap-3">
                <div className="flex items-center gap-1">
                  {Object.values(blackCapturedPieces).map((piece, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center w-8 h-8 bg-background rounded"
                    >
                      <ChessPieceComponent piece={piece} size={24} />
                    </div>
                  ))}
                </div>
                {blackScore > 0 && (
                  <p className="bg-black text-white p-1 size-6 flex justify-center items-center rounded-full">
                    {blackScore}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="order-1">
            <ChessBoard
              board={gameState.board}
              selectedSquare={gameState.selectedSquare}
              validMoves={gameState.validMoves}
              lastMove={gameState.lastMove}
              onSquareClick={handleSquareClick}
              flipped={gameState.gameMode === "vs-bot"}
            />
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 order-2 w-full xl:w-auto justify-center items-center">
            <div style={{ width: boardSize }} className="w-full ">
              <MoveHistory
                moves={gameState.moveHistory}
                currentBoard={gameState.board}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleNewGame}>New Game</Button>
              <Button onClick={handleUndo}>Undo Move</Button>
            </div>
          </div>
        </div>
      </div>

      <PromotionDialog
        isOpen={!!gameState.pendingPromotion}
        color={gameState.pendingPromotion?.color || "white"}
        onSelect={handlePromotion}
      />
      {gameState.isGameOver && (
        <ResultCard gameState={gameState} handleNewGame={handleNewGame} />
      )}
    </div>
  );
}
