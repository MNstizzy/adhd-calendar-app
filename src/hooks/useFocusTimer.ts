import { useState, useEffect } from 'react';

const useFocusTimer = (initialTime = 25 * 60) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (!isActive && timeLeft !== 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startTimer = () => setIsActive(true);
    const stopTimer = () => setIsActive(false);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    return { timeLeft, isActive, startTimer, stopTimer, resetTimer };
};

export default useFocusTimer;