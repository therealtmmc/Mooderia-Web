
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Send, Brain, Sparkles, Wind, ShieldAlert, CheckCircle2, Play, Pause, RefreshCw, X } from 'lucide-react';
import { User, Post, Mood, Comment } from '../types';
import { getTellerResponse } from '../services/geminiService';

interface MoodSectionProps {
  user: User;
  posts: Post[];
  onPost: (content: string) => void;
  onHeart: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onRepost: (post: Post) => void;
  onFollow: (username: string) => void;
  onBlock: (username: string) => void;
  isDarkMode: boolean;
}

type MoodSubTab = 'Express' | 'Teller' | 'Quiz' | 'Meditation';

const QUIZ_QUESTIONS = [
  {
    question: "How do you typically start your morning in the metropolis?",
    options: [
      { text: "With a huge smile and high energy!", mood: 'Happy' },
      { text: "Slowly, wondering if I can stay in bed...", mood: 'Tired' },
      { text: "Checking my to-do list with intense focus.", mood: 'Angry' },
      { text: "Quietly, with a cup of coffee and some reflection.", mood: 'Sad' }
    ]
  },
  {
    question: "A giant robot is blocking the street! Your reaction?",
    options: [
      { text: "Yell at it to move! I have places to be!", mood: 'Angry' },
      { text: "Take a selfie with it! How cool!", mood: 'Happy' },
      { text: "Sigh... typical Monday in Mooderia.", mood: 'Sad' },
      { text: "Just walk around it, I'm too sleepy to care.", mood: 'Tired' }
    ]
  },
  {
    question: "What's your favorite district vibe?",
    options: [
      { text: "Neon lights and 24/7 parties.", mood: 'Happy' },
      { text: "Rainy windows and jazz cafes.", mood: 'Sad' },
      { text: "High-stakes boardrooms and power.", mood: 'Angry' },
      { text: "Cloud-soft pillows and silence.", mood: 'Tired' }
    ]
  }
];

const MoodSection: React.FC<MoodSectionProps> = ({ user, posts, onPost, onHeart, onComment, onRepost, onFollow, onBlock, isDarkMode }) => {
  const [subTab, setSubTab] = useState<MoodSubTab>('Express');
  const [postContent, setPostContent] = useState('');
  const [tellerQuestion, setTellerQuestion] = useState('');
  const [tellerAnswer, setTellerAnswer] = useState('');
  const [isTellerLoading, setIsTellerLoading] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'All' | 'Following'>('All');

  // Comment System State
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Quiz State
  const [quizStep, setQuizStep] = useState<number | 'result'>(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  
  // Meditation State
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationPhase, setMeditationPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Idle'>('Idle');
  const [timer, setTimer] = useState(0);
  const meditationInterval = useRef<number | null>(null);

  const filteredPosts = feedFilter === 'All' 
    ? posts 
    : posts.filter(p => user.following.includes(p.author) || p.author === user.username);

  // --- Quiz Logic ---
  const handleQuizAnswer = (mood: string) => {
    const newAnswers = [...quizAnswers, mood];
    setQuizAnswers(newAnswers);
    if (typeof quizStep === 'number') {
      if (quizStep < QUIZ_QUESTIONS.length - 1) {
        setQuizStep(quizStep + 1);
      } else {
        setQuizStep('result');
      }
    }
  };

  const calculateQuizResult = () => {
    const counts: Record<string, number> = {};
    quizAnswers.forEach(m => counts[m] = (counts[m] || 0) + 1);
    const topMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    switch(topMood) {
      case 'Happy': return { title: "Joy District Elite", desc: "You belong in the neon-soaked streets of happiness!", icon: "✨" };
      case 'Sad': return { title: "Blue Bayou Poet", desc: "You find beauty in the city's melancholic rain.", icon: "🌊" };
      case 'Angry': return { title: "Ember Peak Commander", desc: "Your fiery passion drives the city's industry!", icon: "🔥" };
      case 'Tired': return { title: "Slumber Sanctuary Sage", desc: "You are the master of the quiet, cozy corners.", icon: "💤" };
      default: return { title: "Metropolis Wanderer", desc: "You fit in everywhere!", icon: "🏙️" };
    }
  };

  // --- Meditation Logic ---
  useEffect(() => {
    if (meditationActive) {
      let currentPhase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';
      let timeLeft = 4;
      setMeditationPhase('Inhale');
      setTimer(4);

      meditationInterval.current = window.setInterval(() => {
        timeLeft -= 1;
        setTimer(timeLeft);

        if (timeLeft <= 0) {
          if (currentPhase === 'Inhale') {
            currentPhase = 'Hold';
            timeLeft = 7;
          } else if (currentPhase === 'Hold') {
            currentPhase = 'Exhale';
            timeLeft = 8;
          } else {
            currentPhase = 'Inhale';
            timeLeft = 4;
          }
          setMeditationPhase(currentPhase);
          setTimer(timeLeft);
        }
      }, 1000);
    } else {
      if (meditationInterval.current) clearInterval(meditationInterval.current);
      setMeditationPhase('Idle');
      setTimer(0);
    }
    return () => { if (meditationInterval.current) clearInterval(meditationInterval.current); };
  }, [meditationActive]);

  const handlePost = () => {
    if (!postContent.trim()) return;
    onPost(postContent);
    setPostContent('');
  };

  const handleTeller = async () => {
    if (!tellerQuestion.trim()) return;
    setIsTellerLoading(true);
    try {
      const res = await getTellerResponse(tellerQuestion);
      setTellerAnswer(res || "The stars are silent right now...");
    } catch (e) {
      setTellerAnswer("A cloud obscures my vision.");
    } finally {
      setIsTellerLoading(false);
    }
  };

  const submitComment = (postId: string) => {
    if (!newComment.trim()) return;
    onComment(postId, newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-2">
          {['Express', 'Teller', 'Quiz', 'Meditation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab as MoodSubTab)}
              className={`px-5 py-2.5 rounded-full font-black whitespace-nowrap transition-all text-xs md:text-sm ${subTab === tab ? 'bg-[#46178f] text-white scale-105 shadow-md' : 'bg-gray-200 dark:bg-slate-700 opacity-70 text-slate-800 dark:text-slate-300'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {subTab === 'Express' && (
        <div className="space-y-6">
          <div className="flex gap-2 p-1.5 bg-gray-200 dark:bg-slate-800 rounded-2xl w-fit">
            <button onClick={() => setFeedFilter('All')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${feedFilter === 'All' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'opacity-50 text-slate-600 dark:text-slate-400'}`}>ALL MOODS</button>
            <button onClick={() => setFeedFilter('Following')} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${feedFilter === 'Following' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'opacity-50 text-slate-600 dark:text-slate-400'}`}>FOLLOWING</button>
          </div>
          
          <div className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-xl`}>
            <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="What's your emotional status today, citizen?" className={`w-full p-4 rounded-xl border-2 focus:border-[#46178f] outline-none transition-all text-sm md:text-base ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'}`} rows={3} />
            <div className="flex justify-end mt-4">
              <button onClick={handlePost} className="kahoot-button-blue px-6 py-2.5 text-white rounded-xl font-black text-xs md:text-sm flex items-center gap-2 transition-transform active:scale-95"><Send size={16} /> EXPRESS IT</button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="py-20 text-center opacity-40 font-black italic uppercase tracking-widest text-xs">The streets are quiet...</div>
            ) : filteredPosts.map(post => (
                <motion.div layout key={post.id} className={`p-6 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-md border-b-4 border-gray-200 dark:border-slate-700`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white font-black overflow-hidden">
                        {post.author[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-sm">@{post.author}</h4>
                        {post.isRepost && <p className="text-[10px] font-bold opacity-50 flex items-center gap-1"><Repeat size={8}/> Reposted from @{post.originalAuthor}</p>}
                      </div>
                    </div>
                  </div>
                  <p className="text-base md:text-lg mb-6 leading-relaxed font-medium">{post.content}</p>
                  
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button onClick={() => onHeart(post.id)} className="flex items-center gap-1.5 text-red-500 font-black text-xs transition-transform active:scale-110 hover:opacity-80"><Heart size={18} fill={post.hearts > 0 ? "currentColor" : "none"} /> {post.hearts}</button>
                    <button onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)} className="flex items-center gap-1.5 text-blue-500 font-black text-xs hover:opacity-80"><MessageCircle size={18} /> {post.comments.length}</button>
                    <button onClick={() => onRepost(post)} className="flex items-center gap-1.5 text-green-500 font-black text-xs hover:opacity-80 transition-transform active:rotate-180"><Repeat size={18} /> REPOST</button>
                  </div>

                  {/* Comment Section */}
                  <AnimatePresence>
                    {expandedComments === post.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 space-y-4">
                         <div className="flex gap-2">
                           <input 
                             type="text" 
                             value={newComment}
                             onChange={(e) => setNewComment(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                             placeholder="Add a citizen feedback..."
                             className={`flex-1 p-3 rounded-xl text-xs font-bold outline-none border-2 focus:border-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}
                           />
                           <button onClick={() => submitComment(post.id)} className="p-3 bg-blue-500 text-white rounded-xl shadow-md"><Send size={16} /></button>
                         </div>

                         <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                           {post.comments.length === 0 ? (
                             <p className="text-[10px] font-black opacity-30 text-center uppercase tracking-widest py-4">No comments yet.</p>
                           ) : post.comments.map(c => (
                             <div key={c.id} className="flex gap-3 items-start">
                               <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-700 shrink-0 flex items-center justify-center font-black text-[10px] uppercase">{c.author[0]}</div>
                               <div className="flex-1">
                                 <p className="text-[10px] font-black italic">@{c.author}</p>
                                 <p className="text-xs font-medium opacity-80">{c.text}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'Teller' && (
        <div className={`p-6 md:p-10 rounded-[2.5rem] text-center bg-gradient-to-b from-[#46178f] to-[#1368ce] text-white shadow-2xl`}>
          <Sparkles className="mx-auto mb-6 text-yellow-400" size={48} />
          <h2 className="text-2xl md:text-4xl font-black mb-4 uppercase italic">The Mooderia Oracle</h2>
          <div className="max-w-xl mx-auto space-y-4">
            <input type="text" value={tellerQuestion} onChange={(e) => setTellerQuestion(e.target.value)} placeholder="Will I find peace today?" className="w-full p-4 rounded-2xl text-slate-900 font-bold text-center focus:outline-none focus:ring-4 ring-yellow-400 text-sm md:text-base" />
            <button disabled={isTellerLoading} onClick={handleTeller} className={`w-full p-4 rounded-2xl kahoot-button-yellow text-white font-black text-lg md:text-xl transition-all ${isTellerLoading ? 'opacity-50 animate-pulse' : ''}`}>{isTellerLoading ? 'CONSULTING...' : 'PREDICT MY FATE'}</button>
          </div>
          {tellerAnswer && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-6 md:p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <p className="text-xl md:text-2xl font-black italic">"{tellerAnswer}"</p>
            </motion.div>
          )}
        </div>
      )}

      {subTab === 'Quiz' && (
        <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-xl text-center min-h-[400px] flex flex-col justify-center`}>
          <AnimatePresence mode="wait">
            {quizStep === 'result' ? (
              <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="text-6xl mb-4">{calculateQuizResult().icon}</div>
                <h2 className="text-3xl font-black mb-2 uppercase italic text-[#26890c]">{calculateQuizResult().title}</h2>
                <p className="text-lg font-bold opacity-70 mb-8">{calculateQuizResult().desc}</p>
                <button onClick={() => {setQuizStep(0); setQuizAnswers([]);}} className="kahoot-button-blue px-10 py-4 rounded-2xl text-white font-black uppercase">RETAKE QUIZ</button>
              </motion.div>
            ) : (
              <motion.div key={quizStep} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="space-y-6">
                <Brain className="mx-auto mb-6 text-[#26890c]" size={56} />
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{QUIZ_QUESTIONS[quizStep].question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => {
                    const colors = ['kahoot-button-red', 'kahoot-button-blue', 'kahoot-button-yellow', 'kahoot-button-green'];
                    return (
                      <button key={i} onClick={() => handleQuizAnswer(opt.mood)} className={`${colors[i]} p-6 rounded-2xl text-white font-black text-left flex items-center gap-4 transition-transform active:scale-95`}>
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{i+1}</div>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Question {quizStep + 1} of {QUIZ_QUESTIONS.length}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {subTab === 'Meditation' && (
        <div className={`p-8 rounded-[2.5rem] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} shadow-xl text-center flex flex-col items-center`}>
          <Wind className="mb-6 text-blue-400" size={56} />
          <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tighter italic">Zen Garden</h2>
          <p className="mb-10 opacity-70 font-bold text-sm">4-7-8 Breathing Guide</p>
          
          <div className="relative w-64 h-64 flex items-center justify-center mb-10">
            {/* Pulsing Orb */}
            <motion.div 
              animate={{ 
                scale: meditationPhase === 'Inhale' ? 1.5 : meditationPhase === 'Exhale' ? 1 : meditationPhase === 'Hold' ? 1.5 : 1,
                opacity: meditationPhase === 'Idle' ? 0.3 : 1
              }}
              transition={{ duration: meditationPhase === 'Inhale' ? 4 : meditationPhase === 'Exhale' ? 8 : 0.5 }}
              className={`absolute w-32 h-32 rounded-full blur-2xl ${meditationPhase === 'Inhale' ? 'bg-blue-400' : meditationPhase === 'Hold' ? 'bg-purple-500' : 'bg-green-400'}`}
            />
            <motion.div 
              animate={{ 
                scale: meditationPhase === 'Inhale' ? 1.5 : meditationPhase === 'Exhale' ? 1 : meditationPhase === 'Hold' ? 1.5 : 1
              }}
              transition={{ duration: meditationPhase === 'Inhale' ? 4 : meditationPhase === 'Exhale' ? 8 : 0.5 }}
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center z-10 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}
              style={{ borderColor: meditationPhase === 'Inhale' ? '#60a5fa' : meditationPhase === 'Hold' ? '#a855f7' : '#4ade80' }}
            >
              <span className="text-4xl font-black italic">{timer || '--'}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-50">{meditationPhase}</span>
            </motion.div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setMeditationActive(!meditationActive)} 
              className={`px-10 py-4 rounded-2xl font-black text-white flex items-center gap-2 shadow-xl transition-all ${meditationActive ? 'bg-red-500 border-b-4 border-red-700' : 'bg-blue-500 border-b-4 border-blue-700'}`}
            >
              {meditationActive ? <Pause size={20} /> : <Play size={20} />}
              {meditationActive ? 'STOP SESSION' : 'START SESSION'}
            </button>
            {meditationActive && (
              <button onClick={() => {setMeditationActive(false); setTimeout(() => setMeditationActive(true), 100);}} className="p-4 rounded-2xl bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-white border-b-4 border-gray-300 dark:border-slate-900">
                <RefreshCw size={24} />
              </button>
            )}
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-sm">
            <div className="text-center">
              <p className="text-xs font-black text-blue-400">4s</p>
              <p className="text-[8px] font-bold uppercase opacity-50">Inhale</p>
            </div>
            <div className="text-center border-x border-gray-100 dark:border-slate-700">
              <p className="text-xs font-black text-purple-400">7s</p>
              <p className="text-[8px] font-bold uppercase opacity-50">Hold</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-green-400">8s</p>
              <p className="text-[8px] font-bold uppercase opacity-50">Exhale</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSection;
