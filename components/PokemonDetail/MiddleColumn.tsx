import React from 'react';
import { PokemonData } from '../../types';
import { CircleRating, LabeledInput } from './Shared';

interface MiddleColumnProps {
    pokemonData: PokemonData;
    updateField: (field: keyof PokemonData, value: any) => void;
}

const MiddleColumn: React.FC<MiddleColumnProps> = ({ pokemonData, updateField }) => {
    const contestStats = [
        { name: 'TOUGH', value: pokemonData.tough, field: 'tough' as const, color: 'bg-[#F7F0A0]' },
        { name: 'COOL', value: pokemonData.cool, field: 'cool' as const, color: 'bg-[#F4A27A]' },
        { name: 'BEAUTY', value: pokemonData.beauty, field: 'beauty' as const, color: 'bg-[#A1C6F4]' },
        { name: 'CUTE', value: pokemonData.cute, field: 'cute' as const, color: 'bg-[#F6B8D0]' },
        { name: 'CLEVER', value: pokemonData.clever, field: 'clever' as const, color: 'bg-[#A8D79A]' },
    ];

    return (
        <div className="lg:col-span-5 flex flex-col gap-3 h-full">
            <div className="flex gap-2 flex-grow">
                <div className="w-1/4 flex-shrink-0 flex flex-col gap-1.5">
                    {contestStats.map(attr => (
                        <div key={attr.name} className={`${attr.color} rounded-2xl p-2 border-2 border-[#3A3A3A] flex-grow flex flex-col justify-center items-center`}>
                            <span className="text-[#3A3A3A] font-bold text-xs tracking-wider">{attr.name}</span>
                            <CircleRating value={attr.value} max={5} onChange={(value) => updateField(attr.field, value)} circleClassName="w-3.5 h-3.5" className="mt-1" />
                        </div>
                    ))}
                </div>
                <div className="flex-grow flex flex-col">
                    {/* Nature & Confidence */}
                    <div className="bg-[#3A3A3A] rounded-2xl p-2 font-pixel space-y-2">
                        <div className="bg-white rounded-xl flex items-center px-3 py-1.5">
                            <label htmlFor="pokemonNature" className="text-[#3A3A3A] font-bold text-sm uppercase mr-2 flex-shrink-0">
                                NATURE:
                            </label>
                            <input
                                id="pokemonNature"
                                type="text"
                                value={pokemonData.pokemonNature}
                                onChange={(e) => updateField('pokemonNature', e.target.value)}
                                className="w-full bg-transparent focus:outline-none font-sans text-sm text-black p-0"
                            />
                        </div>
                        <div className="flex items-stretch gap-2">
                            <label htmlFor="confidence" className="text-white font-bold text-sm uppercase flex items-center justify-start px-1 flex-shrink-0">
                                CONFIDENCE
                            </label>
                            <input
                                id="confidence"
                                type="text"
                                value={pokemonData.confidence}
                                onChange={(e) => updateField('confidence', e.target.value)}
                                className="w-full bg-white rounded-xl px-2 py-1.5 text-black text-sm font-sans focus:outline-none border-2 border-[#3A3A3A]"
                            />
                        </div>
                    </div>
                    
                    {/* Growable Middle Section */}
                    <div className="flex gap-2 flex-grow my-2.5">
                        <div className="bg-[#2DB3B3] rounded-2xl p-2 w-1/2 border-4 border-[#3A3A3A] flex flex-col justify-around">
                            <div className="flex flex-col items-center">
                                <label className="text-white text-[10px] font-bold">HAPPINESS</label>
                                <CircleRating value={pokemonData.happiness} max={5} onChange={(v) => updateField('happiness', v)} circleClassName="w-3 h-3" className="mt-0.5"/>
                            </div>
                            <div className="flex flex-col items-center">
                                <label className="text-white text-[10px] font-bold">LOYALTY</label>
                                <CircleRating value={pokemonData.loyalty} max={5} onChange={(v) => updateField('loyalty', v)} circleClassName="w-3 h-3" className="mt-0.5" />
                            </div>
                        </div>
                        <div className="w-1/2 flex flex-col justify-center">
                            <div className="bg-[#C95649] rounded-2xl p-3 border-4 border-[#3A3A3A] space-y-2">
                                <div className="text-center">
                                    <label htmlFor="battles" className="font-pixel uppercase text-white text-sm font-bold tracking-wider">
                                        Nº OF BATTLES:
                                    </label>
                                    <input
                                        id="battles"
                                        type="text"
                                        value={pokemonData.numberOfBattles}
                                        onChange={(e) => updateField('numberOfBattles', e.target.value)}
                                        className="w-full bg-white rounded-xl px-2 py-1.5 mt-1 text-black text-center text-sm font-sans focus:outline-none border-2 border-transparent focus:border-[#3A3A3A]"
                                    />
                                </div>
                                <div className="text-center">
                                    <label htmlFor="victories" className="font-pixel uppercase text-white text-sm font-bold tracking-wider">
                                        VICTORIES
                                    </label>
                                    <input
                                        id="victories"
                                        type="text"
                                        value={pokemonData.victories}
                                        onChange={(e) => updateField('victories', e.target.value)}
                                        className="w-full bg-white rounded-xl px-2 py-1.5 mt-1 text-black text-center text-sm font-sans focus:outline-none border-2 border-transparent focus:border-[#3A3A3A]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accessory Section */}
                    <div>
                        <div className="relative w-full bg-white rounded-xl px-2 pt-1.5 pb-1 border-2 border-[#3A3A3A] flex flex-col items-start">
                            <label htmlFor="accessory" className="font-pixel text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold mb-1">
                                ACCESORY:
                            </label>
                            <textarea
                                id="accessory"
                                value={pokemonData.accessory}
                                onChange={(e) => updateField('accessory', e.target.value)}
                                className="bg-transparent text-black font-sans text-sm focus:outline-none w-full p-0 resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                            <div className="bg-white rounded-xl w-full aspect-square border-2 border-[#3A3A3A]" aria-label="Accessory slot 1"></div>
                            <div className="bg-white rounded-xl w-full aspect-square border-2 border-[#3A3A3A]" aria-label="Accessory slot 2"></div>
                            <div className="bg-white rounded-xl w-full aspect-square border-2 border-[#3A3A3A]" aria-label="Accessory slot 3"></div>
                            <div className="bg-white rounded-xl w-full aspect-square border-2 border-[#3A3A3A]" aria-label="Accessory slot 4"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                 <div className="relative w-full bg-white rounded-xl px-2 pt-1.5 pb-1 border-2 border-[#3A3A3A] flex flex-col items-start">
                    <label htmlFor="type" className="font-pixel text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold mb-1">
                        TYPE:
                    </label>
                    <textarea
                        id="type"
                        value={pokemonData.type}
                        readOnly={true}
                        className="bg-transparent text-black font-sans text-sm focus:outline-none w-full p-0 resize-none cursor-default"
                        rows={2}
                    />
                </div>
                <div className="relative w-full bg-white rounded-xl px-2 pt-1.5 pb-1 border-2 border-[#3A3A3A] flex flex-col items-start">
                    <label htmlFor="weakness" className="font-pixel text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold mb-1">
                        WEAKNESS:
                    </label>
                    <textarea
                        id="weakness"
                        value={pokemonData.weakness}
                        onChange={(e) => updateField('weakness', e.target.value)}
                        className="bg-transparent text-black font-sans text-sm focus:outline-none w-full p-0 resize-none"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
};

export default MiddleColumn;