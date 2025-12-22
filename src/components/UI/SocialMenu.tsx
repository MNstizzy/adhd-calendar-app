import React, { useState, useEffect } from 'react';

interface SocialMenuProps {
  open: boolean;
  onClose: () => void;
  currentProfile?: any;
}

const FRIENDS_KEY = 'adhd_friends';
const MESSAGES_KEY = 'adhd_messages';
const PROFILE_KEY = 'adhd_profile';
const USERS_KEY = 'adhd_users';

interface Friend {
  id: string;
  username: string;
  hashtag: string;
  avatar: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
}

const SocialMenu: React.FC<SocialMenuProps> = ({ open, onClose, currentProfile }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'messages'>('friends');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [newFriendHashtag, setNewFriendHashtag] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common emojis for quick access
  const EMOJIS = ['😀', '😂', '😍', '🤔', '😎', '🎉', '🔥', '👍', '❤️', '✨', '🚀', '💪', '🤝', '😅', '🎊', '💯'];


  // Load friends list and user profile
  useEffect(() => {
    const loadProfile = () => {
      // Use provided profile or load from localStorage
      const profile = currentProfile || ((() => {
        const profileStr = localStorage.getItem(PROFILE_KEY);
        return profileStr ? JSON.parse(profileStr) : { username: 'Player', hashtag: '1000', avatar: '👤' };
      })());
      setUserProfile(profile);
    };

    loadProfile();

    const friendsStr = localStorage.getItem(FRIENDS_KEY);
    const friendsSet = friendsStr ? new Set(JSON.parse(friendsStr)) : new Set();
    // Convert to array (in a real app, you'd fetch actual friend data)
    const friendsArray: Friend[] = Array.from(friendsSet).map((id: any) => ({
      id,
      username: `Friend_${id}`,
      avatar: '👤',
    }));
    setFriends(friendsArray);

    // Load messages
    const messagesStr = localStorage.getItem(MESSAGES_KEY);
    setMessages(messagesStr ? JSON.parse(messagesStr) : []);

    // Listen for custom profile update events
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
  }, [currentProfile]);

  const addFriend = () => {
    setErrorMessage('');
    
    if (!newFriendUsername.trim()) {
      setErrorMessage('Username is required');
      return;
    }
    
    // Check if user exists
    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    const hashtag = newFriendHashtag.trim();
    const userExists = users.some((user: any) => 
      user.username.toLowerCase() === newFriendUsername.toLowerCase() &&
      (hashtag === '' || user.hashtag === hashtag)
    );
    
    if (!userExists) {
      setErrorMessage('User not found. Make sure the username and hashtag are correct.');
      return;
    }
    
    const finalHashtag = hashtag || users.find((user: any) => user.username.toLowerCase() === newFriendUsername.toLowerCase())?.hashtag;
    const newFriendId = `${newFriendUsername.toLowerCase().replace(/\s+/g, '_')}#${finalHashtag}`;
    
    // Check if already a friend
    if (friends.some(f => f.id === newFriendId)) {
      setErrorMessage('Already friends with this user');
      return;
    }
    
    const newFriend: Friend = {
      id: newFriendId,
      username: newFriendUsername,
      hashtag: finalHashtag.toString(),
      avatar: '👤',
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    setNewFriendUsername('');
    setNewFriendHashtag('');

    // Save to localStorage
    const friendsSet = new Set(updatedFriends.map(f => f.id));
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(Array.from(friendsSet)));
  };

  const removeFriend = (friendId: string) => {
    const updatedFriends = friends.filter(f => f.id !== friendId);
    setFriends(updatedFriends);

    // Save to localStorage
    const friendsSet = new Set(updatedFriends.map(f => f.id));
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(Array.from(friendsSet)));
  };

  const sendMessage = () => {
    if (!messageText.trim() || !selectedFriend) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      from: 'You',
      to: selectedFriend,
      text: messageText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessageText('');
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
  };

  const addEmoji = (emoji: string) => {
    setMessageText(messageText + emoji);
    setShowEmojiPicker(false);
  };

  const deleteConversation = (friendId: string) => {
    const updatedMessages = messages.filter(m => 
      !((m.from === 'You' && m.to === friendId) || (m.from === friendId && m.to === 'You'))
    );
    setMessages(updatedMessages);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
    if (selectedFriend === friendId) {
      setSelectedFriend(null);
    }
  };

  const getMessagesWithFriend = (friendId: string) => {
    return messages.filter(m => (m.from === 'You' && m.to === friendId) || (m.from === friendId && m.to === 'You'));
  };

  const getConversations = () => {
    // Get unique friends that have messages
    const friendsWithMessages = new Map<string, Message>();
    
    messages.forEach(msg => {
      const friendId = msg.from === 'You' ? msg.to : msg.from;
      if (!friendsWithMessages.has(friendId) || friendsWithMessages.get(friendId)!.timestamp < msg.timestamp) {
        friendsWithMessages.set(friendId, msg);
      }
    });

    // Sort by most recent message
    return Array.from(friendsWithMessages.entries())
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .map(([friendId, lastMsg]) => ({
        friendId,
        lastMessage: lastMsg,
        friend: friends.find(f => f.id === friendId),
      }))
      .filter(conv => conv.friend); // Only include if friend still exists
  };

  return (
    <>
      <aside 
        className={`sidebar ${open ? 'open' : ''}`} 
        aria-hidden={!open} 
        style={{
          left: 'auto',
          right: 0,
          transform: open ? 'translateX(0)' : 'translateX(110%)',
        }}
      >
        <div className="sidebar-inner panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, textAlign: 'center' }}>
            <h4 style={{ margin: 0, flex: 1, fontSize: '1.3rem' }}>👥 Social</h4>
            <button 
              onClick={() => {
                console.log('Close button clicked, calling onClose');
                onClose();
              }} 
              className="btn ghost"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            <button
              onClick={() => setActiveTab('friends')}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: 'none',
                background: activeTab === 'friends' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'friends' ? 'white' : 'var(--text)',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: activeTab === 'friends' ? 'bold' : 'normal',
                fontSize: '0.9rem',
              }}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: 'none',
                background: activeTab === 'messages' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'messages' ? 'white' : 'var(--text)',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: activeTab === 'messages' ? 'bold' : 'normal',
                fontSize: '0.9rem',
              }}
            >
              Messages
            </button>
          </div>

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={newFriendUsername}
                    onChange={(e) => {setNewFriendUsername(e.target.value); setErrorMessage('');}}
                    onKeyPress={(e) => e.key === 'Enter' && addFriend()}
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="#1234"
                    value={newFriendHashtag}
                    onChange={(e) => {setNewFriendHashtag(e.target.value); setErrorMessage('');}}
                    onKeyPress={(e) => e.key === 'Enter' && addFriend()}
                    className="input"
                    style={{ width: 100 }}
                  />
                </div>
                {errorMessage && (
                  <div style={{ color: 'var(--danger, #ff6b6b)', fontSize: '0.85rem', padding: 8, background: 'rgba(255, 107, 107, 0.1)', borderRadius: 4, marginBottom: 8 }}>
                    {errorMessage}
                  </div>
                )}
                <button
                  onClick={addFriend}
                  className="btn"
                  style={{ width: '100%' }}
                >
                  Add Friend
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                {/* User Profile Card */}
                {userProfile && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                      borderRadius: 8,
                      border: '2px solid var(--accent-2)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Banner glow effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: -20,
                      width: 100,
                      height: 100,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }} />
                    
                    <div style={{ fontSize: '1.5rem', position: 'relative', zIndex: 1 }}>{userProfile.avatar}</div>
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'white' }}>{userProfile.username}<span style={{ color: 'rgba(255,255,255,0.8)', marginLeft: 4 }}>#{userProfile.hashtag}</span></div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: 0.5 }}>YOU</div>
                    </div>
                  </div>
                )}

                {/* Friends List */}
                {friends.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 16 }}>
                    No friends yet. Add one to get started!
                  </div>
                ) : (
                  friends.map(friend => (
                    <div
                      key={friend.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        background: 'var(--panel)',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>{friend.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{friend.username}<span style={{ color: 'var(--muted)', marginLeft: 4 }}>#{friend.hashtag}</span></div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFriend(friend.id);
                          setActiveTab('messages');
                        }}
                        className="btn ghost"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        💬
                      </button>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="btn ghost"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger, #ff6b6b)' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
              {selectedFriend ? (
                <>
                  <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setSelectedFriend(null)}
                      className="btn ghost"
                      style={{ marginBottom: 8 }}
                    >
                      ← Back
                    </button>
                    <div style={{ fontWeight: 'bold' }}>
                      {friends.find(f => f.id === selectedFriend)?.username}<span style={{ color: 'var(--muted)', marginLeft: 4 }}>#{friends.find(f => f.id === selectedFriend)?.hashtag}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12, minHeight: 200, maxHeight: 300, padding: 8, background: 'var(--panel)', borderRadius: 6 }}>
                    {getMessagesWithFriend(selectedFriend).length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 16 }}>
                        No messages yet. Start a conversation!
                      </div>
                    ) : (
                      getMessagesWithFriend(selectedFriend).map(msg => (
                        <div
                          key={msg.id}
                          style={{
                            marginBottom: 8,
                            padding: 8,
                            background: msg.from === 'You' ? 'var(--primary)' : 'var(--border)',
                            borderRadius: 6,
                            color: msg.from === 'You' ? 'white' : 'var(--text)',
                            textAlign: msg.from === 'You' ? 'right' : 'left',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 4 }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="btn ghost"
                      style={{ padding: '8px 12px' }}
                      title="Add emoji"
                    >
                      😊
                    </button>
                    <button
                      onClick={sendMessage}
                      className="btn"
                      style={{ padding: '8px 12px' }}
                    >
                      Send
                    </button>
                  </div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 6,
                      padding: 8,
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      marginTop: 8,
                    }}>
                      {EMOJIS.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => addEmoji(emoji)}
                          style={{
                            padding: '6px',
                            fontSize: '1.5rem',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.transform = 'scale(1.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                  {getConversations().length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 16 }}>
                      No messages yet. Start a conversation from the Friends tab!
                    </div>
                  ) : (
                    getConversations().map(conv => (
                      <div
                        key={conv.friendId}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <button
                          onClick={() => setSelectedFriend(conv.friendId)}
                          style={{
                            display: 'flex',
                            gap: 12,
                            padding: 12,
                            background: 'linear-gradient(135deg, var(--accent) 0%, rgba(99, 102, 241, 0.1) 100%)',
                            border: '1px solid var(--accent)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            alignItems: 'center',
                            flex: 1,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent) 0%, rgba(99, 102, 241, 0.2) 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent) 0%, rgba(99, 102, 241, 0.1) 100%)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1 }}>
                            {conv.friend?.avatar}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'white', marginBottom: 4 }}>
                              {conv.friend?.username}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                              <span style={{ fontWeight: '500' }}>
                                {conv.lastMessage.from === 'You' ? 'You' : conv.friend?.username}:
                              </span>
                              {' '}{conv.lastMessage.text}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                              {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => deleteConversation(conv.friendId)}
                          className="btn ghost"
                          style={{
                            padding: '6px 8px',
                            fontSize: '1rem',
                            color: 'var(--danger, #ff6b6b)',
                            flexShrink: 0,
                            transition: 'all 0.2s',
                          }}
                          title="Delete conversation"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <div 
        className={`sidebar-backdrop ${open ? 'open' : ''}`} 
        onClick={onClose} 
      />
    </>
  );
};

export default SocialMenu;
