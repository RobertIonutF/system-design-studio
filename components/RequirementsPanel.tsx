'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Play, Info } from 'lucide-react';
import { useDesignStore } from '@/stores/design-store';
import { useProgressStore } from '@/stores/progress-store';
import { getChallengeById } from '@/data/challenges';
import { validateDesign, detectConcepts } from '@/lib/validation';
import { checkNewBadges } from '@/data/badges';
import { toast } from 'sonner';

export function RequirementsPanel() {
  const { selectedChallenge, nodes, edges, getElapsedTime } = useDesignStore();
  const {
    addChallengeAttempt,
    addXP,
    awardBadge,
    updateStreak,
    badgesEarned,
    conceptsCovered,
  } = useProgressStore();
  
  const [validationResult, setValidationResult] = useState<any>(null);

  const challenge = selectedChallenge ? getChallengeById(selectedChallenge) : null;

  const handleValidate = () => {
    if (!challenge) return;

    const result = validateDesign(challenge, nodes, edges);
    setValidationResult(result);

    if (result.passed) {
      // Update progress
      const timeTaken = getElapsedTime();
      
      addChallengeAttempt({
        challengeId: challenge.id,
        completedAt: new Date(),
        score: result.score,
        maxScore: result.maxScore,
        timeTaken,
        design: { nodes, edges },
      });

      // Award XP
      addXP(result.score);
      
      // Update streak
      updateStreak();

      // Detect and update concepts
      const newConcepts = detectConcepts(nodes, edges);
      const progress = useProgressStore.getState();
      
      // Merge new concepts
      Object.keys(newConcepts).forEach((key) => {
        if (newConcepts[key as keyof typeof newConcepts]) {
          progress.conceptsCovered[key as keyof typeof conceptsCovered] = true;
        }
      });

      // Check for new badges
      const newBadges = checkNewBadges(progress, badgesEarned);
      newBadges.forEach((badge) => {
        awardBadge(badge.id);
        toast.success(`🎉 Badge Unlocked: ${badge.name}`, {
          description: badge.description,
        });
      });

      toast.success('Challenge Completed!', {
        description: `You earned ${result.score} points!`,
      });
    } else {
      toast.error('Challenge not yet complete', {
        description: `Score: ${result.score}/${result.maxScore}. Keep improving!`,
      });
    }
  };

  if (!challenge) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Info className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a challenge to see requirements</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = validationResult
    ? (validationResult.score / validationResult.maxScore) * 100
    : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Requirements</span>
          <span className="text-sm font-normal text-muted-foreground">
            {challenge.passingScore}/{challenge.maxPoints} to pass
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="px-6 pb-4">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-semibold">
              {validationResult ? `${validationResult.score}/${validationResult.maxScore}` : '0/0'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3 pb-4">
            {challenge.requirements.map((req) => {
              const result = validationResult?.requirementResults.find(
                (r: any) => r.requirement.id === req.id
              );
              const isPassed = result?.passed ?? false;

              return (
                <div
                  key={req.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{req.description}</p>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {req.points}pts
                      </span>
                    </div>
                    {!isPassed && req.hint && validationResult && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 {req.hint}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-6 border-t">
          <Button
            onClick={handleValidate}
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Validate Design
          </Button>
          
          {validationResult && validationResult.feedback && (
            <div className="mt-4 space-y-2">
              {validationResult.feedback.map((msg: string, idx: number) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

