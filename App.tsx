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
        {isMoodModalOpen && (
          <MoodCheckIn 
            isDarkMode={isDarkMode}
            onSubmit={(mood) => {
              const today = new Date().toDateString();
              setCurrentUser(prev => {
                if (!prev) return null;
                const newHistory = [...(prev.moodHistory || []), { date: today, mood }];
                let streak = prev.moodStreak || 0;
                if (prev.lastMoodDate) {
                  const last = new Date(prev.lastMoodDate);
                  const now = new Date(today);
                  const diffTime = Math.abs(now.getTime() - last.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays === 1) streak += 1;
                  else if (diffDays > 1) streak = 1;
                } else {
                  streak = 1;
                }
                return { ...prev, moodHistory: newHistory, moodStreak: streak, lastMoodDate: today };
              });
              setIsMoodModalOpen(false);
            }} 
          />
        )}
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

        <main className="flex-1 p-4 md:p-8 lg:p-12 mt-16 md:mt-0 overflow-y-auto">
          <MotionDiv
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'Home' && <HomeSection user={currentUser} posts={allPosts} isDarkMode={isDarkMode} />}
            {activeSection === 'Mood' && (
              <MoodSection 
                user={currentUser} 
                posts={visiblePosts} 
                onPost={addPost} 
                onHeart={(id) => setAllPosts(prev => prev.map(p => p.id === id ? { ...p, hearts: p.hearts + 1 } : p))}
                onComment={(id, text) => {
                  const newComment: Comment = { id: Math.random().toString(36).substr(2, 9), author: currentUser.username, text, replies: [] };
                  setAllPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p));
                  addNotification('comment', currentUser.username, id, text);
                }}
                onRepost={(post) => {
                  const repost: Post = { ...post, id: Math.random().toString(36).substr(2, 9), author: currentUser.username, isRepost: true, originalAuthor: post.author, timestamp: Date.now() };
                  setAllPosts(prev => [repost, ...prev]);
                  addNotification('repost', currentUser.username, post.id, post.content);
                }}
                onFollow={(username) => setCurrentUser(prev => prev ? { ...prev, following: [...prev.following, username] } : null)}
                onBlock={(username) => setCurrentUser(prev => prev ? { ...prev, blockedUsers: [...prev.blockedUsers, username] } : null)}
                isDarkMode={isDarkMode} 
              />
            )}
            {activeSection === 'Zodiac' && <ZodiacSection isDarkMode={isDarkMode} />}
            {activeSection === 'CityHall' && (
              <CityHallSection 
                isDarkMode={isDarkMode} 
                currentUser={currentUser} 
                messages={allMessages}
                onSendMessage={(recipient, text) => {
                  const msg: Message = { id: Math.random().toString(36).substr(2, 9), sender: currentUser.username, recipient, text, timestamp: Date.now(), read: false };
                  setAllMessages(prev => [...prev, msg]);
                }}
                onReadMessages={(withUsername) => {
                  setAllMessages(prev => prev.map(m => (m.sender === withUsername && m.recipient === currentUser.username) ? { ...m, read: true } : m));
                }}
              />
            )}
            {activeSection === 'Notifications' && (
              <NotificationsSection 
                notifications={notifications} 
                isDarkMode={isDarkMode} 
                onMarkRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} 
              />
            )}
            {activeSection === 'Profile' && (
              <ProfileSection 
                user={currentUser} 
                allPosts={allPosts} 
                isDarkMode={isDarkMode} 
                onEditProfile={(dn, un, pp, title, bp, pc) => {
                  setCurrentUser(prev => prev ? { ...prev, displayName: dn, username: un, profilePic: pp, title, bannerPic: bp, profileColor: pc } : null);
                }}
                onBlock={(un) => setCurrentUser(prev => prev ? { ...prev, blockedUsers: [...prev.blockedUsers, un] } : null)}
              />
            )}
            {activeSection === 'Settings' && (
              <SettingsSection 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
                onLogout={handleLogout} 
                user={currentUser}
                onUnblock={(un) => setCurrentUser(prev => prev ? { ...prev, blockedUsers: prev.blockedUsers.filter(u => u !== un) } : null)}
              />
            )}
          </MotionDiv>
        </main>
      </div>
    </div>
  );
};

export default App;