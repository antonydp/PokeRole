

import React from 'react';
import { Pokedex, PokemonData } from '../../types';
import { LabeledInput } from './Shared';

interface RightColumnProps {
    pokemonData: PokemonData;
    updateField: (field: keyof PokemonData, value: any) => void;
    pokemon: Pokedex;
}

const RightColumn: React.FC<RightColumnProps> = ({ pokemonData, updateField, pokemon }) => {
    const quickRefFields: { label: string, field: keyof PokemonData }[] = [
        { label: 'INITIATIVE:', field: 'initiative' }, { label: 'ACCURACY:', field: 'accuracy' },
        { label: 'DAMAGE:', field: 'damage' }, { label: 'EVASION:', field: 'evasionValue' },
        { label: 'CLASH:', field: 'clashValue' }, { label: 'DEF/S.DEF', field: 'defSDef' },
    ];

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

            <div className="bg-[#3A3A3A] rounded-2xl p-2 font-pixel flex items-stretch gap-2 mt-2">
                <label htmlFor="rank" className="text-white font-bold text-sm uppercase flex items-center justify-start px-1 flex-shrink-0">
                    RANK
                </label>
                <input
                    id="rank"
                    type="text"
                    value={pokemonData.rank}
                    onChange={(e) => updateField('rank', e.target.value)}
                    className="w-full bg-white rounded-xl px-2 py-1.5 text-black text-sm font-sans focus:outline-none border-2 border-[#3A3A3A]"
                />
            </div>
        </div>
    );
};

export default RightColumn;