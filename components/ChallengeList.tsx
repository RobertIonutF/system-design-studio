'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChallengeDifficulty } from '@/types';
import { CHALLENGES } from '@/data/challenges';
import { Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDesignStore } from '@/stores/design-store';
import { useProgressStore } from '@/stores/progress-store';

const difficultyColors = {
  [ChallengeDifficulty.BEGINNER]: 'bg-green-100 text-green-800 border-green-300',
  [ChallengeDifficulty.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [ChallengeDifficulty.ADVANCED]: 'bg-orange-100 text-orange-800 border-orange-300',
  [ChallengeDifficulty.EXPERT]: 'bg-red-100 text-red-800 border-red-300',
};

export function ChallengeList() {
  const { selectedChallenge, setSelectedChallenge, clearDesign } = useDesignStore();
  const { challengesCompleted } = useProgressStore();

  const handleSelectChallenge = (challengeId: string) => {
    if (selectedChallenge === challengeId) {
      setSelectedChallenge(null);
    } else {
      setSelectedChallenge(challengeId);
      clearDesign();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Challenges</CardTitle>
        <CardDescription>Select a challenge to get started</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-3">
            {CHALLENGES.map((challenge) => {
              const isCompleted = challengesCompleted.includes(challenge.id);
              const isSelected = selectedChallenge === challenge.id;
              
              return (
                <div
                  key={challenge.id}
                  onClick={() => handleSelectChallenge(challenge.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:shadow-md hover:border-primary/50',
                    isSelected && 'border-primary bg-primary/5',
                    !isSelected && 'border-border',
                    isCompleted && 'bg-green-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      {challenge.title}
                      {isCompleted && <span className="text-green-600">✓</span>}
                    </h3>
                    <Badge 
                      variant="outline"
                      className={difficultyColors[challenge.difficulty]}
                    >
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {challenge.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {challenge.estimatedTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {challenge.maxPoints}pts
                    </span>
                  </div>
                  
                  {challenge.tags && challenge.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {challenge.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

