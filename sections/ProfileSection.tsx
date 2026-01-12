
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Post } from '../types';
import { Edit, Heart, MessageCircle, Flame, ShieldCheck, UserPlus, MoreVertical, ShieldAlert, Camera, Palette, Image as ImageIcon, Repeat } from 'lucide-react';
import { STREAK_BADGES } from '../constants';

interface ProfileSectionProps {
  user: User;
  allPosts: Post[];
  isDarkMode: boolean;
  onEditProfile?: (displayName: string, username: string, profilePic?: string, title?: string, bannerPic?: string, profileColor?: string) => void;
  onBlock?: (username: string) => void;
}

const AVAILABLE_TITLES = [
  'Citizen', 'Student', 'Celebrity', 'Influencer', 'Teenager', 
  'Teacher', 'Engineer', 'Artist', 'Developer', 'Athlete', 
  'Doctor', 'Musician', 'Dreamer', 'Leader', 'Philosopher',
  'Designer', 'Chef', 'Lawyer', 'Writer', 'Photographer', 
  'Scientist', 'Entrepreneur', 'Nurse', 'Pilot', 'Gamer',
  'Architect', 'Psychologist', 'Manager', 'Accountant', 'Mechanic'
];

const PRESET_COLORS = [
  '#46178f', '#1368ce', '#26890c', '#e21b3c', '#ffa602', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'
];

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, allPosts, isDarkMode, onEditProfile, onBlock }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [bannerPic, setBannerPic] = useState(user.bannerPic || '');
  const [profileTitle, setProfileTitle] = useState(user.title || 'Citizen');
  const [profileColor, setProfileColor] = useState(user.profileColor || '#46178f');
  
  const [activeTab, setActiveTab] = useState<'Posts' | 'Reposts' | 'Stats'>('Posts');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const bannerPicInputRef = useRef<HTMLInputElement>(null);

  const currentUserStr = localStorage.getItem('mooderia_user');
  const currentUserObj: User | null = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isOwnProfile = currentUserObj?.username === user.username;

  const myPosts = allPosts.filter(p => p.author === user.username && !p.isRepost);
  const myReposts = allPosts.filter(p => p.author === user.username && p.isRepost);
  
  const canBeCreator = user.email === 'travismiguel014@gmail.com';
  const filteredTitles = canBeCreator ? ['Creator', ...AVAILABLE_TITLES] : AVAILABLE_TITLES;

  const handleSave = () => {
    if (onEditProfile) onEditProfile(displayName, username, profilePic, profileTitle, bannerPic, profileColor);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const accentColor = isEditing ? profileColor : (user.profileColor || '#46178f');

  const getDisplayNameSize = (name: string) => {
    if (name.length <= 12) return 'text-3xl md:text-5xl';
    if (name.length <= 20) return 'text-2xl md:text-4xl';
    return 'text-xl md:text-2xl';
  };

  return (
    <div className="space-y-8 pb-20">
      <div className={`relative p-8 rounded-[3rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-2xl`}>
        <div 
          className="h-48 md:h-64 w-full rounded-[2rem] absolute top-0 left-0 overflow-hidden"
          style={{ 
            backgroundColor: bannerPic ? 'transparent' : accentColor,
            backgroundImage: bannerPic ? `url(${bannerPic})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {bannerPic && <div className="absolute inset-0 bg-black/30"></div>}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
             <p className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter -rotate-6 whitespace-nowrap select-none">
               {profileTitle} {profileTitle} {profileTitle}
             </p>
          </div>
          {isOwnProfile && isEditing && (
            <button 
              onClick={() => bannerPicInputRef.current?.click()}
              className="absolute bottom-4 right-4 p-3 bg-black/60 hover:bg-black/80 text-white rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase backdrop-blur-md"
            >
              <ImageIcon size={18} /> Edit Banner
            </button>
          )}
          <input type="file" ref={bannerPicInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setBannerPic)} />
        </div>
        
        <div className="relative pt-32 md:pt-48 px-4 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white p-1.5 shadow-2xl shrink-0 overflow-hidden ring-4 ring-white/10">
               {profilePic ? (
                 <img src={profilePic} alt="Profile" className="w-full h-full rounded-[2rem] object-cover" />
               ) : (
                 <div className="w-full h-full rounded-[2rem] flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                   <span className="text-white text-5xl md:text-7xl font-black">{user.displayName[0]}</span>
                 </div>
               )}
            </div>
            {isOwnProfile && isEditing && (
              <button 
                onClick={() => profilePicInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={36} className="text-white" />
              </button>
            )}
            <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePic)} />
          </div>

          <div className="flex-1 pb-4 min-w-0">
            {isEditing ? (
              <div className="space-y-4 w-full">
                <div className="relative">
                  <input 
                    className={`text-2xl md:text-3xl font-black p-3 rounded-xl w-full border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'}`} 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="Display Name" 
                    maxLength={30}
                  />
                </div>
                <div className="relative">
                  <input 
                    className={`text-lg md:text-xl font-bold opacity-60 p-3 rounded-xl w-full border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'}`} 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Username" 
                    maxLength={20}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Title</label>
                    <select 
                      value={profileTitle} 
                      onChange={(e) => setProfileTitle(e.target.value)}
                      className={`w-full p-3 rounded-xl border-2 font-black italic uppercase appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'}`}
                    >
                      {filteredTitles.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Accent Color</label>
                    <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-gray-50 dark:bg-slate-700 border-2 border-gray-100 dark:border-slate-600">
                      {PRESET_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => setProfileColor(c)} 
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${profileColor === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <p 
                    className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic px-4 py-1.5 rounded-full border shadow-sm"
                    style={{ 
                      color: accentColor,
                      backgroundColor: `${accentColor}15`,
                      borderColor: `${accentColor}40`
                    }}
                  >
                    {user.title || 'Citizen'}
                  </p>
                </div>
                <h2 className={`${getDisplayNameSize(user.displayName)} font-black italic tracking-tighter uppercase truncate w-full`}>
                  {user.displayName}
                </h2>
                <div className="flex items-center gap-2">
                   <p className="text-lg md:text-xl font-bold opacity-50 uppercase tracking-tighter truncate">@{user.username}</p>
                   {user.moodStreak >= 5 && <ShieldCheck size={20} className="text-green-500 shrink-0" />}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pb-4 items-center self-center md:self-end shrink-0">
             {isOwnProfile ? (
               isEditing ? (
                 <button onClick={handleSave} className="kahoot-button-green px-10 py-4 text-white rounded-2xl font-black text-lg shadow-xl uppercase">SAVE</button>
               ) : (
                 <button 
                   onClick={() => setIsEditing(true)} 
                   className="kahoot-button px-8 py-4 text-white rounded-2xl font-black flex items-center gap-2 shadow-xl uppercase whitespace-nowrap"
                   style={{ backgroundColor: accentColor }}
                 >
                   <Edit size={20} /> EDIT CITY ID
                 </button>
               )
             ) : (
               <>
                 <button className="kahoot-button-green px-8 py-4 text-white rounded-2xl font-black flex items-center gap-2 shadow-xl uppercase whitespace-nowrap">
                    <UserPlus size={20} /> ADD FRIEND
                 </button>
                 <div className="relative">
                    <button 
                      onClick={() => setShowBlockMenu(!showBlockMenu)}
                      className={`p-4 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                      <MoreVertical size={24} />
                    </button>
                    {showBlockMenu && (
                      <div className="absolute bottom-full right-0 mb-2 w-52 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl z-20 overflow-hidden">
                        <button 
                          onClick={() => {
                             if (onBlock) onBlock(user.username);
                             setShowBlockMenu(false);
                          }}
                          className="w-full px-5 py-4 flex items-center gap-3 text-red-500 font-black uppercase text-xs hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <ShieldAlert size={18} /> Block Citizen
                        </button>
                      </div>
                    )}
                 </div>
               </>
             )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-8 border-t border-gray-100 dark:border-slate-700 pt-8 px-4">
           <div className="text-center">
             <p className="text-3xl font-black text-slate-900 dark:text-white italic">{user.followers.length}</p>
             <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Followers</p>
           </div>
           <div className="text-center">
             <p className="text-3xl font-black text-slate-900 dark:text-white italic">{user.following.length}</p>
             <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Following</p>
           </div>
           <div className="text-center px-6 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center gap-3 ring-2 ring-orange-500/10">
             <Flame className="text-orange-500" size={24} />
             <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white italic leading-none">{user.moodStreak || 0}</p>
                <p className="text-[9px] font-black opacity-50 uppercase tracking-widest">Streak</p>
             </div>
           </div>
        </div>
      </div>

      <div className="flex gap-4">
         {(['Posts', 'Reposts', 'Stats'] as const).map(tab => (
           <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`flex-1 p-5 rounded-3xl font-black transition-all border-b-4 uppercase italic tracking-tighter ${activeTab === tab ? 'text-white scale-[1.02] shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 border-gray-300 dark:border-slate-600 opacity-60'}`}
            style={{ 
              backgroundColor: activeTab === tab ? accentColor : '',
              borderColor: activeTab === tab ? 'rgba(0,0,0,0.2)' : ''
            }}
          >
             {tab}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'Posts' && (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={post.id} className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-xl border-b-4 border-gray-100 dark:border-slate-700`}>
                <p className="text-lg md:text-xl font-medium leading-relaxed mb-6">{post.content}</p>
                <div className="flex gap-6 opacity-40 text-xs font-black uppercase">
                  <span className="flex items-center gap-1.5"><Heart size={18} className="text-red-500" /> {post.hearts}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle size={18} className="text-blue-500" /> {post.comments.length}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-24 opacity-30 italic font-black uppercase tracking-[0.3em] text-sm">No City Logs yet</div>
          )
        )}

        {activeTab === 'Reposts' && (
          myReposts.length > 0 ? (
            myReposts.map(post => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={post.id} className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-xl border-b-4 border-green-500/30`}>
                <div className="flex items-center gap-2 mb-4 text-green-500 font-black text-[10px] uppercase italic">
                  <Repeat size={14} /> Reposted from @{post.originalAuthor}
                </div>
                <p className="text-lg md:text-xl font-medium leading-relaxed mb-6">{post.content}</p>
                <div className="flex gap-6 opacity-40 text-xs font-black uppercase">
                  <span className="flex items-center gap-1.5"><Heart size={18} /> {post.hearts}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle size={18} /> {post.comments.length}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-24 opacity-30 italic font-black uppercase tracking-[0.3em] text-sm">No Reposts Found</div>
          )
        )}
        
        {activeTab === 'Stats' && (
          <div className={`col-span-2 p-10 md:p-14 rounded-[3rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-2xl border-4 border-gray-50 dark:border-slate-700/50`}>
            <h3 className="text-3xl font-black text-center mb-12 uppercase italic tracking-tighter">Emotional DNA</h3>
            <div className="space-y-8 max-w-3xl mx-auto">
              {['Happy', 'Sad', 'Angry', 'Tired'].map(m => {
                const count = user.moodHistory.filter(mh => mh.mood === m).length;
                const total = user.moodHistory.length || 1;
                const pct = (count / total) * 100;
                return (
                  <div key={m} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] mb-1">
                      <span className="italic">{m}</span>
                      <span style={{ color: accentColor }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full h-5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full shadow-sm" 
                        style={{ backgroundColor: accentColor }}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 text-center">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Logs</p>
                  <p className="text-xl font-black italic">{user.moodHistory.length}</p>
               </div>
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 text-center">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Hearts</p>
                  <p className="text-xl font-black italic">{user.posts.reduce((acc, p) => acc + p.hearts, 0)}</p>
               </div>
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 text-center">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Reposts</p>
                  <p className="text-xl font-black italic">{user.reposts?.length || 0}</p>
               </div>
               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 text-center">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Impact</p>
                  <p className="text-xl font-black italic">High</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
