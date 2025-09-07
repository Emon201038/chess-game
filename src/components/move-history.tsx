"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChessPiece, Move } from "@/types/chess";
import { moveToAlgebraicNotation } from "@/utils/algebraic-notation";
import { History } from "lucide-react";

interface MoveHistoryProps {
  moves: Move[];
  currentBoard: (ChessPiece | null)[][];
}

export function MoveHistory({ moves, currentBoard }: MoveHistoryProps) {
  const formatMove = (move: Move, index: number, allMoves: Move[]) => {
    const isCapture = !!move.capturedPiece;
    const isCheck = false; // Simplified for now
    const isCheckmate = false; // Simplified for now

    return moveToAlgebraicNotation(
      move,
      currentBoard,
      isCapture,
      isCheck,
      isCheckmate,
      allMoves.slice(0, index)
    );
  };

  const groupedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];
    const moveNumber = Math.floor(i / 2) + 1;

    groupedMoves.push({
      number: moveNumber,
      white: whiteMove ? formatMove(whiteMove, i, moves) : null,
      black: blackMove ? formatMove(blackMove, i + 1, moves) : null,
    });
  }

  return (
    <Card className="w-full py-0.5">
      <CardContent className="p-0 w-full">
        <CardHeader className="px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="w-4 h-4" />
            Move History
          </CardTitle>
        </CardHeader>
        <div className="bg-slate-700 text-white">
          <ScrollArea className="h-24">
            <div className="space-y-0">
              {groupedMoves.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-sm">
                  No moves yet
                </div>
              ) : (
                groupedMoves.map((group, index) => (
                  <div
                    key={group.number}
                    className={`flex items-center px-3 py-1 text-sm font-mono ${
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-600"
                    }`}
                  >
                    <span className="w-6 text-slate-300 font-bold">
                      {group.number}.
                    </span>
                    <span className="w-16 text-left text-white font-medium">
                      {group.white || ""}
                    </span>
                    <span className="w-16 text-left text-slate-200">
                      {group.black || ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
