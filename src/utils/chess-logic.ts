import type {
  ChessPiece,
  PieceColor,
  Position,
  Move,
  PieceType,
} from "@/types/chess";

export const initialBoard: (ChessPiece | null)[][] = [
  [
    { type: "rook", color: "black", hasMoved: false },
    { type: "knight", color: "black", hasMoved: false },
    { type: "bishop", color: "black", hasMoved: false },
    { type: "queen", color: "black", hasMoved: false },
    { type: "king", color: "black", hasMoved: false },
    { type: "bishop", color: "black", hasMoved: false },
    { type: "knight", color: "black", hasMoved: false },
    { type: "rook", color: "black", hasMoved: false },
  ],
  Array(8)
    .fill(null)
    .map(
      () => ({ type: "pawn", color: "black", hasMoved: false } as ChessPiece)
    ),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8)
    .fill(null)
    .map(
      () => ({ type: "pawn", color: "white", hasMoved: false } as ChessPiece)
    ),
  [
    { type: "rook", color: "white", hasMoved: false },
    { type: "knight", color: "white", hasMoved: false },
    { type: "bishop", color: "white", hasMoved: false },
    { type: "queen", color: "white", hasMoved: false },
    { type: "king", color: "white", hasMoved: false },
    { type: "bishop", color: "white", hasMoved: false },
    { type: "knight", color: "white", hasMoved: false },
    { type: "rook", color: "white", hasMoved: false },
  ],
];

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function getPieceAt(
  board: (ChessPiece | null)[][],
  pos: Position
): ChessPiece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

export function getValidMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  moveHistory: Move[]
): Position[] {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  let moves: Position[] = [];

  switch (piece.type) {
    case "pawn":
      moves = getPawnMoves(board, from, piece.color, moveHistory);
      break;
    case "rook":
      moves = getRookMoves(board, from, piece.color);
      break;
    case "knight":
      moves = getKnightMoves(board, from, piece.color);
      break;
    case "bishop":
      moves = getBishopMoves(board, from, piece.color);
      break;
    case "queen":
      moves = getQueenMoves(board, from, piece.color);
      break;
    case "king":
      moves = getKingMoves(board, from, piece.color, moveHistory);
      break;
  }

  // Filter out moves that would put own king in check
  return moves.filter((to) => !wouldBeInCheck(board, from, to, piece.color));
}

function getPawnMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor,
  moveHistory: Move[]
): Position[] {
  const moves: Position[] = [];
  const direction = color === "white" ? -1 : 1;
  const startRow = color === "white" ? 6 : 1;

  // Forward move
  const oneForward = { row: from.row + direction, col: from.col };
  if (isValidPosition(oneForward) && !getPieceAt(board, oneForward)) {
    moves.push(oneForward);

    // Two squares forward from starting position
    if (from.row === startRow) {
      const twoForward = { row: from.row + 2 * direction, col: from.col };
      if (isValidPosition(twoForward) && !getPieceAt(board, twoForward)) {
        moves.push(twoForward);
      }
    }
  }

  // Diagonal captures
  const captureLeft = { row: from.row + direction, col: from.col - 1 };
  const captureRight = { row: from.row + direction, col: from.col + 1 };
  [captureLeft, captureRight].forEach((pos) => {
    if (isValidPosition(pos)) {
      const targetPiece = getPieceAt(board, pos);
      if (targetPiece && targetPiece.color !== color) {
        moves.push(pos);
      }
    }
  });

  // En passant
  const lastMove = moveHistory[moveHistory.length - 1];
  if (
    lastMove &&
    lastMove.piece.type === "pawn" &&
    Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
    lastMove.to.row === from.row &&
    Math.abs(lastMove.to.col - from.col) === 1
  ) {
    const enPassantPos = { row: from.row + direction, col: lastMove.to.col };
    if (isValidPosition(enPassantPos)) {
      moves.push(enPassantPos);
    }
  }

  return moves;
}

function getRookMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + i * dRow, col: from.col + i * dCol };
      if (!isValidPosition(pos)) break;

      const piece = getPieceAt(board, pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.color !== color) {
          moves.push(pos);
        }
        break;
      }
    }
  }

  return moves;
}

function getKnightMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];

  for (const [dRow, dCol] of knightMoves) {
    const pos = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(pos)) {
      const piece = getPieceAt(board, pos);
      if (!piece || piece.color !== color) {
        moves.push(pos);
      }
    }
  }

  return moves;
}

function getBishopMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + i * dRow, col: from.col + i * dCol };
      if (!isValidPosition(pos)) break;

      const piece = getPieceAt(board, pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.color !== color) {
          moves.push(pos);
        }
        break;
      }
    }
  }

  return moves;
}

function getQueenMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor
): Position[] {
  return [
    ...getRookMoves(board, from, color),
    ...getBishopMoves(board, from, color),
  ];
}

function getKingMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor,
  moveHistory: Move[],
  includeCastling = true
): Position[] {
  const moves: Position[] = [];
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dRow, dCol] of directions) {
    const pos = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(pos)) {
      const piece = getPieceAt(board, pos);
      if (!piece || piece.color !== color) {
        moves.push(pos);
      }
    }
  }

  if (includeCastling) {
    const castlingMoves = getCastlingMoves(board, from, color, moveHistory);
    moves.push(...castlingMoves);
  }

  return moves;
}

function getCastlingMoves(
  board: (ChessPiece | null)[][],
  from: Position,
  color: PieceColor,
  moveHistory: Move[]
): Position[] {
  const moves: Position[] = [];
  const king = getPieceAt(board, from);

  if (!king || king.hasMoved || isInCheck(board, color)) {
    return moves;
  }

  const row = color === "white" ? 7 : 0;

  // King-side castling
  const kingSideRook = getPieceAt(board, { row, col: 7 });
  if (
    kingSideRook &&
    kingSideRook.type === "rook" &&
    kingSideRook.color === color &&
    !kingSideRook.hasMoved &&
    !getPieceAt(board, { row, col: 5 }) &&
    !getPieceAt(board, { row, col: 6 }) &&
    !isSquareUnderAttack(board, { row, col: 5 }, color) &&
    !isSquareUnderAttack(board, { row, col: 6 }, color)
  ) {
    moves.push({ row, col: 6 });
  }

  // Queen-side castling
  const queenSideRook = getPieceAt(board, { row, col: 0 });
  if (
    queenSideRook &&
    queenSideRook.type === "rook" &&
    queenSideRook.color === color &&
    !queenSideRook.hasMoved &&
    !getPieceAt(board, { row, col: 1 }) &&
    !getPieceAt(board, { row, col: 2 }) &&
    !getPieceAt(board, { row, col: 3 }) &&
    !isSquareUnderAttack(board, { row, col: 2 }, color) &&
    !isSquareUnderAttack(board, { row, col: 3 }, color)
  ) {
    moves.push({ row, col: 2 });
  }

  return moves;
}

function isSquareUnderAttack(
  board: (ChessPiece | null)[][],
  square: Position,
  defendingColor: PieceColor
): boolean {
  const attackingColor = defendingColor === "white" ? "black" : "white";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === attackingColor) {
        const moves = getValidMovesWithoutCheckValidation(
          board,
          { row, col },
          []
        );
        if (
          moves.some(
            (move) => move.row === square.row && move.col === square.col
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export function findKing(
  board: (ChessPiece | null)[][],
  color: PieceColor
): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isInCheck(
  board: (ChessPiece | null)[][],
  color: PieceColor
): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  return isSquareUnderAttack(board, kingPos, color);
}

function getValidMovesWithoutCheckValidation(
  board: (ChessPiece | null)[][],
  from: Position,
  moveHistory: Move[]
): Position[] {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  switch (piece.type) {
    case "pawn":
      return getPawnMoves(board, from, piece.color, moveHistory);
    case "rook":
      return getRookMoves(board, from, piece.color);
    case "knight":
      return getKnightMoves(board, from, piece.color);
    case "bishop":
      return getBishopMoves(board, from, piece.color);
    case "queen":
      return getQueenMoves(board, from, piece.color);
    case "king":
      return getKingMoves(board, from, piece.color, moveHistory, false).filter(
        (move) => {
          // For attack calculation, don't include castling moves
          return Math.abs(move.col - from.col) <= 1;
        }
      );
    default:
      return [];
  }
}

function wouldBeInCheck(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean {
  // Create a copy of the board with the move applied
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[from.row][from.col];

  // Handle castling in check validation
  if (piece && piece.type === "king" && Math.abs(from.col - to.col) === 2) {
    // This is castling - move both king and rook
    const isKingSide = to.col > from.col;
    const rookFromCol = isKingSide ? 7 : 0;
    const rookToCol = isKingSide ? 5 : 3;
    const rook = newBoard[from.row][rookFromCol];

    if (rook) {
      newBoard[from.row][rookToCol] = rook;
      newBoard[from.row][rookFromCol] = null;
    }
  }

  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  return isInCheck(newBoard, color);
}

export function isCheckmate(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moveHistory: Move[]
): boolean {
  if (!isInCheck(board, color)) return false;

  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, moveHistory);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }

  return true;
}

export function isStalemate(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moveHistory: Move[]
): boolean {
  if (isInCheck(board, color)) return false;

  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, moveHistory);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }

  return true;
}

export function makeMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  promotionPiece?: PieceType
): { newBoard: (ChessPiece | null)[][]; move: Move; needsPromotion?: boolean } {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[from.row][from.col];
  const capturedPiece = newBoard[to.row][to.col];

  if (!piece) {
    throw new Error("No piece at source position");
  }

  const move: Move = {
    from,
    to,
    piece: { ...piece },
    capturedPiece: capturedPiece ? { ...capturedPiece } : undefined,
  };

  // Check for castling
  if (piece.type === "king" && Math.abs(from.col - to.col) === 2) {
    move.isCastling = true;

    // Move the rook as well
    const isKingSide = to.col > from.col;
    const rookFromCol = isKingSide ? 7 : 0;
    const rookToCol = isKingSide ? 5 : 3;
    const rook = newBoard[from.row][rookFromCol];

    if (rook) {
      newBoard[from.row][rookToCol] = { ...rook, hasMoved: true };
      newBoard[from.row][rookFromCol] = null;
    }
  }

  // Handle en passant capture
  if (piece.type === "pawn" && !capturedPiece && from.col !== to.col) {
    // This is en passant
    move.isEnPassant = true;
    const capturedPawnRow = piece.color === "white" ? to.row + 1 : to.row - 1;
    const capturedPawn = newBoard[capturedPawnRow][to.col];
    if (capturedPawn) {
      move.capturedPiece = { ...capturedPawn };
      newBoard[capturedPawnRow][to.col] = null;
    }
  }

  // Move the piece
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  newBoard[from.row][from.col] = null;

  // Handle pawn promotion
  if (piece.type === "pawn" && (to.row === 0 || to.row === 7)) {
    if (promotionPiece) {
      newBoard[to.row][to.col] = {
        ...piece,
        type: promotionPiece,
        hasMoved: true,
      };
      move.promotionPiece = promotionPiece;
      return { newBoard, move };
    } else {
      // Needs promotion - return without promoting
      return { newBoard, move, needsPromotion: true };
    }
  }

  return { newBoard, move };
}
