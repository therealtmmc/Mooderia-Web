
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, HeartPulse, Send, Stethoscope, Carrot, GraduationCap, BookOpen, AlertTriangle, ShieldCheck, Activity, Users, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { getPsychiatristResponse, getNutritionistResponse, getStudyGuideResponse } from '../services/geminiService';
import { User, Message } from '../types';

interface CityHallSectionProps {
  isDarkMode: boolean;
  currentUser: User;
  messages: Message[];
  onSendMessage: (recipient: string, text: string) => void;
  onReadMessages: (withUsername: string) => void;
}

type HallTab = 'Pinel' | 'Lavoisier' | 'RonClark' | 'Community';

const CityHallSection: React.FC<CityHallSectionProps> = ({ isDarkMode, currentUser, messages, onSendMessage, onReadMessages }) => {
  const [activeTab, setActiveTab] = useState<HallTab>('Pinel');
  const [pinelChat, setPinelChat] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [lavoisierChat, setLavoisierChat] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [clarkChat, setClarkChat] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Community State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<User | null>(null);

  const allUsers: User[] = useMemo(() => {
    return JSON.parse(localStorage.getItem('mooderia_all_users') || '[]');
  }, []);

  const filteredCitizens = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allUsers.filter(u => 
      u.username !== currentUser.username && 
      (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allUsers, currentUser.username]);

  const conversationUsers = useMemo(() => {
    const userNames = new Set<string>();
    messages.forEach(m => {
      if (m.sender === currentUser.username) userNames.add(m.recipient);
      if (m.recipient === currentUser.username) userNames.add(m.sender);
    });
    return allUsers.filter(u => userNames.has(u.username));
  }, [messages, allUsers, currentUser.username]);

  const chatMessages = useMemo(() => {
    if (!selectedCitizen) return [];
    return messages.filter(m => 
      (m.sender === currentUser.username && m.recipient === selectedCitizen.username) ||
      (m.sender === selectedCitizen.username && m.recipient === currentUser.username)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, selectedCitizen, currentUser.username]);

  const unreadPerUser = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach(m => {
      if (m.recipient === currentUser.username && !m.read) {
        counts[m.sender] = (counts[m.sender] || 0) + 1;
      }
    });
    return counts;
  }, [messages, currentUser.username]);

  useEffect(() => {
    if (selectedCitizen && activeTab === 'Community') {
      onReadMessages(selectedCitizen.username);
    }
  }, [selectedCitizen, messages.length, activeTab]);

  const handleAISend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setIsLoading(true);

    try {
        if (activeTab === 'Pinel') {
          setPinelChat(prev => [...prev, { role: 'user', text: userMsg }]);
          const res = await getPsychiatristResponse(userMsg);
          setPinelChat(prev => [...prev, { role: 'bot', text: res || 'I am here for you.' }]);
        } else if (activeTab === 'Lavoisier') {
          setLavoisierChat(prev => [...prev, { role: 'user', text: userMsg }]);
          const res = await getNutritionistResponse(userMsg);
          setLavoisierChat(prev => [...prev, { role: 'bot', text: res || 'Eat well, live well.' }]);
        } else if (activeTab === 'RonClark') {
          setClarkChat(prev => [...prev, { role: 'user', text: userMsg }]);
          const res = await getStudyGuideResponse(userMsg);
          setClarkChat(prev => [...prev, { role: 'bot', text: res || 'Believe in yourself!' }]);
        }
    } catch (error) {
        const errorMsg = "The city communication lines are busy. Please try again in a moment.";
        if (activeTab === 'Pinel') setPinelChat(prev => [...prev, { role: 'bot', text: errorMsg }]);
        else if (activeTab === 'Lavoisier') setLavoisierChat(prev => [...prev, { role: 'bot', text: errorMsg }]);
        else if (activeTab === 'RonClark') setClarkChat(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCommunitySend = () => {
    if (!input.trim() || !selectedCitizen) return;
    onSendMessage(selectedCitizen.username, input);
    setInput('');
  };

  const getAgentTitle = () => {
    switch (activeTab) {
      case 'Pinel': return 'Dr. Philippe Pinel (Psychiatrist)';
      case 'Lavoisier': return 'Dr. Antoine Lavoisier (Nutritionist)';
      case 'RonClark': return 'Sir Clark (Study Guide)';
      case 'Community': return 'Citizens Community';
    }
  };

  const getAgentShortName = () => {
    switch (activeTab) {
      case 'Pinel': return 'Dr. Pinel';
      case 'Lavoisier': return 'Dr. Lavoisier';
      case 'RonClark': return 'Sir Clark';
      case 'Community': return selectedCitizen?.displayName || 'Citizen';
    }
  };

  return (
    <div className="flex flex-col h-[85vh] gap-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setActiveTab('Pinel')}
          className={`flex-1 min-w-[120px] p-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'Pinel' ? 'kahoot-button-purple text-white scale-105 shadow-xl' : 'bg-gray-200 dark:bg-slate-700 opacity-60 text-slate-600 dark:text-slate-400'}`}
        >
          <Brain size={18} /> PINEL
        </button>
        <button 
          onClick={() => setActiveTab('Lavoisier')}
          className={`flex-1 min-w-[120px] p-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'Lavoisier' ? 'kahoot-button-green text-white scale-105 shadow-xl' : 'bg-gray-200 dark:bg-slate-700 opacity-60 text-slate-600 dark:text-slate-400'}`}
        >
          <HeartPulse size={18} /> LAVOISIER
        </button>
        <button 
          onClick={() => setActiveTab('RonClark')}
          className={`flex-1 min-w-[120px] p-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'RonClark' ? 'kahoot-button-yellow text-white scale-105 shadow-xl' : 'bg-gray-200 dark:bg-slate-700 opacity-60 text-slate-600 dark:text-slate-400'}`}
        >
          <GraduationCap size={18} /> CLARK
        </button>
        <button 
          onClick={() => setActiveTab('Community')}
          className={`flex-1 min-w-[120px] p-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all relative ${activeTab === 'Community' ? 'bg-[#1368ce] border-b-4 border-[#0e4c99] text-white scale-105 shadow-xl' : 'bg-gray-200 dark:bg-slate-700 opacity-60 text-slate-600 dark:text-slate-400'}`}
        >
          <Users size={18} /> 
          COMMUNITY
          {Object.values(unreadPerUser).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-800">
              {/* Fix: Explicitly type reduce parameters to resolve TypeScript error where types are inferred as unknown */}
              {Object.values(unreadPerUser).reduce((a: number, b: number) => a + b, 0)}
            </span>
          )}
        </button>
      </div>

      <div className={`flex-1 flex flex-col md:flex-row rounded-3xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl overflow-hidden border-4 border-gray-100 dark:border-slate-700`}>
        
        {/* Community Sidebar */}
        {activeTab === 'Community' && (
          <div className={`w-full md:w-72 border-r ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} flex flex-col ${selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
             <div className="p-4 border-b border-gray-100 dark:border-slate-700">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search Citizens..."
                   className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-bold outline-none border-2 focus:border-blue-500 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`}
                 />
               </div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
               {searchTerm.trim() ? (
                 <>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 px-2 mt-2">Search Results</p>
                   {filteredCitizens.map(u => (
                     <button 
                       key={u.username}
                       onClick={() => { setSelectedCitizen(u); setSearchTerm(''); }}
                       className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedCitizen?.username === u.username ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                     >
                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-600 flex items-center justify-center text-[10px] font-black shrink-0">
                         {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover rounded-full" /> : u.displayName[0]}
                       </div>
                       <div className="text-left truncate">
                         <p className="font-black text-[11px] truncate">{u.displayName}</p>
                         <p className={`text-[9px] font-bold ${selectedCitizen?.username === u.username ? 'text-white/60' : 'opacity-40'} truncate`}>@{u.username}</p>
                       </div>
                     </button>
                   ))}
                   {filteredCitizens.length === 0 && <p className="text-[10px] italic opacity-40 px-2">No citizens found.</p>}
                 </>
               ) : (
                 <>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 px-2 mt-2">Active Conversations</p>
                   {conversationUsers.map(u => (
                     <button 
                       key={u.username}
                       onClick={() => setSelectedCitizen(u)}
                       className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors relative ${selectedCitizen?.username === u.username ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                     >
                       <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-600 flex items-center justify-center text-xs font-black shrink-0">
                         {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover rounded-full" /> : u.displayName[0]}
                       </div>
                       <div className="text-left flex-1 min-w-0">
                         <p className="font-black text-xs truncate">{u.displayName}</p>
                         <p className={`text-[10px] font-bold ${selectedCitizen?.username === u.username ? 'text-white/60' : 'opacity-40'} truncate italic`}>{u.title || 'Citizen'}</p>
                       </div>
                       {unreadPerUser[u.username] > 0 && selectedCitizen?.username !== u.username && (
                         <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-black border-2 border-white dark:border-slate-800">
                           {unreadPerUser[u.username]}
                         </span>
                       )}
                     </button>
                   ))}
                   {conversationUsers.length === 0 && <p className="text-[10px] italic opacity-40 px-2 py-8 text-center">Your inbox is empty. Search for a citizen to start chatting!</p>}
                 </>
               )}
             </div>
          </div>
        )}

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'Community' && !selectedCitizen ? 'hidden md:flex' : 'flex'}`}>
          <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-gray-50 border-gray-100'} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              {activeTab === 'Community' && selectedCitizen && (
                <button onClick={() => setSelectedCitizen(null)} className="md:hidden mr-1">
                  <ArrowLeft size={20} />
                </button>
              )}
              {activeTab === 'Pinel' && <Stethoscope className="text-purple-500" />}
              {activeTab === 'Lavoisier' && <Carrot className="text-green-500" />}
              {activeTab === 'RonClark' && <BookOpen className="text-yellow-500" />}
              {activeTab === 'Community' && <MessageSquare className="text-blue-500" />}
              <h3 className={`font-black italic uppercase text-[11px] md:text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {activeTab === 'Community' && !selectedCitizen ? 'Select a citizen to chat' : `Consulting: ${getAgentTitle()}`}
              </h3>
            </div>
            <div className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-green-500" />
               <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter hidden sm:block">Secure Tunnel</span>
            </div>
          </div>

          {activeTab !== 'Community' && (
            <div className={`px-6 py-2 border-b ${isDarkMode ? 'bg-amber-900/10 border-amber-900/20' : 'bg-amber-50 border-amber-100'} flex items-center gap-2`}>
              <AlertTriangle className="text-amber-500 shrink-0" size={14} />
              <p className={`text-[10px] font-bold ${isDarkMode ? 'text-amber-200/50' : 'text-amber-700'} leading-tight`}>
                AI PERSONA NOTICE: Digital characters for entertainment/support. 1,500 daily request cap.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
            {activeTab === 'Community' ? (
              !selectedCitizen ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                  <Users size={64} className="mb-4" />
                  <p className="text-lg font-black uppercase italic">City Messenger</p>
                  <p className="text-xs font-bold max-w-xs">Talk with other citizens of Mooderia in real-time. Use the search bar to find people by name.</p>
                </div>
              ) : (
                chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <p className="font-black uppercase italic">New Connection</p>
                    <p className="text-[10px] font-bold mt-1">Say hello to @{selectedCitizen.username}!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={msg.id} className={`flex ${msg.sender === currentUser.username ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 md:p-4 rounded-2xl text-xs md:text-sm font-semibold shadow-sm ${msg.sender === currentUser.username ? 'bg-[#1368ce] text-white rounded-tr-none' : 'bg-gray-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-tl-none border-b-2 border-gray-200 dark:border-slate-600'}`}>
                        {msg.text}
                        <p className={`text-[8px] mt-1 text-right font-black opacity-40 uppercase`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <>
                  {(activeTab === 'Pinel' ? pinelChat : activeTab === 'Lavoisier' ? lavoisierChat : clarkChat).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                      <p className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome, Citizen</p>
                      <p className={`text-sm font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>How can {getAgentShortName()} assist you today?</p>
                    </div>
                  )}
                  {(activeTab === 'Pinel' ? pinelChat : activeTab === 'Lavoisier' ? lavoisierChat : clarkChat).map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm font-semibold shadow-sm ${msg.role === 'user' ? 'bg-[#1368ce] text-white rounded-tr-none' : 'bg-gray-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-tl-none border-b-2 border-gray-200 dark:border-slate-600'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-2xl animate-pulse font-black text-[10px] text-slate-600 dark:text-white uppercase tracking-widest">
                        {getAgentShortName()} is transmitting...
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>

          {(activeTab !== 'Community' || selectedCitizen) && (
            <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'Community' ? handleCommunitySend() : handleAISend())}
                  placeholder={activeTab === 'Community' ? "Type a message..." : `Consult ${getAgentShortName()}...`}
                  className={`flex-1 p-3 md:p-4 rounded-xl border-2 outline-none focus:border-blue-500 font-bold text-sm md:text-base ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'}`}
                />
                <button 
                  onClick={activeTab === 'Community' ? handleCommunitySend : handleAISend}
                  className={`p-4 rounded-xl text-white transition-transform active:scale-95 shadow-lg ${activeTab === 'Pinel' ? 'bg-[#46178f]' : activeTab === 'Lavoisier' ? 'bg-[#26890c]' : activeTab === 'RonClark' ? 'bg-[#ffa602]' : 'bg-[#1368ce]'}`}
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityHallSection;
