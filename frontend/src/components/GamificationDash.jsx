import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Clock, Target, Medal } from 'lucide-react';

const GamificationDash = ({ currentUid }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStreak, setMyStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/leaderboard');
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        
        // Mock identifying current user's streak from auth flow (normally stored in Context)
        const myData = localStorage.getItem('athletica_user');
        if (myData) {
            setMyStreak(JSON.parse(myData).streak || 0);
        }
      } catch (e) {
        console.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [currentUid]);

  const formatTime = (seconds) => {
      if (!seconds) return "0m";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen bg-slate-900 text-white overflow-y-auto">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <div className="flex items-center gap-3">
                <Trophy className="text-amber-400 w-8 h-8" />
                <h2 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Global Leaderboard
                </h2>
            </div>
            <p className="text-slate-400 mt-2 font-medium">Rank up by tracking reps and logging AI hours.</p>
        </div>

        {/* Dynamic Streak Badge */}
        <div className="bg-gradient-to-br from-orange-500/20 to-rose-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-orange-500/5">
            <div className={`p-3 rounded-xl ${myStreak > 0 ? 'bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-orange-500/40' : 'bg-slate-800'}`}>
                <Flame className={`w-8 h-8 ${myStreak > 0 ? 'text-white animate-pulse' : 'text-slate-500'}`} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Streak</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{myStreak}</span>
                    <span className="text-slate-400 font-medium pb-1">Days</span>
                </div>
            </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-slate-800/60 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

        {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading ranking databanks...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/80 border-b border-slate-700/80">
                        <tr>
                            <th className="py-4 px-6 font-bold text-slate-400 text-sm tracking-wider uppercase">Rank</th>
                            <th className="py-4 px-6 font-bold text-slate-400 text-sm tracking-wider uppercase">Athlete</th>
                            <th className="py-4 px-6 font-bold text-amber-400 flex items-center justify-end gap-2 text-sm tracking-wider uppercase">
                                <Target size={16} /> Lifetime Reps
                            </th>
                            <th className="py-4 px-6 font-bold text-cyan-400 text-right text-sm tracking-wider uppercase">
                                Time Trained
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {leaderboard.map((user, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/30 transition-colors group">
                                <td className="py-4 px-6">
                                    {idx === 0 ? <Medal className="text-amber-400 w-6 h-6" /> : 
                                     idx === 1 ? <Medal className="text-slate-300 w-6 h-6" /> :
                                     idx === 2 ? <Medal className="text-amber-700 w-6 h-6" /> :
                                     <span className="font-black text-slate-500 w-6 flex justify-center">{idx + 1}</span>}
                                </td>
                                <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                                    {user.name}
                                    {user.streak > 3 && <Flame size={14} className="text-orange-500" title={`${user.streak} day streak!`} />}
                                </td>
                                <td className="py-4 px-6 font-black text-right text-amber-500/90 text-lg">
                                    {user.lifetime_reps || 0} <span className="text-xs text-slate-500">reps</span>
                                </td>
                                <td className="py-4 px-6 font-bold text-cyan-400 right text-right text-sm">
                                    <span className="flex items-center justify-end gap-1">
                                        <Clock size={14} /> {formatTime(user.total_app_time || 0)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        
                        {leaderboard.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                                    No athletes on the board yet.<br/>Start your first workout to claim #1!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default GamificationDash;
