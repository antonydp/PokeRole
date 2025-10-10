import React from 'react';
import TeamBuilder from './TeamBuilder.js';
import TrainerSheet from './TrainerSheet.js';
import PokemonPC from './PokemonPC.js';
import { useUIStore } from '../src/store/useUIStore.js';

const Dashboard: React.FC = () => {
    const { activeView, setActiveView } = useUIStore();

    const getTabClassName = (view: 'team' | 'trainer' | 'pc') => {
        const base = "px-4 sm:px-6 py-3 font-primary text-base sm:text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:z-10 flex items-center gap-2";
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
                    onClick={() => setActiveView('team')}
                    className={getTabClassName('team')}
                    aria-current={activeView === 'team'}
                >
                    Pokémon Team
                </button>
                <button
                    onClick={() => setActiveView('pc')}
                    className={getTabClassName('pc')}
                    aria-current={activeView === 'pc'}
                >
                    Pokémon PC
                </button>
            </div>
            <div className="flex-grow pt-4 overflow-y-auto">
                {activeView === 'trainer' && <TrainerSheet />}
                {activeView === 'team' && <TeamBuilder />}
                {activeView === 'pc' && <PokemonPC />}
            </div>
        </div>
    );
};

export default Dashboard;