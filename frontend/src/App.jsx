import React, { useState } from 'react';
import FitnessCoach from './components/FitnessCoach';
import AiDiet from './components/AiDiet';
import SignIn from './components/SignIn';
import GamificationDash from './components/GamificationDash';
import AdminDash from './components/AdminDash';
import './index.css';
import { Dumbbell, UtensilsCrossed, Trophy, ShieldAlert } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("COACH");
  const [exerciseType, setExerciseType] = useState("squat");

  // Attempt to restore user session quickly on mount without verifying JWT for simplicity
  React.useEffect(() => {
    const saved = localStorage.getItem('athletica_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  if (!currentUser) {
    return <SignIn onSignIn={(userData) => {
        setCurrentUser(userData);
        localStorage.setItem('athletica_user', JSON.stringify(userData));
    }} />;
  }

  const handleLogout = () => {
      localStorage.removeItem('athletica_user');
      setCurrentUser(null);
  };

  return (
    <div className="bg-slate-950 min-h-screen font-sans">
      <nav className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-2xl relative z-50">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 pl-4 tracking-widest uppercase">
            Athletica AI
          </h1>
          
          <div className="hidden md:flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={() => setActiveTab("COACH")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'COACH' ? 'bg-slate-700 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Dumbbell size={16} /> Virtual Coach
            </button>
            <button 
              onClick={() => setActiveTab("LEADERBOARD")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'LEADERBOARD' ? 'bg-slate-700 text-amber-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Trophy size={16} /> Rankings
            </button>
            <button 
              onClick={() => setActiveTab("DIET")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'DIET' ? 'bg-slate-700 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <UtensilsCrossed size={16} /> AI Diet Rules
            </button>
            {currentUser?.is_admin && (
                <button 
                  onClick={() => setActiveTab("ADMIN")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold ml-4 text-sm transition-all ${activeTab === 'ADMIN' ? 'bg-rose-500/20 text-rose-500 shadow border border-rose-500/30' : 'text-rose-400/50 hover:text-rose-400'}`}
                >
                  <ShieldAlert size={16} /> SysAdmin
                </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 pr-4">
          {activeTab === "COACH" && (
            <select 
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className="bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-sm rounded-lg px-4 py-2 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all cursor-pointer"
            >
              <option value="squat">Squat Mode</option>
              <option value="pushup">Pushup Mode</option>
              <option value="bicep_curl">Bicep Curl Mode</option>
            </select>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-xs text-slate-900 border border-emerald-300">
               {currentUser?.name?.charAt(0).toUpperCase() || "U"}
             </div>
             <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors">
               EXIT
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex bg-slate-900 border-b border-slate-800 text-sm">
        <button 
            onClick={() => setActiveTab("COACH")}
            className={`flex-1 py-4 font-bold text-center flex justify-center items-center gap-2 ${activeTab === 'COACH' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50' : 'text-slate-500'}`}
        >
            <Dumbbell size={16} /> Coach
        </button>
        <button 
            onClick={() => setActiveTab("LEADERBOARD")}
            className={`flex-1 py-4 font-bold text-center flex justify-center items-center gap-2 ${activeTab === 'LEADERBOARD' ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-800/50' : 'text-slate-500'}`}
        >
            <Trophy size={16} /> Rank
        </button>
        <button 
            onClick={() => setActiveTab("DIET")}
            className={`flex-1 py-4 font-bold text-center flex justify-center items-center gap-2 ${activeTab === 'DIET' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50' : 'text-slate-500'}`}
        >
            <UtensilsCrossed size={16} /> Diet
        </button>
      </div>

      <main className="h-[calc(100vh-80px)] overflow-hidden">
        {activeTab === "COACH" && <FitnessCoach exerciseType={exerciseType} uid={currentUser.user_id} />}
        {activeTab === "LEADERBOARD" && <GamificationDash currentUid={currentUser.user_id} />}
        {activeTab === "DIET" && <AiDiet />}
        {activeTab === "ADMIN" && currentUser?.is_admin && <AdminDash />}
      </main>
    </div>
  );
}

export default App;
