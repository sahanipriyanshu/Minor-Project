import React, { useEffect, useState } from 'react';
import { Database, ShieldAlert, Trash2, Users, Activity, BarChart4 } from 'lucide-react';

const AdminDash = () => {
  const [stats, setStats] = useState({ athlete_count: 0, global_reps: 0, global_time_seconds: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/stats'),
        fetch('http://localhost:8000/api/admin/users')
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      
      setStats(statsData);
      setUsers(usersData.athletes);
    } catch (e) {
      console.error("Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (uid, name) => {
    const isConfirmed = window.confirm(`DANGER: Are you absolutely sure you want to permanently delete athlete '${name}'? This wipes all their stats.`);
    
    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${uid}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Hot reload table
            await fetchData();
        } else {
            const data = await response.json();
            alert(data.detail || "Failed to delete user.");
        }
      } catch (e) {
        alert("Server error.");
      }
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen bg-slate-900 text-white overflow-y-auto">
      
      <div className="flex items-center gap-3 mb-8">
        <Database className="text-rose-500 w-8 h-8" />
        <h2 className="text-3xl font-black text-rose-500">
          Admin Control Center
        </h2>
      </div>

      {/* Macro Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-rose-500/20 shadow-lg flex flex-col items-center justify-center text-center">
            <Users className="text-slate-400 mb-2 w-8 h-8" />
            <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Total Athletes</p>
            <p className="text-4xl font-black text-white mt-2">{stats.athlete_count}</p>
        </div>
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-rose-500/20 shadow-lg flex flex-col items-center justify-center text-center">
            <Activity className="text-amber-400 mb-2 w-8 h-8" />
            <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Platform Reps</p>
            <p className="text-4xl font-black text-amber-400 mt-2">{stats.global_reps.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-rose-500/20 shadow-lg flex flex-col items-center justify-center text-center">
            <BarChart4 className="text-cyan-400 mb-2 w-8 h-8" />
            <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">Compute Hours</p>
            <p className="text-4xl font-black text-cyan-400 mt-2">{formatTime(stats.global_time_seconds)}</p>
        </div>
      </div>

      {/* Data Ledger */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-rose-400" /> Platform Ledger
            </h3>
        </div>
        
        {loading ? (
            <div className="p-10 text-center animate-pulse text-slate-500 font-bold">Querying Cluster...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="py-4 px-6 text-sm text-slate-400 font-bold">UID</th>
                            <th className="py-4 px-6 text-sm text-slate-400 font-bold">Athlete</th>
                            <th className="py-4 px-6 text-sm text-slate-400 font-bold">Email</th>
                            <th className="py-4 px-6 text-sm text-slate-400 font-bold">Role</th>
                            <th className="py-4 px-6 text-sm text-slate-400 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="py-4 px-6 text-xs text-slate-500 font-mono">{user._id.substring(0, 10)}...</td>
                                <td className="py-4 px-6 font-bold text-white">{user.name}</td>
                                <td className="py-4 px-6 text-slate-300">{user.email}</td>
                                <td className="py-4 px-6">
                                    {user.is_admin ? (
                                        <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold font-mono">ADMIN</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold font-mono">USER</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    {!user.is_admin && (
                                        <button 
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                            className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                                            title="Ban User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDash;
