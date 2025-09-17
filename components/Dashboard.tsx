import React, { useState } from 'react';
import { Pokedex, TeamMember, TrainerData, ItemsData } from '../types';
import TeamBuilder from './TeamBuilder';
import TrainerSheet from './TrainerSheet';

interface DashboardProps {
    team: TeamMember[];
    onSelectPokemon: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    onAddPokemonClick: () => void;
    trainerData: TrainerData;
    onTrainerDataChange: (updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    allItems: ItemsData | null;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const [activeView, setActiveView] = useState<'team' | 'trainer'>('team');

    const getTabClassName = (view: 'team' | 'trainer') => {
        const base = "px-6 py-3 font-pixel text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:z-10";
        if (activeView === view) {
            return `${base} bg-slate-700/80 text-poke-yellow border-b-4 border-poke-yellow`;
        }
        return `${base} text-gray-400 hover:text-white hover:bg-slate-700/50`;
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex justify-center border-b-2 border-slate-700/80 -mx-4 -mt-4">
                <button 
                    onClick={() => setActiveView('team')} 
                    className={getTabClassName('team')}
                    aria-current={activeView === 'team'}
                >
                    Pokémon Team
                </button>
                <button 
                    onClick={() => setActiveView('trainer')} 
                    className={getTabClassName('trainer')}
                     aria-current={activeView === 'trainer'}
                >
                    Trainer Sheet
                </button>
            </div>
            <div className="flex-grow pt-4">
                {activeView === 'team' && (
                    <TeamBuilder 
                        team={props.team}
                        onSelectPokemon={props.onSelectPokemon}
                        onRemoveFromTeam={props.onRemoveFromTeam}
                        onAddPokemonClick={props.onAddPokemonClick}
                    />
                )}
                {activeView === 'trainer' && (
                    <TrainerSheet
                        trainerData={props.trainerData}
                        onDataChange={props.onTrainerDataChange}
                        allItems={props.allItems}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
