import React, { useState, useEffect } from 'react';

const FocusTimer = () => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes in seconds

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

    const handleStart = () => {
        setIsActive(true);
    };

    const handlePause = () => {
        setIsActive(false);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(1500);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="focus-timer">
            <h2>Focus Timer</h2>
            <div className="timer-display">{formatTime(timeLeft)}</div>
            <div className="timer-controls">
                <button onClick={handleStart} disabled={isActive}>Start</button>
                <button onClick={handlePause} disabled={!isActive}>Pause</button>
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
};

export default FocusTimer;