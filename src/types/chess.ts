export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
export type PieceColor = "white" | "black"
export type GameMode = "custom" | "vs-bot"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
  isEnPassant?: boolean
  isCastling?: boolean
  promotionPiece?: PieceType
}

export interface LastMoveHighlight {
  from: Position
  to: Position
}

export interface GameState {
  board: (ChessPiece | null)[][]
  currentPlayer: PieceColor
  gameMode: GameMode
  isGameOver: boolean
  winner: PieceColor | "draw" | null
  moveHistory: Move[]
  selectedSquare: Position | null
  validMoves: Position[]
  isInCheck: boolean
  lastMove: LastMoveHighlight | null
}
