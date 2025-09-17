import React, { useMemo } from 'react';
import { Pokedex, TeamMember, TeamTypeCoverageData } from '../types';
import { IMAGE_BASE_URL, TYPE_CHART } from '../constants';
import { PokeballIcon } from './Icons';
import TypeBadge from './TypeBadge';
import { calculateTeamTypeCoverage } from '../utils';

interface TeamBuilderProps {
    team: TeamMember[];
    onSelectPokemon: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    onAddPokemonClick: () => void;
}


// --- New Type Coverage Component ---

interface CoverageDisplayProps {
    title: string;
    types: string[];
    data: { [key: string]: number };
    colorClass: string;
    immunityData?: { [key: string]: number };
}

const CoverageDisplay: React.FC<CoverageDisplayProps> = ({ title, types, data, colorClass, immunityData }) => {
    const relevantTypes = types.filter(type => {
        const count = data[type] || 0;
        const immunityCount = immunityData ? immunityData[type] || 0 : 0;
        return count > 0 || immunityCount > 0;
    });

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className={`text-xl font-bold font-pixel text-center mb-4 ${colorClass}`}>{title}</h3>
            {relevantTypes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {relevantTypes.map(type => {
                        const count = data[type] || 0;
                        const immunityCount = immunityData ? immunityData[type] || 0 : 0;

                        return (
                            <div key={type} className="flex items-center justify-between bg-slate-700/50 p-1.5 rounded-md">
                                <TypeBadge type={type} />
                                <div className="flex items-center gap-2 font-sans font-bold text-sm">
                                    {count > 0 && <span className={colorClass}>{count}x</span>}
                                    {immunityCount > 0 && <span className="text-cyan-400" title={`${immunityCount} members immune`}>{immunityCount}x🛡️</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-400 italic">None</p>
            )}
        </div>
    );
};


interface TeamTypeCoverageProps {
    coverage: TeamTypeCoverageData;
}

const TeamTypeCoverage: React.FC<TeamTypeCoverageProps> = ({ coverage }) => {
    const allTypes = Object.keys(TYPE_CHART).sort();

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold font-pixel text-poke-yellow mb-4 text-center">Team Type Coverage</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CoverageDisplay
                    title="Weaknesses"
                    types={allTypes}
                    data={coverage.weaknesses}
                    colorClass="text-red-400"
                />
                <CoverageDisplay
                    title="Resistances"
                    types={allTypes}
                    data={coverage.resistances}
                    colorClass="text-green-400"
                    immunityData={coverage.immunities}
                />
            </div>
        </div>
    );
};


const TeamSlot: React.FC<{ 
    teamMember?: TeamMember; 
    onSelect: (p: Pokedex) => void; 
    onRemove: (p: Pokedex) => void;
    onAddPokemonClick: () => void;
}> = ({ teamMember, onSelect, onRemove, onAddPokemonClick }) => {
    if (!teamMember) {
        return (
            <button
                onClick={onAddPokemonClick}
                className="w-full h-40 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center group hover:bg-slate-700 hover:border-poke-yellow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Add Pokémon to team"
            >
                <PokeballIcon className="w-16 h-16 text-slate-600 transition-colors group-hover:text-poke-yellow" />
                <span className="mt-1 font-semibold text-slate-500 transition-colors group-hover:text-poke-yellow">Add Pokémon</span>
            </button>
        );
    }

    const { pokedexData: pokemon, sheetData } = teamMember;
    const imageUrl = `${IMAGE_BASE_URL}${pokemon.Image}`;
    
    return (
        <div 
            onClick={() => onSelect(pokemon)}
            className="relative w-full h-40 bg-slate-700/80 rounded-lg group animate-fade-in shadow-lg cursor-pointer hover:bg-slate-700 transition-colors flex flex-col items-center justify-center p-2"
        >
            {/* Tooltip/Popover */}
            <div className="absolute bottom-full mb-2 w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-b border-r border-slate-600 transform rotate-45"></div>
                
                <h4 className="font-bold text-poke-yellow mb-2 text-center text-lg">{pokemon.Name}</h4>
                
                <div className="mb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ability</p>
                    <p className="font-semibold text-white">{sheetData.ability}</p>
                </div>

                <div className="mb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Current Stats</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-300">
                        <div className="flex justify-between"><span>HP:</span> <span className="font-bold text-white">{sheetData.hp}</span></div>
                        <div className="flex justify-between"><span>STR:</span> <span className="font-bold text-white">{sheetData.strength}</span></div>
                        <div className="flex justify-between"><span>DEX:</span> <span className="font-bold text-white">{sheetData.dexterity}</span></div>
                        <div className="flex justify-between"><span>VIT:</span> <span className="font-bold text-white">{sheetData.vitality}</span></div>
                        <div className="flex justify-between"><span>SPE:</span> <span className="font-bold text-white">{sheetData.special}</span></div>
                        <div className="flex justify-between"><span>INS:</span> <span className="font-bold text-white">{sheetData.insight}</span></div>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Weaknesses</p>
                    <p className="text-sm text-white break-words">{sheetData.weakness}</p>
                </div>
            </div>


            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(pokemon); }}
                className="absolute top-1 right-1 z-10 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 text-xs opacity-50 group-hover:opacity-100 transition-opacity"
                title="Remove from team"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <img src={imageUrl} alt={pokemon.Name} className="h-24 w-24 object-contain" />
            
            <div className="text-center mt-1 w-full">
                <h3 className="text-sm font-bold text-white truncate px-1">{pokemon.Name}</h3>
                <div className="flex space-x-1 mt-1 justify-center">
                    <TypeBadge type={pokemon.Type1} />
                    {pokemon.Type2 && <TypeBadge type={pokemon.Type2} />}
                </div>
            </div>
        </div>
    );
};


const TeamBuilder: React.FC<TeamBuilderProps> = ({ team, onSelectPokemon, onRemoveFromTeam, onAddPokemonClick }) => {
    const teamCoverage = useMemo(() => calculateTeamTypeCoverage(team), [team]);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in-scale">
            <h2 className="text-3xl font-bold text-poke-yellow mb-2">Your Team</h2>
            <p className="text-gray-400 mb-6 text-center">Select Pokémon from the list or manage your team below.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
                {Array.from({ length: 6 }).map((_, index) => (
                    <TeamSlot 
                        key={index} 
                        teamMember={team[index]} 
                        onSelect={onSelectPokemon}
                        onRemove={onRemoveFromTeam}
                        onAddPokemonClick={onAddPokemonClick}
                    />
                ))}
            </div>
             {team.length >= 6 && (
                <p className="mt-6 text-lg font-semibold text-poke-red animate-pulse-slow">Your team is full!</p>
            )}

            {team.length > 0 && <TeamTypeCoverage coverage={teamCoverage} />}
        </div>
    );
};

export default TeamBuilder;
