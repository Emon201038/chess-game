import React from "react";
import { Card, CardContent } from "./ui/card";
import { GameState } from "@/types/chess";
import { Button } from "./ui/button";

const ResultCard = ({
  gameState,
  handleNewGame,
}: {
  gameState: GameState;
  handleNewGame: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 top-0 left-0 w-full h-full flex justify-center items-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <Card className="z-[100] bg-white text-primary">
        <CardContent className="jcenter flex flex-col items-center space-y-4 p-6">
          <div>
            Match is {gameState.winner !== "draw" ? "won by" : "draw"}{" "}
            {gameState.winner !== "draw" ? gameState.winner : ""}
          </div>
          <Button onClick={handleNewGame}>New Game</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultCard;
