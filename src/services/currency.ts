const CURRENCY_KEY = 'adhd_gems';

export const getGems = (): number => {
    const stored = localStorage.getItem(CURRENCY_KEY);
    return stored ? parseInt(stored, 10) : 0;
};

export const setGems = (amount: number): void => {
    localStorage.setItem(CURRENCY_KEY, String(amount));
};

export const addGems = (amount: number): number => {
    const current = getGems();
    const newAmount = current + amount;
    setGems(newAmount);
    return newAmount;
};

export const spendGems = (amount: number): boolean => {
    const current = getGems();
    if (current >= amount) {
        setGems(current - amount);
        return true;
    }
    return false;
};
