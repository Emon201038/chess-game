"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChessPieceComponent } from "./chess-piece";
import type { PieceType, PieceColor } from "@/types/chess";

interface PromotionDialogProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
}

export function PromotionDialog({
  isOpen,
  color,
  onSelect,
}: PromotionDialogProps) {
  const promotionPieces: PieceType[] = ["queen", "rook", "bishop", "knight"];

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Choose Promotion Piece
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {promotionPieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <ChessPieceComponent
                piece={{ type: pieceType, color }}
                size={60}
              />
              <span className="mt-2 text-sm font-medium capitalize">
                {pieceType}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
