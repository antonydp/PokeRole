import React from 'react';
import TeamBuilder from './TeamBuilder.js';
import TrainerSheet from './TrainerSheet.js';
import { useUIStore } from '../src/store/useUIStore.js';

const Dashboard: React.FC = () => {
    const { activeView, setActiveView } = useUIStore();

    const getTabClassName = (view: 'pokemon' | 'trainer') => {
        const base = "px-6 py-3 font-primary text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:z-10";
        if (activeView === view) {
            return `${base} bg-slate-700/80 text-poke-yellow border-b-4 border-poke-yellow`;
        }
        return `${base} text-gray-400 hover:text-white hover:bg-slate-700/50`;
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex justify-center border-b-2 border-slate-700/80 -mx-4 -mt-4">
                <button
                    onClick={() => setActiveView('trainer')}
                    className={getTabClassName('trainer')}
                    aria-current={activeView === 'trainer'}
                >
                    Trainer Sheet
                </button>
                <button
                    onClick={() => setActiveView('pokemon')}
                    className={getTabClassName('pokemon')}
                    aria-current={activeView === 'pokemon'}
                >
                    Pokémon Team
                </button>
            </div>
            <div className="flex-grow pt-4 overflow-y-auto">
                {activeView === 'trainer' && <TrainerSheet />}
                {activeView === 'pokemon' && <TeamBuilder />}
            </div>
        </div>
    );
};

export default Dashboard;