import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
    const colorClasses = {
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        trend === 'up' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;
