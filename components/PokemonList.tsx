import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Grid, type CellComponentProps } from 'react-window';
import { Pokedex } from '../src/types/index.js';
import PokemonCard from './PokemonCard.js';
import { TYPE_COLORS } from '../src/constants/gameConstants.js';


/**
 * Defines the structure for initial stat filters.
 * @typedef {object} StatFilter
 * @property {string} min - Minimum value for the stat.
 * @property {string} max - Maximum value for the stat.
 */

/**
 * Initial state for the stat filters.
 * @type {{ BaseHP: StatFilter; Strength: StatFilter; Dexterity: StatFilter; Vitality: StatFilter; Special: StatFilter; Insight: StatFilter; }}
 */
const initialStatFilters = {
    BaseHP: { min: '', max: '' },
    Strength: { min: '', max: '' },
    Dexterity: { min: '', max: '' },
    Vitality: { min: '', max: '' },
    Special: { min: '', max: '' },
    Insight: { min: '', max: '' },
};

/**
 * Array of keys for the base stat fields used in filtering.
 * @type {(keyof typeof initialStatFilters)[]}
 */
const STAT_FIELDS: (keyof typeof initialStatFilters)[] = ['BaseHP', 'Strength', 'Dexterity', 'Vitality', 'Special', 'Insight'];

/**
 * The PokemonList component displays a filterable and searchable list of all Pokémon.
 * It allows users to search by name, filter by type, legendary status, abilities, and base stats.
 * @param {PokemonListProps} props - The props for the PokemonList component.
 * @returns {React.FC} The rendered PokemonList component.
 */

import { useGameDataStore } from '../src/store/useGameDataStore.js';
import { useUIStore } from '../src/store/useUIStore.js';
import { useSessionStore } from '../src/store/useSessionStore.js';
import { createInitialSheetData } from '../src/logic/initializers.js';


type PokemonListProps = {
    isOpen: boolean;
};

const PokemonList: React.FC<PokemonListProps> = ({ isOpen }) => {
    const { allPokemon } = useGameDataStore();
    const { addPokemonTarget, selectPokemon } = useUIStore();
    const { addToTeam, addToPC, trainerData } = useSessionStore();
    const { unitSettings } = useUIStore();
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const [statFilters, setStatFilters] = useState(initialStatFilters);
    const [abilityFilter, setAbilityFilter] = useState('');
    const [legendaryFilter, setLegendaryFilter] = useState<'all' | 'yes' | 'no'>('all');
    const [excludeForms, setExcludeForms] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100); // Delay to account for sidebar transition
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSelectPokemon = (pokemon: Pokedex) => {
        const sheetData = createInitialSheetData(pokemon, unitSettings, trainerData.trainerRank);
        let newMember;
        if (addPokemonTarget === 'team') {
            newMember = addToTeam(pokemon, sheetData);
        } else {
            newMember = addToPC(pokemon, sheetData);
        }

        if (newMember) {
            selectPokemon(newMember.pokedexData.DexID, newMember.instanceID, addPokemonTarget);
        }
    };

    const handleStatChange = (stat: keyof typeof initialStatFilters, bound: 'min' | 'max', value: string) => {
        setStatFilters(prev => ({
            ...prev,
            [stat]: { ...prev[stat], [bound]: value }
        }));
    };
    
    const resetAdvancedFilters = useCallback(() => {
        setStatFilters(initialStatFilters);
        setAbilityFilter('');
        setLegendaryFilter('all');
        setExcludeForms(false);
    }, []);

    const pokemonTypes = useMemo(() => {
        return Object.keys(TYPE_COLORS);
    }, []);
    
    const filteredPokemon = useMemo(() => {
        return allPokemon.filter(pokemon => {
            // Name Filter
            const nameMatch = pokemon.Name.toLowerCase().includes(searchTerm.toLowerCase());
            if (!nameMatch) return false;

            if (excludeForms && pokemon.Name.toLowerCase().includes('form)')) {
                return false;
            }

            // Type Filter
            const typeMatch = !typeFilter || pokemon.Type1 === typeFilter || pokemon.Type2 === typeFilter;
            if (!typeMatch) return false;

            // Legendary Filter
            const legendaryMatch = legendaryFilter === 'all' ||
                (legendaryFilter === 'yes' && pokemon.Legendary) ||
                (legendaryFilter === 'no' && !pokemon.Legendary);
            if (!legendaryMatch) return false;

            // Ability Filter
            const abilityTerm = abilityFilter.toLowerCase().trim();
            if (abilityTerm) {
                const abilities = [
                    pokemon.Ability1,
                    pokemon.Ability2,
                    pokemon.HiddenAbility,
                    pokemon.EventAbilities
                ].filter(Boolean).join(', ').toLowerCase();
                if (!abilities.includes(abilityTerm)) {
                    return false;
                }
            }
            
            // Stat Filters
            for (const stat of STAT_FIELDS) {
                const pokemonStatValue = pokemon[stat as 'BaseHP']; // Type assertion needed here
                const min = statFilters[stat].min !== '' ? parseInt(statFilters[stat].min, 10) : -Infinity;
                const max = statFilters[stat].max !== '' ? parseInt(statFilters[stat].max, 10) : Infinity;

                if (!isNaN(min) && pokemonStatValue < min) return false;
                if (!isNaN(max) && pokemonStatValue > max) return false;
            }

            return true;
        });
    }, [allPokemon, searchTerm, typeFilter, statFilters, abilityFilter, legendaryFilter, excludeForms]);

    const columnCount = 3;
    const rowCount = Math.ceil(filteredPokemon.length / columnCount);
    const itemWidth = 300;
    const itemHeight = 100;

    type PokemonCellData = {
        pokemonList: Pokedex[];
        onSelectPokemon: (pokemon: Pokedex) => void;
    };
    
    const Cell = ({ columnIndex, rowIndex, style, pokemonList, onSelectPokemon }: CellComponentProps<PokemonCellData>) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= pokemonList.length) {
            return null;
        }
        const pokemon = pokemonList[index];
        return (
            <div style={style} className="p-1 flex">
                <PokemonCard
                    pokemon={pokemon}
                    onSelect={() => onSelectPokemon(pokemon)}
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 sticky top-0 bg-slate-800 z-10">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Pokémon..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                />
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    <button 
                        onClick={() => setTypeFilter(null)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${!typeFilter ? 'bg-poke-blue text-white ring-2 ring-poke-yellow' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'}`}
                    >
                        All
                    </button>
                    {pokemonTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${typeFilter === type ? 'ring-2 ring-poke-yellow' : 'hover:opacity-80' } ${TYPE_COLORS[type]}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                 <div className="mt-2 text-center">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-poke-yellow hover:text-yellow-300 transition-colors py-1">
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters {showAdvanced ? '▲' : '▼'}
                    </button>
                </div>
                
                {showAdvanced && (
                    <div className="p-3 my-2 bg-slate-900/50 rounded-lg animate-fade-in space-y-4">
                        {/* Exclude Forms Filter */}
                        <div className="flex items-center">
                            <input
                                id="excludeForms"
                                type="checkbox"
                                checked={excludeForms}
                                onChange={e => setExcludeForms(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                            />
                            <label htmlFor="excludeForms" className="ml-2 text-sm font-medium text-gray-300">
                                Exclude Pokémon with "Form" in name
                            </label>
                        </div>
                        {/* Legendary Filter */}
                        <div>
                           <label className="text-sm font-bold text-gray-300 mb-2 block">Legendary</label>
                           <div className="flex justify-center gap-2">
                                {(['all', 'yes', 'no'] as const).map(val => (
                                    <button 
                                        key={val}
                                        onClick={() => setLegendaryFilter(val)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-all ${legendaryFilter === val ? 'bg-poke-blue text-white ring-2 ring-poke-yellow' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'}`}
                                    >{val}</button>
                                ))}
                           </div>
                        </div>

                        {/* Ability Filter */}
                        <div>
                             <label htmlFor="abilityFilter" className="text-sm font-bold text-gray-300 mb-2 block">Ability</label>
                             <input
                                id="abilityFilter"
                                type="text"
                                placeholder="Filter by ability..."
                                value={abilityFilter}
                                onChange={e => setAbilityFilter(e.target.value)}
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-poke-blue"
                            />
                        </div>

                        {/* Stat Filters */}
                        <div>
                             <label className="text-sm font-bold text-gray-300 mb-2 block">Base Stats</label>
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {STAT_FIELDS.map(stat => (
                                    <div key={stat}>
                                        <label className="text-xs text-gray-400 capitalize">{stat === 'BaseHP' ? 'HP' : stat}</label>
                                        <div className="flex gap-1">
                                            <input 
                                                type="number"
                                                placeholder="Min"
                                                min="0"
                                                value={statFilters[stat].min}
                                                onChange={e => handleStatChange(stat, 'min', e.target.value)}
                                                className="w-full p-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
                                            />
                                            <input 
                                                type="number"
                                                placeholder="Max"
                                                min="0"
                                                value={statFilters[stat].max}
                                                onChange={e => handleStatChange(stat, 'max', e.target.value)}
                                                className="w-full p-1 text-sm bg-slate-700 border border-slate-600 rounded text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <button onClick={resetAdvancedFilters} className="w-full mt-2 text-sm text-center bg-poke-red/80 hover:bg-poke-red text-white py-1.5 rounded-md transition-colors">
                            Reset Advanced Filters
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-hidden">
                {filteredPokemon.length > 0 ? (
                    <Grid
                        columnCount={columnCount}
                        columnWidth={itemWidth}
                        rowCount={rowCount}
                        rowHeight={itemHeight}
                        cellComponent={Cell}
                        cellProps={{
                            pokemonList: filteredPokemon,
                            onSelectPokemon: handleSelectPokemon
                        }}
                    />
                ) : (
                    <p className="text-center text-gray-400 mt-8">No Pokémon found.</p>
                )}
            </div>
        </div>
    );
};

export default PokemonList;