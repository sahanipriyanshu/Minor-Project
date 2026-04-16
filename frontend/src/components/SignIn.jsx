import React, { useState } from 'react';
import { Dumbbell, ArrowRight, Activity, AlertCircle } from 'lucide-react';

const SignIn = ({ onSignIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [errorEvent, setErrorEvent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorEvent('');

    try {
      const endpoint = isLogin ? 'http://localhost:8000/api/auth/login' : 'http://localhost:8000/api/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isLogin) {
        onSignIn(data); // Returns user_id, access_token, etc.
      } else {
        // Auto-login after successful registration
        setIsLogin(true);
        setErrorEvent('Registration successful! Please sign in.');
      }
    } catch (err) {
      setErrorEvent(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-white">
      {/* Left Banner Section */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-800 items-center justify-center p-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          <Dumbbell className="text-emerald-400 w-16 h-16 mx-auto mb-6" />
          <h1 className="text-5xl font-black mb-6 tracking-wide">
            WELCOME TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ATHLETICA AI</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Dominate your fitness goals with real-time tracking, live leaderboards, and streak gamification.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6 text-left">
             <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-inner">
               <Activity className="text-emerald-400 mb-2" size={24} />
               <h3 className="font-bold text-white">Earn Steaks</h3>
               <p className="text-sm text-slate-400">Build your Flame ranking</p>
             </div>
             <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-inner">
               <Dumbbell className="text-cyan-400 mb-2" size={24} />
               <h3 className="font-bold text-white">Compete Globally</h3>
               <p className="text-sm text-slate-400">Real-time Leaderboards</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Sign In' : 'Create Athlete Profile'}</h2>
            <p className="text-slate-400">{isLogin ? 'Access your personalized AI coaching session' : 'Join the Global AI Fitness Network'}</p>
          </div>

          {errorEvent && (
              <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold ${errorEvent.includes('successful') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>
                  <AlertCircle size={18} /> {errorEvent}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name (Leaderboard)</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                    placeholder="E.g., Ronnie Coleman"
                  />
                </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                placeholder="athlete@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-emerald-400 hover:to-cyan-400'}`}
            >
              {loading ? 'CONNECTING...' : (isLogin ? 'ACCESS DASHBOARD' : 'REGISTER PROFILE')} <ArrowRight size={20} />
            </button>
            
            <p className="text-center text-slate-400 mt-6 text-sm">
              {isLogin ? "Don't have an account? " : "Already an athlete? "}
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrorEvent(''); }}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-transparent border-0"
              >
                {isLogin ? 'Create one now' : 'Sign In'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
