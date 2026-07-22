export interface UserProgress {
  id: string;
  xp: number;
  level: number;
  streak_days: number;
  total_words: number;
  pages_read: number;
  current_minutes: number;
  daily_goal_minutes: number;
  badges: string[];
  daily_challenges: DailyChallenge[];
  weekly_activity: WeeklyActivity[];
  last_challenge_reset?: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reward: number;
  goal: number;
  current: number;
  completed: boolean;
  type: 'reading' | 'vocabulary' | 'writing' | 'focus' | 'math' | 'general';
}

export interface WeeklyActivity {
  day: string;
  value: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'streak' | 'reading' | 'vocabulary' | 'math' | 'focus' | 'level' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  bgColor: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  rank: number;
  streak_days: number;
}

export interface AchievementMilestone {
  threshold: number;
  badge_id: string;
  xp_reward: number;
}

export const XP_REWARDS = {
  READ_MINUTE: 10,
  USE_TOOL: 25,
  SAVE_WORD: 15,
  COMPLETE_CHALLENGE: 100,
  LOGIN_DAILY: 5,
  COMPLETE_ASSESSMENT: 200,
  SHARE_ACHIEVEMENT: 30,
  COMPLETE_LEVEL: 500,
  FIRST_SESSION: 50,
  STREAK_7_DAYS: 150,
  STREAK_30_DAYS: 1000,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 750, 1000, 1500, 2250, 3375, 5062,
  7500, 11250, 16875, 25312, 37968, 56952, 85428, 128142,
  192213, 288319
];

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_step',
    title: 'First Steps',
    description: 'Complete your first learning session',
    icon: null,
    category: 'special',
    rarity: 'common',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500'
  },
  {
    id: 'streak_3',
    title: 'Persistent',
    description: 'Maintain a 3-day learning streak',
    icon: null,
    category: 'streak',
    rarity: 'common',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500'
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: '7 consecutive days of learning',
    icon: null,
    category: 'streak',
    rarity: 'rare',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500'
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: '30-day streak! True dedication',
    icon: null,
    category: 'streak',
    rarity: 'legendary',
    color: 'text-red-600',
    bgColor: 'bg-red-500'
  },
  {
    id: 'words_10',
    title: 'Wordsmith',
    description: 'Save 10 words to your glossary',
    icon: null,
    category: 'vocabulary',
    rarity: 'common',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500'
  },
  {
    id: 'words_50',
    title: 'Vocabulary Master',
    description: 'Save 50 words to your glossary',
    icon: null,
    category: 'vocabulary',
    rarity: 'rare',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500'
  },
  {
    id: 'words_100',
    title: 'Lexicon Legend',
    description: '100 words in your glossary!',
    icon: null,
    category: 'vocabulary',
    rarity: 'epic',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500'
  },
  {
    id: 'pages_10',
    title: 'Bookworm',
    description: 'Read 10 pages total',
    icon: null,
    category: 'reading',
    rarity: 'common',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500'
  },
  {
    id: 'pages_50',
    title: 'Avid Reader',
    description: 'Read 50 pages total',
    icon: null,
    category: 'reading',
    rarity: 'rare',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500'
  },
  {
    id: 'pages_100',
    title: 'Page Turner',
    description: '100 pages read! Incredible!',
    icon: null,
    category: 'reading',
    rarity: 'epic',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500'
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach Level 5',
    icon: null,
    category: 'level',
    rarity: 'rare',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500'
  },
  {
    id: 'level_10',
    title: 'Expert Learner',
    description: 'Reach Level 10',
    icon: null,
    category: 'level',
    rarity: 'epic',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500'
  },
  {
    id: 'level_20',
    title: 'Master Scholar',
    description: 'Reach Level 20. True mastery!',
    icon: null,
    category: 'level',
    rarity: 'legendary',
    color: 'text-violet-600',
    bgColor: 'bg-violet-500'
  },
  {
    id: 'math_5',
    title: 'Math Whiz',
    description: 'Complete 5 math sessions',
    icon: null,
    category: 'math',
    rarity: 'common',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500'
  },
  {
    id: 'focus_30',
    title: 'Deep Focus',
    description: '30 minutes in Focus Zone',
    icon: null,
    category: 'focus',
    rarity: 'rare',
    color: 'text-pink-600',
    bgColor: 'bg-pink-500'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Learn before 9 AM',
    icon: null,
    category: 'special',
    rarity: 'rare',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Learn after 9 PM',
    icon: null,
    category: 'special',
    rarity: 'rare',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500'
  },
  {
    id: 'speed_reader',
    title: 'Speed Reader',
    description: 'Read 50 pages in one session',
    icon: null,
    category: 'reading',
    rarity: 'epic',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500'
  },
  {
    id: 'champion',
    title: 'Weekly Champion',
    description: 'Top of the leaderboard',
    icon: null,
    category: 'social',
    rarity: 'legendary',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500'
  }
];

export const DAILY_CHALLENGE_TEMPLATES = [
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Read for 10 minutes',
    reward: 50,
    goal: 10,
    type: 'reading' as const
  },
  {
    id: 'wordsmith',
    title: 'Wordsmith',
    description: 'Save 3 new words',
    reward: 30,
    goal: 3,
    type: 'vocabulary' as const
  },
  {
    id: 'creative_spark',
    title: 'Creative Spark',
    description: 'Use the Writing Tool',
    reward: 40,
    goal: 1,
    type: 'writing' as const
  },
  {
    id: 'library_visit',
    title: 'Library Visit',
    description: 'Open 2 different books',
    reward: 20,
    goal: 2,
    type: 'reading' as const
  },
  {
    id: 'morning_focus',
    title: 'Morning Focus',
    description: 'Read before noon',
    reward: 60,
    goal: 1,
    type: 'focus' as const
  },
  {
    id: 'math_mind',
    title: 'Math Mind',
    description: 'Solve 3 math problems',
    reward: 45,
    goal: 3,
    type: 'math' as const
  },
  {
    id: 'focused_mind',
    title: 'Focused Mind',
    description: '15 minutes in Focus Zone',
    reward: 35,
    goal: 15,
    type: 'focus' as const
  },
  {
    id: 'vocab_builder',
    title: 'Vocabulary Builder',
    description: 'Save 5 new words today',
    reward: 60,
    goal: 5,
    type: 'vocabulary' as const
  }
];
