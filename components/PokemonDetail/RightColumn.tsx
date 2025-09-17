

import React, { useMemo } from 'react';
import { Pokedex, PokemonData, Rank } from '../../types';
import { LabeledInput } from './Shared';
import { RANKS, RANK_ORDER } from '../../constants';

interface RightColumnProps {
    pokemonData: PokemonData;
    updateField: (field: keyof PokemonData, value: any) => void;
    pokemon: Pokedex;
    trainerRank: Rank;
}

const RightColumn: React.FC<RightColumnProps> = ({ pokemonData, updateField, pokemon, trainerRank }) => {
    const quickRefFields: { label: string, field: keyof PokemonData }[] = [
        { label: 'INITIATIVE:', field: 'initiative' }, { label: 'ACCURACY:', field: 'accuracy' },
        { label: 'DAMAGE:', field: 'damage' }, { label: 'EVASION:', field: 'evasionValue' },
        { label: 'CLASH:', field: 'clashValue' }, { label: 'DEF/S.DEF', field: 'defSDef' },
    ];
    
    const isOverleveled = useMemo(() => {
        const pokemonRankOrder = RANK_ORDER[pokemonData.rank as Rank] ?? 0;
        const trainerRankOrder = RANK_ORDER[trainerRank] ?? 0;
        return pokemonRankOrder > trainerRankOrder;
    }, [pokemonData.rank, trainerRank]);

    return (
        <div className="lg:col-span-2 space-y-2.5">
            <div className="bg-[#3A3A3A] rounded-2xl p-2 w-full flex items-center gap-2">
                <label className="text-white font-bold text-sm w-14 flex-shrink-0 font-pixel">HP</label>
                <div 
                    id="hp"
                    className="w-full bg-white rounded-lg px-2 py-1.5 text-black text-center text-xs border-2 border-[#3A3A3A]"
                    aria-label={`HP calculation: ${pokemon.BaseHP} + ${pokemonData.vitality}`}
                >
                    {pokemon.BaseHP}+{pokemonData.vitality}={pokemon.BaseHP + pokemonData.vitality}
                </div>
            </div>
            <div className="bg-[#3A3A3A] rounded-2xl p-2 w-full flex items-center gap-2">
                <label className="text-white font-bold text-sm w-14 flex-shrink-0 font-pixel">WILL</label>
                <div 
                    id="will"
                    className="w-full bg-white rounded-lg px-2 py-1.5 text-black text-center text-xs border-2 border-[#3A3A3A]"
                    aria-label={`Will calculation: ${pokemonData.insight} + 2`}
                >
                    2+{pokemonData.insight}={pokemonData.insight + 2}
                </div>
            </div>

            <LabeledInput id="item" label="ITEM:" value={pokemonData.item} onChange={v => updateField('item', v)} />
            <LabeledInput id="status" label="STATUS:" value={pokemonData.status} onChange={v => updateField('status', v)} />

            <div className="space-y-1.5 pt-2">
                <h3 className="text-center text-[#B2483D] font-bold text-xs">QUICK REFERENCES</h3>
                {quickRefFields.map(({ label, field }) => (
                    <LabeledInput
                        key={field}
                        id={field}
                        label={label}
                        value={pokemonData[field] as string}
                        onChange={(value) => updateField(field, value)}
                    />
                ))}
            </div>

            <div className={`bg-[#3A3A3A] rounded-2xl p-2 font-pixel flex items-stretch gap-2 mt-2 transition-all ${isOverleveled ? 'ring-2 ring-yellow-400' : ''}`}>
                <label htmlFor="rank" className="text-white font-bold text-sm uppercase flex items-center justify-start px-1 flex-shrink-0">
                    RANK
                </label>
                <select
                    id="rank"
                    value={pokemonData.rank}
                    onChange={(e) => updateField('rank', e.target.value as Rank)}
                    className="w-full bg-white rounded-xl px-2 py-1.5 text-black text-sm font-sans focus:outline-none border-2 border-[#3A3A3A] appearance-none"
                >
                    {RANKS.map(rank => <option key={rank} value={rank}>{rank}</option>)}
                </select>
                 {isOverleveled && (
                     <div className="flex items-center pl-2" title="This Pokémon's Rank is higher than your Trainer Rank. It may be difficult to control in battle!">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                         </svg>
                     </div>
                )}
            </div>
        </div>
    );
};

export default RightColumn;