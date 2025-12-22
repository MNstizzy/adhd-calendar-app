// Critical Success System
// Chance for bonus rewards on XP-giving actions

export interface CriticalResult {
  isCritical: boolean;
  xpMultiplier: number; // 2 for critical, 1 for normal
  crateReward: boolean; // Whether to award a random crate
}

// Probabilities (as percentages)
const DEFAULT_CRITICAL_HIT_CHANCE = 8; // 8% chance for 2x XP
const DEFAULT_CRATE_REWARD_CHANCE = 2; // 2% chance for bonus crate

// Dev mode overrides
const CRITICAL_TEST_MODE_KEY = 'adhd_critical_test_mode';
const CRATE_TEST_MODE_KEY = 'adhd_crate_test_mode';

/**
 * Calculate if an XP action results in a critical success
 * @returns Object with critical status, XP multiplier, and crate reward
 */
export const calculateCritical = (): CriticalResult => {
  // Check if dev test modes are enabled
  const criticalTestMode = localStorage.getItem(CRITICAL_TEST_MODE_KEY) === 'true';
  const crateTestMode = localStorage.getItem(CRATE_TEST_MODE_KEY) === 'true';
  
  const CRITICAL_HIT_CHANCE = criticalTestMode ? 100 : DEFAULT_CRITICAL_HIT_CHANCE;
  const CRATE_REWARD_CHANCE = crateTestMode ? 100 : DEFAULT_CRATE_REWARD_CHANCE;
  
  const random = Math.random() * 100;
  
  let xpMultiplier = 1;
  let crateReward = false;

  // Check for 2x XP critical hit
  if (random < CRITICAL_HIT_CHANCE) {
    xpMultiplier = 2;
  }

  // Check for crate reward (independent of XP critical)
  if (Math.random() * 100 < CRATE_REWARD_CHANCE) {
    crateReward = true;
  }

  return {
    isCritical: xpMultiplier === 2,
    xpMultiplier,
    crateReward,
  };
};

/**
 * Get the probability percentages for display purposes
 */
export const getCriticalChances = () => {
  const criticalTestMode = localStorage.getItem(CRITICAL_TEST_MODE_KEY) === 'true';
  const crateTestMode = localStorage.getItem(CRATE_TEST_MODE_KEY) === 'true';
  return {
    criticalHitChance: criticalTestMode ? 100 : DEFAULT_CRITICAL_HIT_CHANCE,
    crateRewardChance: crateTestMode ? 100 : DEFAULT_CRATE_REWARD_CHANCE,
  };
};

/**
 * Enable test mode (100% critical chance)
 */
export const enableCriticalTestMode = () => {
  localStorage.setItem(CRITICAL_TEST_MODE_KEY, 'true');
};

/**
 * Disable test mode (revert to default chances)
 */
export const disableCriticalTestMode = () => {
  localStorage.removeItem(CRITICAL_TEST_MODE_KEY);
};

/**
 * Check if test mode is enabled
 */
export const isCriticalTestModeEnabled = () => {
  return localStorage.getItem(CRITICAL_TEST_MODE_KEY) === 'true';
};

/**
 * Enable crate test mode (100% crate chance)
 */
export const enableCrateTestMode = () => {
  localStorage.setItem(CRATE_TEST_MODE_KEY, 'true');
};

/**
 * Disable crate test mode (revert to default chances)
 */
export const disableCrateTestMode = () => {
  localStorage.removeItem(CRATE_TEST_MODE_KEY);
};

/**
 * Check if crate test mode is enabled
 */
export const isCrateTestModeEnabled = () => {
  return localStorage.getItem(CRATE_TEST_MODE_KEY) === 'true';
};
