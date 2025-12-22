import React from 'react';

const Controls: React.FC<{ onStart: () => void; onPause: () => void; onReset: () => void; isRunning: boolean }> = ({ onStart, onPause, onReset, isRunning }) => {
    return (
        <div className="flex justify-center space-x-4">
            <button 
                onClick={isRunning ? onPause : onStart} 
                className={`px-4 py-2 text-white rounded ${isRunning ? 'bg-red-500' : 'bg-green-500'}`}
            >
                {isRunning ? 'Pause' : 'Start'}
            </button>
            <button 
                onClick={onReset} 
                className="px-4 py-2 text-white bg-gray-500 rounded"
            >
                Reset
            </button>
        </div>
    );
};

export default Controls;