import React from 'react';
import FitnessCoach from './components/FitnessCoach';
import './index.css';

function App() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <nav className="p-4 bg-slate-900 border-b border-slate-700/50 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 pl-4 tracking-wider uppercase">
          Athletica AI
        </h1>
        <div className="flex gap-4 pr-4">
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">Squat Mode</div>
        </div>
      </nav>
      <main>
        <FitnessCoach />
      </main>
    </div>
  );
}

export default App;
