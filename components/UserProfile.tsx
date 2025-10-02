'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/stores/progress-store';
import { BADGES } from '@/data/badges';
import { Trophy, Flame, Target, Award } from 'lucide-react';

export function UserProfile() {
  const {
    level,
    totalXP,
    challengesCompleted,
    badgesEarned,
    currentStreak,
  } = useProgressStore();

  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = totalXP % 100;
  const progressToNextLevel = (xpInCurrentLevel / 100) * 100;

  const earnedBadgeObjects = BADGES.filter((b) => badgesEarned.includes(b.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level & XP */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Level {level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {xpInCurrentLevel}/{xpForNextLevel} XP
            </span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-2xl font-bold">{challengesCompleted.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted">
            <Award className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <div className="text-2xl font-bold">{badgesEarned.length}</div>
            <div className="text-xs text-muted-foreground">Badges</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Recent Badges */}
        {earnedBadgeObjects.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-sm">Recent Badges</h4>
            <div className="grid grid-cols-2 gap-2">
              {earnedBadgeObjects.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                  title={badge.description}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{badge.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

