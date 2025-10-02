import { Badge, BadgeCategory, UserProgress } from '@/types';

export const BADGES: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first challenge',
    icon: '🎯',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => progress.challengesCompleted.length >= 1,
  },
  {
    id: 'no-leaky-client',
    name: 'No Leaky Client',
    description: 'Complete a challenge without connecting clients directly to databases',
    icon: '🔒',
    category: BadgeCategory.SECURITY,
    condition: (progress) => progress.challengesCompleted.includes('basic-api'),
  },
  {
    id: 'redundancy-curious',
    name: 'Redundancy Curious',
    description: 'Use load balancing with multiple service replicas',
    icon: '⚖️',
    category: BadgeCategory.RELIABILITY,
    condition: (progress) => progress.challengesCompleted.includes('scalable-upload'),
  },
  {
    id: 'decoupler',
    name: 'The Decoupler',
    description: 'Implement event-driven architecture with queues or pub/sub',
    icon: '📡',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => progress.challengesCompleted.includes('event-driven-orders'),
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Add caching to improve performance',
    icon: '⚡',
    category: BadgeCategory.PERFORMANCE,
    condition: (progress) => progress.conceptsCovered.caching,
  },
  {
    id: 'watchful-eye',
    name: 'Watchful Eye',
    description: 'Add observability with metrics to 3 different designs',
    icon: '👁️',
    category: BadgeCategory.OBSERVABILITY,
    condition: (progress) => progress.conceptsCovered.observability,
  },
  {
    id: 'rate-master',
    name: 'Rate Master',
    description: 'Protect your APIs with rate limiting',
    icon: '🛡️',
    category: BadgeCategory.SECURITY,
    condition: (progress) => progress.challengesCompleted.includes('rate-limiting'),
  },
  {
    id: 'pentathlon',
    name: 'Pentathlon',
    description: 'Complete 5 different challenges',
    icon: '🏆',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => progress.challengesCompleted.length >= 5,
  },
  {
    id: 'level-5',
    name: 'Experienced Architect',
    description: 'Reach Level 5',
    icon: '🎓',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => progress.level >= 5,
  },
  {
    id: 'streak-3',
    name: 'Consistent Learner',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => progress.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    name: 'Dedicated Architect',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => progress.currentStreak >= 7,
  },
  {
    id: 'all-concepts',
    name: 'Renaissance Engineer',
    description: 'Cover all major system design concepts',
    icon: '🌟',
    category: BadgeCategory.ARCHITECTURE,
    condition: (progress) => {
      const concepts = progress.conceptsCovered;
      return Object.values(concepts).every((covered) => covered === true);
    },
  },
];

export const checkNewBadges = (progress: UserProgress, earnedBadgeIds: string[]): Badge[] => {
  const newBadges: Badge[] = [];
  
  for (const badge of BADGES) {
    if (!earnedBadgeIds.includes(badge.id) && badge.condition(progress)) {
      newBadges.push(badge);
    }
  }
  
  return newBadges;
};

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find((b) => b.id === id);
};

