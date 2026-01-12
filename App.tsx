
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mood, Section, Post, Comment, Message, Notification } from './types';
import Sidebar from './components/Sidebar';
import MoodCheckIn from './components/MoodCheckIn';
import HomeSection from './sections/HomeSection';
import MoodSection from './sections/MoodSection';
import ZodiacSection from './sections/ZodiacSection';
import CityHallSection from './sections/CityHallSection';
import ProfileSection from './sections/ProfileSection';
import SettingsSection from './sections/SettingsSection';
import NotificationsSection from './sections/NotificationsSection';
import AuthScreen from './sections/AuthScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('Home');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial Load from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('mooderia_user');
    const savedPosts = localStorage.getItem('mooderia_posts');
    const savedMessages = localStorage.getItem('mooderia_messages');
    const savedNotifications = localStorage.getItem('mooderia_notifications');
    const savedTheme = localStorage.getItem('mooderia_theme');
    
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedPosts) setAllPosts(JSON.parse(savedPosts));
    if (savedMessages) setAllMessages(JSON.parse(savedMessages));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedTheme === 'dark') setIsDarkMode(true);
    
    setIsLoaded(true);
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;

    if (currentUser) {
      localStorage.setItem('mooderia_user', JSON.stringify(currentUser));
      const allUsersStr = localStorage.getItem('mooderia_all_users') || '[]';
      const allUsers: User[] = JSON.parse(allUsersStr);
      const userIndex = allUsers.findIndex(u => u.username === currentUser.username);
      if (userIndex > -1) allUsers[userIndex] = currentUser;
      else allUsers.push(currentUser);
      localStorage.setItem('mooderia_all_users', JSON.stringify(allUsers));
    }

    localStorage.setItem('mooderia_posts', JSON.stringify(allPosts));
    localStorage.setItem('mooderia_messages', JSON.stringify(allMessages));
    localStorage.setItem('mooderia_notifications', JSON.stringify(notifications));
    localStorage.setItem('mooderia_theme', isDarkMode ? 'dark' : 'light');
  }, [currentUser, allPosts, allMessages, notifications, isDarkMode, isLoaded]);

  const addNotification = (type: 'heart' | 'comment' | 'repost', fromUser: string, postId: string, snippet: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      fromUser,
      postId,
      timestamp: Date.now(),
      read: false,
      postContentSnippet: snippet.substring(0, 40) + (snippet.length > 40 ? '...' : '')
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addPost = (content: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.username,
      content,
      hearts: 0,
      comments: [],
      timestamp: Date.now()
    };
    setAllPosts(prev => [newPost, ...prev]);

    // METROPOLIS SIMULATOR: Trigger automated interactions from citizens
    const citizens = ['NeoCitizen', 'VibeExplorer', 'CyberPanda', 'MoodMaster', 'EchoZero'];
    
    // 1. Citizen Hearts (Like) - 3 seconds
    setTimeout(() => {
      const citizen = citizens[Math.floor(Math.random() * citizens.length)];
      addNotification('heart', citizen, newPost.id, content);
      setAllPosts(prev => prev.map(p => p.id === newPost.id ? { ...p, hearts: p.hearts + 1 } : p));
    }, 3000);

    // 2. Citizen Comments - 7 seconds
    setTimeout(() => {
      const citizen = citizens[Math.floor(Math.random() * citizens.length)];
      const text = "Great vibe, citizen! Mooderia loves this energy.";
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        author: citizen,
        text,
        replies: []
      };
      addNotification('comment', citizen, newPost.id, content);
      setAllPosts(prev => prev.map(p => p.id === newPost.id ? { ...p, comments: [...p.comments, newComment] } : p));
    }, 7000);

    // 3. Citizen Reposts - 12 seconds
    setTimeout(() => {
      const citizen = citizens[Math.floor(Math.random() * citizens.length)];
      addNotification('repost', citizen, newPost.id, content);
      // Create the repost for the simulator citizen
      const simRepost: Post = {
        ...newPost,
        id: Math.random().toString(36).substr(2, 9),
        isRepost: true,
        originalAuthor: newPost.author,
        author: citizen,
        timestamp: Date.now()
      };
      setAllPosts(prev => [simRepost, ...prev]);
    }, 12000);
  };

  const toggleHeart = (postId: string) => {
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) return { ...p, hearts: p.hearts + 1 };
      return p;
    }));
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.username,
      text,
      replies: []
    };
    setAllPosts(prev => prev.map(p => {
      if (p.id === postId) return { ...p, comments: [...p.comments, newComment] };
      return p;
    }));
  };

  const repost = (post: Post) => {
    if (!currentUser) return;
    const newRepost: Post = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      isRepost: true,
      originalAuthor: post.author,
      author: currentUser.username,
      timestamp: Date.now()
    };
    setAllPosts(prev => [newRepost, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const today = new Date().toDateString();
    const hasCheckedMoodToday = user.moodHistory.some(m => m.date === today);
    if (!hasCheckedMoodToday) setIsMoodModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mooderia_user');
    setActiveSection('Home');
  };

  const submitMood = (mood: Mood) => {
    if (!currentUser) return;
    const today = new Date().toDateString();
    const updatedUser = {
      ...currentUser,
      moodStreak: (currentUser.moodStreak || 0) + 1,
      lastMoodDate: today,
      moodHistory: [...currentUser.moodHistory, { date: today, mood }]
    };
    setCurrentUser(updatedUser);
    setIsMoodModalOpen(false);
  };

  const sendMessage = (recipient: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: currentUser.username,
      recipient,
      text,
      timestamp: Date.now(),
      read: false
    };
    setAllMessages(prev => [...prev, newMessage]);
  };

  const markMessagesAsRead = (withUsername: string) => {
    if (!currentUser) return;
    setAllMessages(prev => prev.map(msg => {
      if (msg.recipient === currentUser.username && msg.sender === withUsername) return { ...msg, read: true };
      return msg;
    }));
  };

  const handleFollow = (username: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following.includes(username);
    if (isFollowing) setCurrentUser({ ...currentUser, following: currentUser.following.filter(u => u !== username) });
    else setCurrentUser({ ...currentUser, following: [...currentUser.following, username] });
  };

  const handleBlockUser = (username: string) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      blockedUsers: [...currentUser.blockedUsers, username],
      following: currentUser.following.filter(u => u !== username)
    });
  };

  const updateProfile = (displayName: string, username: string, profilePic?: string, title?: string, bannerPic?: string, profileColor?: string) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, displayName, username, profilePic, title, bannerPic, profileColor });
  };

  const unreadMessages = useMemo(() => allMessages.filter(m => m.recipient === currentUser?.username && !m.read).length, [allMessages, currentUser]);
  const unreadNotifs = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const visiblePosts = useMemo(() => allPosts.filter(p => !currentUser?.blockedUsers.includes(p.author)), [allPosts, currentUser?.blockedUsers]);

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'} transition-colors duration-300`}>
      <AnimatePresence>
        {isMoodModalOpen && <MoodCheckIn onSubmit={submitMood} isDarkMode={isDarkMode} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar 
          activeSection={activeSection} 
          onNavigate={setActiveSection} 
          isDarkMode={isDarkMode}
          user={currentUser}
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifs}
        />

        <main className="flex-1 p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 overflow-y-auto custom-scrollbar">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="max-w-5xl mx-auto"
          >
            {activeSection === 'Home' && <HomeSection user={currentUser} posts={visiblePosts} isDarkMode={isDarkMode} />}
            {activeSection === 'Mood' && (
              <MoodSection 
                user={currentUser} posts={visiblePosts} onPost={addPost} onHeart={toggleHeart} 
                onComment={addComment} onRepost={repost} onFollow={handleFollow} onBlock={handleBlockUser} isDarkMode={isDarkMode} 
              />
            )}
            {activeSection === 'Zodiac' && <ZodiacSection isDarkMode={isDarkMode} />}
            {activeSection === 'CityHall' && (
              <CityHallSection isDarkMode={isDarkMode} currentUser={currentUser} messages={allMessages} onSendMessage={sendMessage} onReadMessages={markMessagesAsRead} />
            )}
            {activeSection === 'Notifications' && (
              <NotificationsSection notifications={notifications} isDarkMode={isDarkMode} onMarkRead={markNotificationsRead} />
            )}
            {activeSection === 'Profile' && <ProfileSection user={currentUser} allPosts={visiblePosts} isDarkMode={isDarkMode} onEditProfile={updateProfile} onBlock={handleBlockUser} />}
            {activeSection === 'Settings' && (
              <SettingsSection 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
                onLogout={handleLogout} 
                user={currentUser} 
                onUnblock={(u) => setCurrentUser({...currentUser, blockedUsers: currentUser.blockedUsers.filter(b => b !== u)})} 
              />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default App;
