export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";
export type GameMode = "custom" | "vs-bot";
export type GamePhase = "selection" | "playing" | "finished";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
}

export interface LastMoveHighlight {
  from: Position;
  to: Position;
}

export interface PendingPromotion {
  from: Position;
  to: Position;
  color: PieceColor;
}

export interface GameState {
  phase: GamePhase;
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  gameMode: GameMode;
  isGameOver: boolean;
  winner: PieceColor | "draw" | null;
  moveHistory: Move[];
  selectedSquare: Position | null;
  validMoves: Position[];
  isInCheck: boolean;
  lastMove: LastMoveHighlight | null;
  gameStartTime?: number;
  timeExpired: boolean;
  pendingPromotion: PendingPromotion | null;
}
