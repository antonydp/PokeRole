import React, { useState } from 'react';
import { Pokedex, TeamMember, TrainerData, ItemsData } from '../src/types/index.js';
import TeamBuilder from './TeamBuilder.js';
import TrainerSheet from './TrainerSheet.js';

/**
 * @interface DashboardProps
 * @property {TeamMember[]} team - The current Pokémon team.
 * @property {(pokemon: Pokedex) => void} onSelectPokemon - Callback to select a Pokémon for detail view.
 * @property {(pokemon: Pokedex) => void} onRemoveFromTeam - Callback to remove a Pokémon from the team.
 * @property {() => void} onAddPokemonClick - Callback to open the Pokémon list for adding.
 * @property {TrainerData} trainerData - The current trainer's data.
 * @property {(updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void} onTrainerDataChange - Callback to update trainer data.
 * @property {ItemsData | null} allItems - All available items data.
 * @property {() => void} onOpenSuggestModal - Callback to open the AI team suggestion modal.
 */

/**
 * The Dashboard component serves as the main navigation hub for the application.
 * It allows users to switch between viewing their Pokémon team and their Trainer Sheet.
 * @param {DashboardProps} props - The props for the Dashboard component.
 * @returns {React.FC} The rendered Dashboard component.
 */

// Define the DashboardProps interface
interface DashboardProps {
    team: TeamMember[];
    onSelectPokemon: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    onAddPokemonClick: () => void;
    trainerData: TrainerData;
    onTrainerDataChange: ((updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void);
    allItems: ItemsData | null;
    onOpenSuggestModal: () => void;
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
                        onOpenSuggestModal={props.onOpenSuggestModal}
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