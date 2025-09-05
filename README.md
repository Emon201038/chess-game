# Chess Web Application

A modern, interactive chess web application built with Next.js. Play chess against friends or AI, track your moves, and enjoy a responsive, feature-rich experience.

---

## Table of Contents

- [Features](#features)
- [Game Instructions](#game-instructions)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)

---

## Features

- Play chess against another player or a bot
- Responsive design for desktop and mobile
- Move validation and highlighting
- Game history and undo functionality
- Captured pieces display and scoring
- Sound effects for moves, captures, and game end
- Customizable game modes

---

## Game Instructions

### How to Play

1. **Select Game Mode:**  
   On launch, choose to play against another player or the bot.

2. **Making Moves:**

   - Click on a piece to select it.
   - Valid moves will be highlighted.
   - Click on a highlighted square to move the piece.

3. **Special Moves:**

   - **Castling:** Move your king two squares towards a rook; the rook will jump over the king.
   - **Pawn Promotion:** When a pawn reaches the last rank, choose a piece to promote to.
   - **En Passant:** If available, the move will be highlighted.

4. **Undo:**

   - Click the Undo button to revert the last move (in bot mode, undoes both player and bot moves).

5. **Game End:**

   - The game ends in checkmate, stalemate, or draw.
   - The winner is displayed, and you can start a new game.

6. **Sound:**
   - Toggle sound effects on or off using the sound button.

---

## Getting Started

To run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You can start editing the main page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

---

## Project Structure

```
├── public/             # Static assets (images, SVGs, audio, etc.)
├── src/
│   ├── app/
│   │   ├── chess-game.tsx
│   │   ├── chess-game-container.tsx
│   │   ├── chess-game-layout.tsx
│   ├── components/     # UI components (ChessBoard, GameControls, etc.)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Chess logic, AI, sound utilities
├── package.json        # Project metadata and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

---

## Technologies Used

- [Next.js](https://nextjs.org) – React framework for production
- [TypeScript](https://www.typescriptlang.org/) – Typed JavaScript
- [React](https://react.dev/) – UI library
- [ESLint](https://eslint.org/) – Linting and code quality
- [Vercel](https://vercel.com/) – Deployment platform

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

This project is licensed under the MIT License.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
