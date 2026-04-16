import React, { useState } from 'react';
import { Utensils, Droplets, Flame, Leaf, Fish } from 'lucide-react';

const dietPlans = {
  "North Indian": [
    { meal: "Breakfast", items: "2 Paneer Parathas + 1 bowl Curd", protein: "22g", carbs: "45g", calories: "350" },
    { meal: "Lunch", items: "2 Roti + Rajma Chawal + Kachumber Salad", protein: "18g", carbs: "60g", calories: "450" },
    { meal: "Pre-Workout", items: "1 Banana + Handful of Almonds", protein: "5g", carbs: "25g", calories: "150" },
    { meal: "Dinner", items: "Chicken/Soya Tikka + Mixed Veg Sabzi", protein: "35g", carbs: "20g", calories: "400" },
  ],
  "South Indian": [
    { meal: "Breakfast", items: "3 Moong Dal Pesarattu (Dosa) + Coconut Chutney", protein: "15g", carbs: "40g", calories: "320" },
    { meal: "Lunch", items: "Brown Rice + Sambar + Cabbage Poriyal + 1 Boiled Egg", protein: "20g", carbs: "55g", calories: "480" },
    { meal: "Pre-Workout", items: "Filter Coffee (Black) + Handful Peanuts", protein: "7g", carbs: "10g", calories: "140" },
    { meal: "Dinner", items: "Ragi Mudde + Chicken/Mushroom Curry", protein: "30g", carbs: "45g", calories: "420" },
  ],
  "Keto (Low Carb)": [
    { meal: "Breakfast", items: "3 Scrambled Eggs + Spinach & Cheese", protein: "24g", carbs: "3g", calories: "310" },
    { meal: "Lunch", items: "Grilled Fish/Tofu Salad + Olive Oil Dressing", protein: "35g", carbs: "5g", calories: "400" },
    { meal: "Pre-Workout", items: "Black Coffee + 1 tsp Ghee", protein: "0g", carbs: "0g", calories: "50" },
    { meal: "Dinner", items: "Cauliflower Rice + Mutton/Paneer Do Pyaza", protein: "30g", carbs: "8g", calories: "450" },
  ],
  "Vegan (Plant Based)": [
    { meal: "Breakfast", items: "Oats with Almond Milk & Chia Seeds", protein: "12g", carbs: "55g", calories: "340" },
    { meal: "Lunch", items: "Quinoa Bowl + Chickpea Curry (Chana Masala)", protein: "20g", carbs: "60g", calories: "460" },
    { meal: "Pre-Workout", items: "Apple + Peanut Butter", protein: "6g", carbs: "20g", calories: "180" },
    { meal: "Dinner", items: "Tofu Stir-fry with Broccoli & Bell Peppers", protein: "25g", carbs: "15g", calories: "350" },
  ]
};

const AiDiet = () => {
  const [activeCuisine, setActiveCuisine] = useState("North Indian");

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen bg-slate-900 text-white overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Utensils className="text-emerald-400 w-8 h-8" />
        <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          AI Nutrition Coach
        </h2>
      </div>

      {/* Cuisine Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-4 custom-scrollbar">
        {Object.keys(dietPlans).map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setActiveCuisine(cuisine)}
            className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 shadow-md border ${
              activeCuisine === cuisine
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 border-transparent scale-105'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-400 hover:text-emerald-300'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Target Calories", val: "~2,200", icon: <Flame className="text-rose-400" /> },
          { label: "Daily Protein", val: "135g+", icon: <Fish className="text-blue-400" /> },
          { label: "Hydration", val: "3.5L", icon: <Droplets className="text-cyan-400" /> },
          { label: "Fiber Target", val: "30g", icon: <Leaf className="text-emerald-400" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg shadow-inner">{stat.icon}</div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Diet Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {dietPlans[activeCuisine].map((meal_info, i) => (
          <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-colors shadow-lg relative overflow-hidden group">
            
            {/* Decorative background element */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-xl font-bold text-emerald-400">{meal_info.meal}</h3>
              <span className="px-3 py-1 bg-slate-900 border border-slate-600 rounded-full text-xs font-bold text-slate-300">
                {meal_info.calories} kcal
              </span>
            </div>
            
            <p className="text-lg text-white font-medium mb-6 relative z-10 min-h-[3rem]">
              {meal_info.items}
            </p>
            
            <div className="flex gap-4 relative z-10">
              <div className="flex-1 bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Protein</p>
                <p className="font-bold text-cyan-400">{meal_info.protein}</p>
              </div>
              <div className="flex-1 bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Carbs</p>
                <p className="font-bold text-amber-400">{meal_info.carbs}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiDiet;
