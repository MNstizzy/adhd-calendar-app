import { getXp, setXp } from './xp';
import { getGems, addGems } from './currency';

const SKILLS_KEY = 'adhd_skills';

export type SkillTree = 'forgiveness' | 'xp_mastery' | 'pet_power';
export type CostType = 'xp' | 'gems';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  costType: CostType;
  tree: SkillTree;
  level: number; // 1-based progression level
  effects: string[]; // Description of what the skill does
  unlocked: boolean;
  purchased: boolean;
  prerequisites?: string[]; // IDs of skills that must be unlocked first
}

export interface SkillTreeState {
  unlockedSkills: Set<string>;
  purchasedSkills: Set<string>;
  skillPoints: number;
}

// Define all available skills
export const SKILLS: Record<string, Skill> = {
  // Forgiveness Tree
  'forgive_skip_day': {
    id: 'forgive_skip_day',
    name: 'Skip a Day',
    description: 'Skip one day without losing your streak',
    icon: '⏭️',
    cost: 100,
    costType: 'xp',
    tree: 'forgiveness',
    level: 1,
    effects: ['Use once to skip a day without losing streak bonus'],
    unlocked: false,
    purchased: false,
  },
  'forgive_retry': {
    id: 'forgive_retry',
    name: 'Task Retry',
    description: 'Get another attempt on a failed task',
    icon: '🔄',
    cost: 50,
    costType: 'xp',
    tree: 'forgiveness',
    level: 1,
    effects: ['Retry a task you marked as incomplete'],
    unlocked: false,
    purchased: false,
  },
  'forgive_double_streak': {
    id: 'forgive_double_streak',
    name: 'Streak Multiplier',
    description: '2x your streak bonus rewards',
    icon: '⚡',
    cost: 150,
    costType: 'xp',
    tree: 'forgiveness',
    level: 2,
    effects: ['Doubles XP gained from streak bonuses'],
    unlocked: false,
    purchased: false,
    prerequisites: ['forgive_skip_day'],
  },
  'forgive_extend': {
    id: 'forgive_extend',
    name: 'Emergency Extension',
    description: 'Extend a task due date by 1 day',
    icon: '📅',
    cost: 75,
    costType: 'xp',
    tree: 'forgiveness',
    level: 1,
    effects: ['Use to extend a task deadline when you need more time'],
    unlocked: false,
    purchased: false,
  },

  // XP Mastery Tree
  'xp_boost_10': {
    id: 'xp_boost_10',
    name: 'XP Boost +10%',
    description: 'Gain 10% more XP from all tasks',
    icon: '📈',
    cost: 80,
    costType: 'xp',
    tree: 'xp_mastery',
    level: 1,
    effects: ['+10% XP from completing tasks'],
    unlocked: false,
    purchased: false,
  },
  'xp_streak_bonus': {
    id: 'xp_streak_bonus',
    name: 'Streak Bonus',
    description: '+5% XP per day of streak',
    icon: '🔥',
    cost: 100,
    costType: 'xp',
    tree: 'xp_mastery',
    level: 1,
    effects: ['Earn bonus XP based on current streak (5% per day)'],
    unlocked: false,
    purchased: false,
  },
  'xp_combo': {
    id: 'xp_combo',
    name: 'Task Combo',
    description: 'Complete 3 tasks in a row for 25% bonus XP',
    icon: '🎯',
    cost: 120,
    costType: 'xp',
    tree: 'xp_mastery',
    level: 2,
    effects: ['Complete 3 consecutive tasks to earn 25% XP bonus'],
    unlocked: false,
    purchased: false,
    prerequisites: ['xp_boost_10'],
  },
  'xp_social': {
    id: 'xp_social',
    name: 'Social XP',
    description: 'Earn XP by helping friends',
    icon: '👥',
    cost: 90,
    costType: 'xp',
    tree: 'xp_mastery',
    level: 1,
    effects: ['Gain XP when friends complete their tasks'],
    unlocked: false,
    purchased: false,
  },

  // Pet Power Tree
  'pet_xp_boost': {
    id: 'pet_xp_boost',
    name: 'Pet XP Boost',
    description: 'Your pet gains 15% more XP',
    icon: '🐣',
    cost: 85,
    costType: 'xp',
    tree: 'pet_power',
    level: 1,
    effects: ['+15% XP gains for your pet'],
    unlocked: false,
    purchased: false,
  },
  'pet_discount': {
    id: 'pet_discount',
    name: 'Efficient Feeding',
    description: 'Pet feeding costs 2 gems instead of 5',
    icon: '💎',
    cost: 110,
    costType: 'xp',
    tree: 'pet_power',
    level: 1,
    effects: ['Reduce pet feeding gem cost from 5 to 2'],
    unlocked: false,
    purchased: false,
  },
  'pet_talent': {
    id: 'pet_talent',
    name: 'Pet Talent',
    description: 'Unlock special pet abilities',
    icon: '✨',
    cost: 130,
    costType: 'xp',
    tree: 'pet_power',
    level: 2,
    effects: ['Pet can perform special actions for bonus rewards'],
    unlocked: false,
    purchased: false,
    prerequisites: ['pet_xp_boost'],
  },
  'pet_buddy': {
    id: 'pet_buddy',
    name: 'Buddy Bonus',
    description: 'Get rewards when pet reaches new level',
    icon: '🎁',
    cost: 95,
    costType: 'xp',
    tree: 'pet_power',
    level: 1,
    effects: ['Earn XP and gems when your pet levels up'],
    unlocked: false,
    purchased: false,
  },
};

// Initialize skill tree state
export const initializeSkillTree = (): SkillTreeState => {
  const stored = localStorage.getItem(SKILLS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      unlockedSkills: new Set(parsed.unlockedSkills),
      purchasedSkills: new Set(parsed.purchasedSkills),
      skillPoints: parsed.skillPoints || 0,
    };
  }
  return {
    unlockedSkills: new Set(),
    purchasedSkills: new Set(),
    skillPoints: 0,
  };
};

// Get all skills with current unlock/purchase status
export const getAllSkills = (): Skill[] => {
  const state = initializeSkillTree();
  return Object.values(SKILLS).map(skill => ({
    ...skill,
    unlocked: state.unlockedSkills.has(skill.id),
    purchased: state.purchasedSkills.has(skill.id),
  }));
};

// Get skills by tree
export const getSkillsByTree = (tree: SkillTree): Skill[] => {
  return getAllSkills().filter(skill => skill.tree === tree);
};

// Check if prerequisites are met
export const canUnlockSkill = (skillId: string): boolean => {
  const skill = SKILLS[skillId];
  if (!skill || !skill.prerequisites) return true;

  const state = initializeSkillTree();
  return skill.prerequisites.every(prereqId => state.purchasedSkills.has(prereqId));
};

// Unlock a skill (purchase it)
export const purchaseSkill = (skillId: string): boolean => {
  const skill = SKILLS[skillId];
  if (!skill) return false;

  const state = initializeSkillTree();

  // Check if already purchased
  if (state.purchasedSkills.has(skillId)) {
    console.warn('Skill already purchased');
    return false;
  }

  // Check prerequisites
  if (!canUnlockSkill(skillId)) {
    console.warn('Prerequisites not met');
    return false;
  }

  // Check cost
  if (skill.costType === 'xp') {
    const currentXp = getXp();
    if (currentXp < skill.cost) {
      console.warn('Not enough XP');
      return false;
    }
    setXp(currentXp - skill.cost);
  } else if (skill.costType === 'gems') {
    const currentGems = getGems();
    if (currentGems < skill.cost) {
      console.warn('Not enough gems');
      return false;
    }
    addGems(-skill.cost);
  }

  // Mark as purchased and unlocked
  state.purchasedSkills.add(skillId);
  state.unlockedSkills.add(skillId);

  // Save state
  saveSkillTree(state);
  return true;
};

// Check if skill is purchased
export const isSkillPurchased = (skillId: string): boolean => {
  const state = initializeSkillTree();
  return state.purchasedSkills.has(skillId);
};

// Get active skill effects
export const getActiveSkills = (): Skill[] => {
  return getAllSkills().filter(skill => skill.purchased);
};

// Get unlocked skills (for dev menu)
export const getUnlockedSkills = (): string[] => {
  const state = initializeSkillTree();
  return Array.from(state.purchasedSkills);
};

// Unlock skill without cost (for dev menu)
export const unlockSkill = (skillId: string): boolean => {
  const skill = SKILLS[skillId];
  if (!skill) return false;

  const state = initializeSkillTree();
  state.purchasedSkills.add(skillId);
  state.unlockedSkills.add(skillId);

  saveSkillTree(state);
  window.dispatchEvent(new CustomEvent('skillUnlocked', { detail: { skillId } }));
  return true;
};

// Calculate XP multiplier from skills
export const getXpMultiplier = (): number => {
  const active = getActiveSkills();
  let multiplier = 1;

  if (active.find(s => s.id === 'xp_boost_10')) multiplier *= 1.1;
  if (active.find(s => s.id === 'xp_combo')) multiplier *= 1.25;

  return multiplier;
};

// Get pet feeding discount
export const getPetFeedingCost = (): number => {
  const active = getActiveSkills();
  const hasDicount = active.find(s => s.id === 'pet_discount');
  return hasDicount ? 2 : 5;
};

// Save skill tree state
const saveSkillTree = (state: SkillTreeState) => {
  localStorage.setItem(SKILLS_KEY, JSON.stringify({
    unlockedSkills: Array.from(state.unlockedSkills),
    purchasedSkills: Array.from(state.purchasedSkills),
    skillPoints: state.skillPoints,
  }));
};
