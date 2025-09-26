import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Pokedex, TeamMember, TeamTypeCoverageData } from '../src/types/index.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';
import { TYPE_CHART } from '../src/constants/gameConstants.js';
import { PokeballIcon, SparklesIcon } from './Icons.js';
import TypeBadge from './TypeBadge.js';
import { calculateTeamTypeCoverage } from '../src/logic/formulas.js';


/**
 * TooltipData interface for tooltip content and position.
 */
import { TooltipData, TeamBuilderProps, TeamSlotProps } from './types.js';

/**
 * PokemonTooltip component displays detailed information about a Pokémon in the team when hovered.
 * @param {object} props - Component props.
 * @param {TooltipData | null} props.tooltipData - Data for the tooltip, or null if no tooltip should be shown.
 * @returns {React.FC} The rendered PokemonTooltip component.
 */
const PokemonTooltip: React.FC<{ tooltipData: TooltipData | null }> = ({ tooltipData }) => {
    const [currentTooltipData, setCurrentTooltipData] = useState<TooltipData | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (tooltipData) {
            setCurrentTooltipData(tooltipData);
            animationFrameId = requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            timeoutId = setTimeout(() => {
                setCurrentTooltipData(null);
            }, 150); // Match transition duration
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [tooltipData]);

    if (!currentTooltipData) return null;

    const { content: teamMember, rect } = currentTooltipData;
    const { pokedexData: pokemon, sheetData } = teamMember;

    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none',
        zIndex: 1000,
    };

    return (
        <div 
            style={style} 
            className={`
                w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg z-20 
                transition-opacity duration-150 ease-in-out font-sans
                ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
        >
            <div className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-b border-r border-slate-600 transform rotate-45"></div>
            
            <h4 className="font-bold text-poke-yellow mb-2 text-center text-lg">{pokemon.Name}</h4>

            {pokemon.RecommendedRank && pokemon.RecommendedRank !== 'Starter' && (
                <p className="text-center text-xs text-poke-yellow/80 font-semibold -mt-2 mb-2">
                    Recommended Rank: {pokemon.RecommendedRank}
                </p>
            )}
            
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
    );
};


// --- Type Coverage Component ---

/**
 * @interface CoverageDisplayProps
 * @property {string} title - The title for the coverage display (e.g., "Weaknesses", "Resistances").
 * @property {string[]} types - An array of all Pokémon types.
 * @property {{ [key: string]: number }} data - A map of type names to their counts (e.g., number of weaknesses).
 * @property {string} colorClass - CSS class for styling the title and counts.
 * @property {{ [key: string]: number }} [immunityData] - Optional map of type names to immunity counts.
 */

/**
 * CoverageDisplayProps interface for the CoverageDisplay component.
 */
interface CoverageDisplayProps {
    title: string;
    types: string[];
    data: { [key: string]: number };
    colorClass: string;
    immunityData?: { [key: string]: number };
}

/**
 * CoverageDisplay component renders a list of types with their corresponding counts,
 * used to visualize team type weaknesses, resistances, or immunities.
 * @param {CoverageDisplayProps} props - The props for the CoverageDisplay component.
 * @returns {React.FC} The rendered CoverageDisplay component.
 */
const CoverageDisplay: React.FC<CoverageDisplayProps> = ({ title, types, data, colorClass, immunityData }) => {
    const relevantTypes = types.filter(type => {
        const count = data[type] || 0;
        const immunityCount = immunityData ? immunityData[type] || 0 : 0;
        return count > 0 || immunityCount > 0;
    });

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className={`text-xl font-bold font-primary text-center mb-4 ${colorClass}`}>{title}</h3>
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


/**
 * @interface TeamTypeCoverageProps
 * @property {TeamTypeCoverageData} coverage - The calculated type coverage data for the team.
 */

/**
 * TeamTypeCoverage component displays a summary of the team's collective type weaknesses, resistances, and immunities.
 * It uses `CoverageDisplay` to render each category.
 * @param {TeamTypeCoverageProps} props - The props for the TeamTypeCoverage component.
 * @returns {React.FC} The rendered TeamTypeCoverage component.
 */
interface TeamTypeCoverageProps {
    coverage: TeamTypeCoverageData;
}
const TeamTypeCoverage: React.FC<TeamTypeCoverageProps> = ({ coverage }) => {
    const allTypes = Object.keys(TYPE_CHART).sort();

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold font-primary text-poke-yellow mb-4 text-center">Team Type Coverage</h2>
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


/**
 * TeamSlot component represents an individual slot in the Pokémon team builder.
 * It can display an existing Pokémon or an "Add Pokémon" button if empty.
 * It also handles hover events to show a tooltip with Pokémon details.
 * @param {TeamSlotProps} props - The props for the TeamSlot component.
 * @returns {React.FC} The rendered TeamSlot component.
 */

/**
 * TeamSlotProps interface for the TeamSlot component.
 */

const TeamSlot: React.FC<TeamSlotProps> = ({ teamMember, onSelect, onRemove, onAddPokemonClick, onMouseEnter, onMouseLeave, onQuickImport, onQuickExport }) => {
    if (!teamMember) {
        return (
            <div className="w-full h-40 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center group transition-colors duration-200 focus-within:border-poke-yellow focus-within:bg-slate-700 overflow-hidden">
                {/* Add Pokémon (80% Height: h-32) */}
                <button
                    onClick={onAddPokemonClick}
                    // Changed from flex-1 to h-32 (128px, 80% of h-40)
                    className="w-full h-32 flex flex-col items-center justify-center hover:bg-slate-700/50 transition-colors"
                    aria-label="Add Pokémon to team"
                >
                    <PokeballIcon className="w-12 h-12 text-slate-600 group-hover:text-poke-yellow transition-colors" />
                    <span className="mt-1 font-semibold text-slate-500 group-hover:text-poke-yellow transition-colors">Add Pokémon</span>
                </button>
                
                <div className="w-full border-t border-dashed border-slate-600"></div>
                
                {/* Quick Import (20% Height: h-8) */}
                <button
                    onClick={onQuickImport}
                    // Changed from flex-1 to h-8 (32px, 20% of h-40)
                    className="w-full h-8 flex flex-col items-center justify-center hover:bg-slate-700/50 transition-colors text-sm"
                    aria-label="Quick import Pokémon"
                >
                    <span className="font-semibold text-slate-500 group-hover:text-poke-yellow transition-colors">Quick Import</span>
                </button>
            </div>
        );
    }

    const { pokedexData: pokemon } = teamMember;
    const imageUrl = `${IMAGE_BASE_URL}${pokemon.Image}`;

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        onMouseEnter(teamMember, event.currentTarget);
    };
    
    return (
        <div 
            onClick={() => onSelect(pokemon.DexID, teamMember.instanceID)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
            className="relative w-full h-40 bg-slate-700/80 rounded-lg group animate-fade-in shadow-lg cursor-pointer hover:bg-slate-700 transition-colors flex flex-col items-center justify-center p-2"
        >
            <div className="absolute top-1 right-1 z-10 flex flex-col gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(teamMember.instanceID); }}
                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 text-xs opacity-50 group-hover:opacity-100 transition-opacity"
                    title="Remove from team"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onQuickExport(teamMember); }}
                    className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-xs opacity-50 group-hover:opacity-100 transition-opacity"
                    title="Quick Export"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </button>
            </div>

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


/**
 * The TeamBuilder component allows users to assemble and manage their Pokémon team.
 * It displays up to six Pokémon slots, provides type coverage analysis, and integrates with an AI team suggestion modal.
 * @param {TeamBuilderProps} props - The props for the TeamBuilder component.
 * @returns {React.FC} The rendered TeamBuilder component.
 */

/**
 * TeamBuilderProps interface for the TeamBuilder component.
 */

const TeamBuilder: React.FC<TeamBuilderProps> = ({ team, onSelectPokemon, onRemoveFromTeam, onAddPokemonClick, onOpenSuggestModal, onQuickImport, onQuickExport }) => {
    const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
    const teamCoverage = useMemo(() => calculateTeamTypeCoverage(team), [team]);
    
    const handleMouseEnter = useCallback((teamMember: TeamMember, element: HTMLElement) => {
        setTooltipData({ content: teamMember, rect: element.getBoundingClientRect() });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setTooltipData(null);
    }, []);

    const handleQuickImport = (index: number) => {
        if (team.length >= 6) {
            alert("Your team is full!");
            return;
        }
        const importString = prompt(`Quick Import for Slot ${index + 1}\n\nPaste a Pokémon Showdown export string for a single Pokémon.`);
        if (importString) {
            onQuickImport(importString, index);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in-scale">
            <PokemonTooltip tooltipData={tooltipData} />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
                <h2 className="text-3xl font-bold text-poke-yellow">Your Team</h2>
                 <button
                    onClick={onOpenSuggestModal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white font-primary text-xs rounded-md border-b-2 border-purple-800 hover:bg-purple-500 active:translate-y-px active:border-b-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow"
                    title="Get an AI-powered team suggestion!"
                >
                    <SparklesIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Suggest Team</span>
                    <span className="sm:hidden">Suggest</span>
                 </button>
            </div>
            <p className="text-gray-400 mb-6 text-center">Select Pokémon from the list or manage your team below.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
                {Array.from({ length: 6 }).map((_, index) => {
                    const teamMember = team[index];
                    return (
                    <TeamSlot
                        key={teamMember ? teamMember.instanceID : index}
                        teamMember={teamMember}
                        onSelect={onSelectPokemon}
                        onRemove={onRemoveFromTeam}
                        onAddPokemonClick={onAddPokemonClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onQuickImport={() => handleQuickImport(index)}
                        onQuickExport={onQuickExport}
                    />
                )})}
            </div>
             {team.length >= 6 && (
                <p className="mt-6 text-lg font-semibold text-poke-red animate-pulse-slow">Your team is full!</p>
            )}

            {team.length > 0 && <TeamTypeCoverage coverage={teamCoverage} />}
        </div>
    );
};

export default TeamBuilder;