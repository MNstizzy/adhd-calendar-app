import React, { useState, useEffect } from 'react';
import { getXp } from '../services/xp';
import { getGems } from '../services/currency';
import { getMedals } from '../services/medals';

const PROFILE_KEY = 'adhd_profile';
const STREAK_KEY = 'adhd_streak';
const QUESTS_KEY = 'adhd_quests_progress';

interface InsightCard {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
}

const PersonalInsights: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [currentXp, setCurrentXp] = useState(0);
  const [currentGems, setCurrentGems] = useState(0);
  const [medals, setMedals] = useState<any[]>([]);

  useEffect(() => {
    // Load profile
    const profileStr = localStorage.getItem(PROFILE_KEY);
    if (profileStr) {
      setProfile(JSON.parse(profileStr));
    }

    // Load streak
    const streakStr = localStorage.getItem(STREAK_KEY);
    if (streakStr) {
      setStreak(JSON.parse(streakStr));
    }

    // Load quests
    const questsStr = localStorage.getItem(QUESTS_KEY);
    if (questsStr) {
      setQuests(JSON.parse(questsStr));
    }

    // Load XP and Gems
    setCurrentXp(getXp());
    setCurrentGems(getGems());

    // Load medals
    setMedals(getMedals());

    // Generate insights
    generateInsights();
  }, []);

  const generateInsights = () => {
    const profileStr = localStorage.getItem(PROFILE_KEY);
    const profile = profileStr ? JSON.parse(profileStr) : {};
    const streakStr = localStorage.getItem(STREAK_KEY);
    const streak = streakStr ? JSON.parse(streakStr) : { current: 0, longest: 0 };
    const questsStr = localStorage.getItem(QUESTS_KEY);
    const quests = questsStr ? JSON.parse(questsStr) : [];

    const insightCards: InsightCard[] = [
      {
        title: 'Total Tasks Completed',
        value: profile.tasksCompleted || 0,
        icon: '✅',
        description: 'You\'ve crushed it! Keep going!'
      },
      {
        title: 'Current Streak',
        value: streak.current || 0,
        icon: '🔥',
        description: streak.current > 0 ? `${streak.current} days of consistency` : 'Start a new streak!'
      },
      {
        title: 'Longest Streak',
        value: streak.longest || 0,
        icon: '⭐',
        description: 'Your personal best!'
      },
      {
        title: 'Quests Completed',
        value: quests.filter((q: any) => q.completed).length,
        icon: '🏆',
        description: `${quests.filter((q: any) => q.completed).length} of ${quests.length} total`
      },
      {
        title: 'Medals Earned',
        value: getMedals().filter(m => m.earned).length,
        icon: '🎖️',
        description: 'Achievements unlocked!'
      },
      {
        title: 'Total XP Earned',
        value: getXp(),
        icon: '📦',
        description: 'Experience points accumulated'
      },
    ];

    setInsights(insightCards);
  };

  const completedQuests = quests.filter(q => q.completed).length;
  const earnedMedals = medals.filter(m => m.earned).length;
  const averageTasksPerDay = profile?.tasksCompleted ? (profile.tasksCompleted / Math.max(streak?.longest || 1, 1)).toFixed(1) : 0;

  return (
    <div className="container">
      <div style={{ maxWidth: 900, margin: '24px auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>📊 Personal Insights</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 0 }}>
            Your journey of growth and achievement
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="panel"
              style={{
                padding: 24,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(90, 208, 168, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{insight.icon}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 8 }}>
                {insight.title}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: 8 }}>
                {insight.value}
              </div>
              {insight.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {insight.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Achievement Summary */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16 }}>🎯 Achievement Summary</h2>
          <div className="panel" style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>
                {profile?.tasksCompleted || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Tasks Completed</div>
              {averageTasksPerDay && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                  ~{averageTasksPerDay}/day
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ec4899', marginBottom: 4 }}>
                {completedQuests}/{quests.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Quests Done</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                {quests.length > 0 ? `${Math.round((completedQuests / quests.length) * 100)}%` : '0%'} completed
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#06b6d4', marginBottom: 4 }}>
                {earnedMedals}/{medals.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Medals Earned</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                {medals.length > 0 ? `${Math.round((earnedMedals / medals.length) * 100)}%` : '0%'} unlocked
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: 4 }}>
                {currentGems}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Gems Collected</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                💎 In pocket
              </div>
            </div>
          </div>
        </section>

        {/* Personal Observations */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16 }}>💡 Personal Observations</h2>
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8 }}>📈 Progress Trend</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {profile?.tasksCompleted > 20 
                    ? '🔥 You\'re on a roll! Your consistency is impressive.' 
                    : profile?.tasksCompleted > 10 
                    ? '💪 Great effort! You\'re building momentum.' 
                    : '🌱 Every journey starts with a single step. Keep going!'}
                </div>
              </div>

              <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8 }}>🔥 Streak Status</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {streak?.current > 7
                    ? `Amazing! You've maintained a ${streak.current}-day streak. Don't break it! 🎯`
                    : streak?.current > 0
                    ? `You're on a ${streak.current}-day streak. Keep the momentum going!`
                    : 'Start a new streak today and build consistency!'}
                </div>
              </div>

              <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8 }}>🏆 Quest Progress</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {completedQuests === quests.length && quests.length > 0
                    ? `Incredible! You've completed all available quests. You're a quest master! 🎉`
                    : completedQuests > 0
                    ? `You've completed ${completedQuests} quest${completedQuests > 1 ? 's' : ''}. Great work! Keep completing more.`
                    : 'Start completing quests to earn rewards and achievements!'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8 }}>🎖️ Achievement Status</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {earnedMedals === medals.length && medals.length > 0
                    ? `🌟 Perfect! You've unlocked all available medals. You are unstoppable!`
                    : earnedMedals > 0
                    ? `You've earned ${earnedMedals} medal${earnedMedals > 1 ? 's' : ''}. ${medals.length - earnedMedals} more to unlock!`
                    : 'Earn medals by completing tasks, quests, and achieving milestones.'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips & Encouragement */}
        <section>
          <h2 style={{ marginBottom: 16 }}>💭 Tips for Success</h2>
          <div className="panel" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)' }}>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: '1.8' }}>
              <li>✨ Focus on consistency over perfection - every small task counts!</li>
              <li>🎯 Use streaks as motivation - they compound over time</li>
              <li>🏆 Complete quests regularly for extra rewards and badges</li>
              <li>🎖️ Work towards unlocking all medals for ultimate achievement</li>
              <li>💎 Collect gems and XP to unlock exclusive features in the store</li>
              <li>🔥 If you break a streak, don't give up - start a new one immediately</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PersonalInsights;
