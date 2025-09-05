"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface GameTimerProps {
  isGameActive: boolean;
  onTimeExpired: () => void;
  gameStartTime?: number;
}

export function GameTimer({
  isGameActive,
  onTimeExpired,
  gameStartTime,
}: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!isGameActive || !gameStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      const remaining = Math.max(0, 300 - elapsed);

      setTimeLeft(remaining);

      if (remaining === 0) {
        onTimeExpired();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, gameStartTime, onTimeExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLowTime = timeLeft <= 30;
  const isCriticalTime = timeLeft <= 10;

  return (
    <Card className="p-0 bg-transparent shadow-none outline-none border-none">
      <CardContent className="p-0 bg-transparent">
        <div className="flex items-center justify-center gap-2">
          <Clock
            className={`w-4 h-4 ${
              isCriticalTime
                ? "text-red-500"
                : isLowTime
                ? "text-orange-500"
                : "text-blue-500"
            }`}
          />
          <span
            className={`font-mono font-bold ${
              isCriticalTime
                ? "text-red-500"
                : isLowTime
                ? "text-orange-500"
                : "text-blue-600"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
