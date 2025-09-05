"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot, Clock } from "lucide-react";
import type { GameMode } from "@/types/chess";

interface GameModeSelectionProps {
  onModeSelect: (mode: GameMode) => void;
}

export function GameModeSelection({ onModeSelect }: GameModeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Chess Game</h1>
          <p className="text-lg text-amber-700 mb-2">Choose your game mode</p>
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">5 minutes per game</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onModeSelect("custom")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Custom Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Play against another human player
              </p>
              <Button className="w-full" onClick={() => onModeSelect("custom")}>
                Start Custom Game
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onModeSelect("vs-bot")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">vs Bot</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Challenge our AI opponent
              </p>
              <Button className="w-full" onClick={() => onModeSelect("vs-bot")}>
                Start vs Bot
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/50 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-amber-900 mb-2">Game Rules</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 5-minute time limit per game</li>
              <li>• Player with higher material score wins if time expires</li>
              <li>• Standard chess rules apply</li>
              <li>• Undo moves available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
