import React, { useState, useEffect } from 'react';

interface CrateRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (reward: any) => void;
}

const CrateRewardModal: React.FC<CrateRewardModalProps> = ({ isOpen, onClose, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const BRONZE_REWARDS = [
    { type: 'xp', amount: 50 },
    { type: 'xp', amount: 75 },
    { type: 'gems', amount: 5 },
    { type: 'xp', amount: 100 },
    { type: 'gems', amount: 10 },
    { type: 'xp', amount: 60 },
  ];

  const handleOpenCrate = () => {
    if (isOpening) return;

    setIsOpening(true);
    setScrollIndex(0);

    // Simulate scrolling through rewards
    let currentIndex = 0;
    const scrollInterval = setInterval(() => {
      currentIndex += 1;
      setScrollIndex(currentIndex % BRONZE_REWARDS.length);
    }, 100);

    // After 2 seconds of scrolling, pick a random reward
    setTimeout(() => {
      clearInterval(scrollInterval);
      const randomReward = BRONZE_REWARDS[Math.floor(Math.random() * BRONZE_REWARDS.length)];
      setSelectedReward(randomReward);
      onOpen(randomReward);
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsOpening(false);
        setSelectedReward(null);
        onClose();
      }, 1500);
    }, 2000);
  };

  const getRewardDisplay = (reward: any) => {
    if (reward.type === 'xp') {
      return `${reward.amount} XP`;
    } else {
      return `${reward.amount} 💎`;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999
    }}>
      <div className="panel" style={{
        maxWidth: 400,
        padding: 40,
        backgroundColor: 'var(--panel)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem' }}>🎉 Critical Hit!</h2>
        <p style={{ margin: '0 0 32px 0', color: 'var(--muted)' }}>
          You've earned a Free Bronze Crate!
        </p>

        {/* Crate Display */}
        <div style={{
          fontSize: '4rem',
          marginBottom: 24,
          animation: isOpening ? 'pulse 0.3s infinite' : 'none'
        }}>
          📦
        </div>

        {/* Reward Preview */}
        {isOpening && (
          <div style={{
            marginBottom: 24,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--accent)',
            minHeight: 32
          }}>
            {getRewardDisplay(BRONZE_REWARDS[scrollIndex])}
          </div>
        )}

        {/* Selected Reward Display */}
        {selectedReward && (
          <div style={{
            marginBottom: 24,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--accent-2)',
            minHeight: 32,
            animation: 'pulse 0.5s ease-out'
          }}>
            {getRewardDisplay(selectedReward)}
          </div>
        )}

        {/* Open Button */}
        <button
          className="btn primary"
          onClick={handleOpenCrate}
          disabled={isOpening}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '1rem',
            opacity: isOpening ? 0.6 : 1,
            cursor: isOpening ? 'not-allowed' : 'pointer'
          }}
        >
          {isOpening ? 'Opening...' : 'Open Crate'}
        </button>

        <button
          className="btn ghost"
          onClick={onClose}
          disabled={isOpening}
          style={{
            width: '100%',
            marginTop: 12,
            opacity: isOpening ? 0.5 : 1,
            cursor: isOpening ? 'not-allowed' : 'pointer'
          }}
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CrateRewardModal;
