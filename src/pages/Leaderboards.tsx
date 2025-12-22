import React, { useState, useEffect } from 'react';
import Button from '../components/UI/Button';

const PROFILE_KEY = 'adhd_profile';
const XP_KEY = 'adhd_xp';
const LEADERBOARD_KEY = 'adhd_leaderboard_monthly';
const FRIENDS_KEY = 'adhd_friends';
const LEADERBOARD_RESET_KEY = 'adhd_leaderboard_reset_date';

interface LeaderboardEntry {
    id: string;
    username: string;
    avatar: string;
    xp: number;
    level: number;
}

interface MonthlyResetInfo {
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    totalDaysLeft: number;
}

const Leaderboards: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [resetInfo, setResetInfo] = useState<MonthlyResetInfo>({
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        totalDaysLeft: 0,
    });

    // Calculate time until next month reset
    const calculateResetTime = (): MonthlyResetInfo => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diffMs = nextMonth.getTime() - now.getTime();
        
        const totalDaysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            daysLeft: totalDaysLeft,
            hoursLeft,
            minutesLeft,
            totalDaysLeft,
        };
    };

    // Check if leaderboard needs to reset
    const checkAndResetLeaderboard = () => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
        
        const storedResetDate = localStorage.getItem(LEADERBOARD_RESET_KEY);
        
        if (storedResetDate !== currentMonth) {
            // Month has changed, reset the leaderboard
            localStorage.setItem(LEADERBOARD_RESET_KEY, currentMonth);
            localStorage.removeItem(LEADERBOARD_KEY);
            return true;
        }
        return false;
    };

    useEffect(() => {
        try {
            // Check if leaderboard needs to reset
            checkAndResetLeaderboard();
            
            // Calculate reset time
            const info = calculateResetTime();
            setResetInfo(info);

            // Set up interval to update timer every minute
            const interval = setInterval(() => {
                const newInfo = calculateResetTime();
                setResetInfo(newInfo);
            }, 60000);

            // Get user's current profile and XP
            const profileStr = localStorage.getItem(PROFILE_KEY);
            const profile = profileStr ? JSON.parse(profileStr) : { username: 'Player', avatar: '👤' };
            
            const xpStr = localStorage.getItem(XP_KEY);
            const userXp = xpStr ? JSON.parse(xpStr) : { current: 0, total: 0 };
            
            const userLevel = Math.floor(userXp.total / 100) + 1;
            
            // Get friends list
            const friendsStr = localStorage.getItem(FRIENDS_KEY);
            const friendsList = friendsStr ? new Set(JSON.parse(friendsStr)) : new Set();
            setFriends(friendsList);
            
            // Get or create leaderboard data
            let storedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
            let leaderboardData: LeaderboardEntry[] = [];
            
            if (storedLeaderboard) {
                try {
                    const parsed = JSON.parse(storedLeaderboard);
                    // Validate entries have required properties
                    leaderboardData = Array.isArray(parsed) 
                        ? parsed.filter(entry => entry && typeof entry.xp === 'number')
                        : [];
                } catch (e) {
                    leaderboardData = [];
                }
            }
            
            // Create user entry
            const userEntry: LeaderboardEntry = {
                id: 'player',
                username: profile.username,
                avatar: profile.avatar || '👤',
                xp: userXp.total || 0,
                level: userLevel,
            };
            
            // Filter out old user entry and add updated one
            leaderboardData = leaderboardData.filter(entry => entry && entry.id !== 'player');
            leaderboardData.push(userEntry);
            
            // Sort by XP descending
            leaderboardData.sort((a, b) => (b.xp || 0) - (a.xp || 0));
            
            // Find user rank
            const rank = leaderboardData.findIndex(entry => entry.id === 'player') + 1;
            setUserRank(rank);
            setLeaderboard(leaderboardData);
            
            // Save updated leaderboard
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboardData));

            return () => clearInterval(interval);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            setLeaderboard([]);
        }
    }, []);

    // Add some mock data if leaderboard is mostly empty
    const displayLeaderboard = leaderboard.length > 0 ? leaderboard : [
        { id: '1', username: 'You', avatar: '🌟', xp: 500, level: 6 },
        { id: '2', username: 'TaskMaster', avatar: '🚀', xp: 1200, level: 13 },
        { id: '3', username: 'FocusNinja', avatar: '🧘', xp: 950, level: 10 },
        { id: '4', username: 'ProductivityKing', avatar: '👑', xp: 850, level: 9 },
        { id: '5', username: 'HabitBuilder', avatar: '🏗️', xp: 750, level: 8 },
    ];

    // Filter leaderboard based on active tab
    const filteredLeaderboard = activeTab === 'friends' 
        ? displayLeaderboard.filter(entry => entry.id === 'player' || friends.has(entry.id))
        : displayLeaderboard;

    // Calculate user rank for current tab
    const currentUserRank = filteredLeaderboard.findIndex(entry => entry.id === 'player') + 1;

    return (
        <div className="container">
            <div className="panel" style={{ maxWidth: 700, margin: '24px auto' }}>
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                    <h2 style={{ margin: '0 0 8px 0' }}>🏆 Leaderboards</h2>
                    <div className="subtle">Compete with others. Complete tasks. Earn XP.</div>
                    <div style={{
                        marginTop: 12,
                        padding: '8px 12px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 6,
                        border: '1px solid var(--primary)',
                        fontSize: '0.85rem',
                        color: 'var(--text)',
                    }}>
                        Resets Monthly • Next reset in {resetInfo.daysLeft}d {resetInfo.hoursLeft}h {resetInfo.minutesLeft}m
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 24,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 12,
                    justifyContent: 'center',
                }}>
                    <button
                        onClick={() => setActiveTab('global')}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            background: activeTab === 'global' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'global' ? 'white' : 'var(--text)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: activeTab === 'global' ? 'bold' : 'normal',
                            fontSize: '0.95rem',
                        }}
                    >
                        🌍 Global
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            background: activeTab === 'friends' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'friends' ? 'white' : 'var(--text)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: activeTab === 'friends' ? 'bold' : 'normal',
                            fontSize: '0.95rem',
                        }}
                    >
                        👥 Friends
                    </button>
                </div>

                {currentUserRank > 0 && (
                    <div style={{
                        background: 'var(--panel)',
                        border: '2px solid var(--primary)',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 24,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 4 }}>YOUR RANK</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>#{currentUserRank}</div>
                    </div>
                )}

                {filteredLeaderboard.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 32,
                        color: 'var(--text-secondary)',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>👥</div>
                        <div>No friends on the leaderboard yet!</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filteredLeaderboard.map((entry, index) => (
                            <div
                                key={entry.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 12,
                                    background: 'var(--panel)',
                                    borderRadius: 8,
                                    border: entry.id === 'player' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                }}
                            >
                                <div style={{
                                    minWidth: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                }}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </div>

                                <div style={{
                                    fontSize: '1.8rem',
                                    minWidth: 40,
                                    textAlign: 'center',
                                }}>
                                    {entry.avatar}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                        {entry.username}
                                        {entry.id === 'player' && <span style={{ color: 'var(--primary)', marginLeft: 8 }}>(You)</span>}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Level {entry.level}
                                    </div>
                                </div>

                                <div style={{
                                    textAlign: 'right',
                                    minWidth: 80,
                                }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                        {(entry.xp || 0).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>XP</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: 32, padding: 16, background: 'var(--panel)', borderRadius: 8, textAlign: 'center' }}>
                    <div className="subtle" style={{ marginBottom: 12 }}>
                        Complete tasks and focus sessions to earn XP and climb the leaderboard!
                    </div>
                    <Button onClick={() => window.location.href = '/'}>Back to Dashboard</Button>
                </div>
            </div>
        </div>
    );
};

export default Leaderboards;
