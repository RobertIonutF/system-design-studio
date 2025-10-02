import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress, ChallengeAttempt, Badge } from '@/types';

interface ProgressState extends UserProgress {
  // Actions
  addChallengeAttempt: (attempt: ChallengeAttempt) => void;
  addXP: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

const INITIAL_PROGRESS: UserProgress = {
  totalXP: 0,
  level: 1,
  challengesCompleted: [],
  challengeAttempts: [],
  badgesEarned: [],
  currentStreak: 0,
  createdAt: new Date(),
  conceptsCovered: {
    caching: false,
    queuing: false,
    loadBalancing: false,
    replication: false,
    eventDriven: false,
    observability: false,
  },
};

const calculateLevel = (xp: number): number => {
  // Simple level calculation: 100 XP per level
  return Math.floor(xp / 100) + 1;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...INITIAL_PROGRESS,

      addChallengeAttempt: (attempt) => {
        const { challengeAttempts, challengesCompleted } = get();
        const newAttempts = [...challengeAttempts, attempt];
        const newCompleted = [...new Set([...challengesCompleted, attempt.challengeId])];

        set({
          challengeAttempts: newAttempts,
          challengesCompleted: newCompleted,
          lastActivityDate: new Date(),
        });
      },

      addXP: (amount) => {
        const { totalXP } = get();
        const newXP = totalXP + amount;
        const newLevel = calculateLevel(newXP);

        set({
          totalXP: newXP,
          level: newLevel,
        });
      },

      awardBadge: (badgeId) => {
        const { badgesEarned } = get();
        if (!badgesEarned.includes(badgeId)) {
          set({
            badgesEarned: [...badgesEarned, badgeId],
          });
        }
      },

      updateStreak: () => {
        const { lastActivityDate, currentStreak } = get();
        const now = new Date();
        
        if (!lastActivityDate) {
          set({ currentStreak: 1, lastActivityDate: now });
          return;
        }

        const lastActivity = new Date(lastActivityDate);
        const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, no change
          return;
        } else if (diffDays === 1) {
          // Next day, increment streak
          set({ currentStreak: currentStreak + 1, lastActivityDate: now });
        } else {
          // Streak broken
          set({ currentStreak: 1, lastActivityDate: now });
        }
      },

      resetProgress: () => {
        set({
          ...INITIAL_PROGRESS,
          createdAt: new Date(),
        });
      },
    }),
    {
      name: 'system-design-studio-progress',
    }
  )
);

