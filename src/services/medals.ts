const MEDALS_KEY = 'adhd_medals';

export interface Medal {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: number;
}

const DEFAULT_MEDALS: Medal[] = [
  { id: 'first_task', name: 'First Steps', icon: '🎯', description: 'Complete your first task', earned: false },
  { id: 'task_master', name: 'Task Master', icon: '✅', description: 'Complete 50 tasks', earned: false },
  { id: 'focus_time', name: 'Focus Legend', icon: '⏱️', description: 'Use focus timer for 5+ hours', earned: false },
  { id: 'streak_warrior', name: 'Streak Warrior', icon: '🔥', description: 'Maintain a 7-day streak', earned: false },
  { id: 'social_butterfly', name: 'Social Butterfly', icon: '👥', description: 'Add 5 friends', earned: false },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Complete a task before 8 AM', earned: false },
  { id: 'night_owl', name: 'Night Owl', icon: '🌙', description: 'Complete a task after 10 PM', earned: false },
  { id: 'premium_member', name: 'Premium Member', icon: '💎', description: 'Subscribe to Plus', earned: false },
  { id: 'quest_master', name: 'Quest Master', icon: '🏆', description: 'Complete 10 quests', earned: false },
  { id: 'money_bags', name: 'Money Bags', icon: '💰', description: 'Earn 1000 gems', earned: false },
];

export const getMedals = (): Medal[] => {
  const stored = localStorage.getItem(MEDALS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_MEDALS;
};

export const earnMedal = (medalId: string): boolean => {
  const medals = getMedals();
  const medal = medals.find(m => m.id === medalId);
  
  if (medal && !medal.earned) {
    medal.earned = true;
    medal.earnedDate = Date.now();
    localStorage.setItem(MEDALS_KEY, JSON.stringify(medals));
    return true;
  }
  
  return false;
};

export const checkAndEarnMedals = (criteria: any) => {
  const medals = getMedals();
  let earned = false;

  // First Task
  if (criteria.tasksCompleted === 1) {
    const medal = medals.find(m => m.id === 'first_task');
    if (medal && !medal.earned) {
      medal.earned = true;
      medal.earnedDate = Date.now();
      earned = true;
    }
  }

  // Task Master (50 tasks)
  if (criteria.tasksCompleted >= 50) {
    const medal = medals.find(m => m.id === 'task_master');
    if (medal && !medal.earned) {
      medal.earned = true;
      medal.earnedDate = Date.now();
      earned = true;
    }
  }

  // Streak Warrior (7-day streak)
  if (criteria.streak >= 7) {
    const medal = medals.find(m => m.id === 'streak_warrior');
    if (medal && !medal.earned) {
      medal.earned = true;
      medal.earnedDate = Date.now();
      earned = true;
    }
  }

  // Money Bags (1000 gems)
  if (criteria.gems >= 1000) {
    const medal = medals.find(m => m.id === 'money_bags');
    if (medal && !medal.earned) {
      medal.earned = true;
      medal.earnedDate = Date.now();
      earned = true;
    }
  }

  // Premium Member (has subscription)
  if (criteria.isPremium) {
    const medal = medals.find(m => m.id === 'premium_member');
    if (medal && !medal.earned) {
      medal.earned = true;
      medal.earnedDate = Date.now();
      earned = true;
    }
  }

  // Quest Master (10 quests completed)
  if (criteria.questsCompleted >= 10) {
    const medal = medals.find(m => m.id === 'quest_master');
    if (medal && !medal.earned) {
      medal.earned = true;
      medal.earnedDate = Date.now();
      earned = true;
    }
  }

  if (earned) {
    localStorage.setItem(MEDALS_KEY, JSON.stringify(medals));
  }

  return earned;
};

export const getMedalCount = (): number => {
  return getMedals().filter(m => m.earned).length;
};
