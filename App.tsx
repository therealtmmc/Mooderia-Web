
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

// Fix: Cast motion.div to any to resolve environment typing issues
const MotionDiv = motion.div as any;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('Home');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initial Load with massive safety guards
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mooderia_user');
      const savedPosts = localStorage.getItem('mooderia_posts');
      const savedMessages = localStorage.getItem('mooderia_messages');
      const savedNotifications = localStorage.getItem('mooderia_notifications');
      const savedTheme = localStorage.getItem('mooderia_theme');
      
      if (savedUser) {
        const parsed: User = JSON.parse(savedUser);
        setCurrentUser({
          ...parsed,
          followers: parsed.followers || [],
          following: parsed.following || [],
          friends: parsed.friends || [],
          blockedUsers: parsed.blockedUsers || [],
          posts: parsed.posts || [],
          reposts: parsed.reposts || [],
          moodHistory: parsed.moodHistory || []
        });
      }
      
      if (savedPosts) setAllPosts(JSON.parse(savedPosts));
      if (savedMessages) setAllMessages(JSON.parse(savedMessages));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedTheme === 'dark') setIsDarkMode(true);
    } catch (e) {
      console.error("Metropolis Boot Error:", e);
      setHasError(true);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync state to local storage safely
  useEffect(() => {
    if (!isLoaded || hasError) return;
    try {
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
    } catch (e) {
      console.error("Sync Error:", e);
    }
  }, [currentUser, allPosts, allMessages, notifications, isDarkMode, isLoaded, hasError]);

  const addNotification = (type: 'heart' | 'comment' | 'repost', fromUser: string, postId: string, snippet: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type, fromUser, postId, timestamp: Date.now(), read: false,
      postContentSnippet: snippet.substring(0, 40) + (snippet.length > 40 ? '...' : '')
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addPost = (content: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser.username, content, hearts: 0, comments: [], timestamp: Date.now()
    };
    setAllPosts(prev => [newPost, ...prev]);

    // Citizens interaction simulation
    const citizens = ['NeoCitizen', 'VibeExplorer', 'CyberPanda'];
    setTimeout(() => {
      const citizen = citizens[Math.floor(Math.random() * citizens.length)];
      addNotification('heart', citizen, newPost.id, content);
      setAllPosts(prev => prev.map(p => p.id === newPost.id ? { ...p, hearts: p.hearts + 1 } : p));
    }, 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mooderia_user');
    setActiveSection('Home');
  };

  const unreadMessages = useMemo(() => allMessages.filter(m => m.recipient === currentUser?.username && !m.read).length, [allMessages, currentUser]);
  const unreadNotifs = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const visiblePosts = useMemo(() => {
    const blocked = currentUser?.blockedUsers || [];
    return (allPosts || []).filter(p => !blocked.includes(p.author));
  }, [allPosts, currentUser?.blockedUsers]);

  const resetCity = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <h1 className="text-4xl font-black italic uppercase mb-4 text-red-500">City Lockdown</h1>
        <p className="opacity-70 mb-8 max-w-md">Critical infrastructure error detected. Your browser cache may be corrupted.</p>
        <button onClick={resetCity} className="kahoot-button-red px-10 py-4 rounded-2xl font-black uppercase shadow-2xl">Reboot Metropolis</button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black uppercase italic tracking-widest animate-pulse">
        Initializing Mooderia...
      </div>
    );
  }

  if (!currentUser) return <AuthScreen onLogin={(user) => {
    setCurrentUser(user);
    const today = new Date().toDateString();
    if (!(user.moodHistory || []).some(m => m.date === today)) setIsMoodModalOpen(true);
  }} />;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'} transition-colors duration-300`}>
      <AnimatePresence>
        {isMoodModalOpen && <MoodCheckIn onSubmit={(mood) => {
          const today = new Date().toDateString();
          setCurrentUser({
            ...currentUser,
            moodStreak: (currentUser.moodStreak || 0) + 1,
            moodHistory: [...(currentUser.moodHistory || []), { date: today, mood }]
          });
          setIsMoodModalOpen(false);
        }} isDarkMode={isDarkMode} />}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar 
          activeSection={activeSection} onNavigate={setActiveSection} isDarkMode={isDarkMode} user={currentUser}
          unreadMessages={unreadMessages} unreadNotifications={unreadNotifs}
        />

        <main className="flex-1 p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 overflow-y-auto custom-scrollbar">
          <MotionDiv key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
            {activeSection === 'Home' && <HomeSection user={currentUser} posts={visiblePosts} isDarkMode={isDarkMode} />}
            {activeSection === 'Mood' && (
              <MoodSection 
                user={currentUser} posts={visiblePosts} onPost={addPost} 
                onHeart={(pid) => setAllPosts(prev => prev.map(p => p.id === pid ? { ...p, hearts: p.hearts + 1 } : p))} 
                onComment={(pid, text) => setAllPosts(prev => prev.map(p => p.id === pid ? { ...p, comments: [...p.comments, { id: Math.random().toString(), author: currentUser.username, text, replies: [] }] } : p))}
                onRepost={(post) => setAllPosts(prev => [{ ...post, id: Math.random().toString(), author: currentUser.username, isRepost: true, originalAuthor: post.author, timestamp: Date.now() }, ...prev])} 
                onFollow={(u) => setCurrentUser({ ...currentUser, following: currentUser.following.includes(u) ? currentUser.following.filter(f => f !== u) : [...currentUser.following, u] })} 
                onBlock={(u) => setCurrentUser({ ...currentUser, blockedUsers: [...currentUser.blockedUsers, u] })} isDarkMode={isDarkMode} 
              />
            )}
            {activeSection === 'Zodiac' && <ZodiacSection isDarkMode={isDarkMode} />}
            {activeSection === 'CityHall' && (
              <CityHallSection 
                isDarkMode={isDarkMode} currentUser={currentUser} messages={allMessages} 
                onSendMessage={(recipient, text) => setAllMessages(prev => [...prev, { id: Math.random().toString(), sender: currentUser.username, recipient, text, timestamp: Date.now(), read: false }])} 
                onReadMessages={(from) => setAllMessages(prev => prev.map(m => m.sender === from && m.recipient === currentUser.username ? { ...m, read: true } : m))} 
              />
            )}
            {activeSection === 'Notifications' && <NotificationsSection notifications={notifications} isDarkMode={isDarkMode} onMarkRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} />}
            {activeSection === 'Profile' && <ProfileSection user={currentUser} allPosts={visiblePosts} isDarkMode={isDarkMode} onEditProfile={(d, u, p, t, b, c) => setCurrentUser({ ...currentUser, displayName: d, username: u, profilePic: p, title: t, bannerPic: b, profileColor: c })} onBlock={(u) => setCurrentUser({ ...currentUser, blockedUsers: [...currentUser.blockedUsers, u] })} />}
            {activeSection === 'Settings' && <SettingsSection isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={handleLogout} user={currentUser} onUnblock={(u) => setCurrentUser({ ...currentUser, blockedUsers: currentUser.blockedUsers.filter(b => b !== u) })} />}
          </MotionDiv>
        </main>
      </div>
    </div>
  );
};

export default App;
