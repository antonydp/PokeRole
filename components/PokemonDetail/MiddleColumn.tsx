import React from 'react';
import { PokemonData } from '../../src/types/index.js';
import { CircleRating } from '../shared/CircleRating.js';
import { PointsDisplay } from '../shared/Points.js';
import { SocialAttribute } from '../shared/SocialAttribute.js';
import NatureDisplay from '../shared/NatureDisplay.js';
import { SOCIAL_ATTRIBUTES } from '../../src/constants/gameConstants.js';

interface MiddleColumnProps {
    pokemonData: PokemonData;
    onDataChange: (field: keyof PokemonData, value: any) => void;
    onOpenNatureModal: () => void;
    points: {
        social: { spent: number; total: number; };
    };
    isSocialAttributePoolExhausted: boolean;
}

const MiddleColumn: React.FC<MiddleColumnProps> = ({ pokemonData, onDataChange, onOpenNatureModal, points, isSocialAttributePoolExhausted }) => {

    return (
        <div className="lg:col-span-5 flex flex-col gap-3 h-full">
            <div className="flex gap-2 flex-grow">
                <div className="flex flex-col gap-2">
                    <PointsDisplay label="Social Points" spent={points.social.spent} total={points.social.total} />
                    <div className="flex flex-col justify-around gap-2 flex-grow">
                        {SOCIAL_ATTRIBUTES.map(attr => (
                            <SocialAttribute
                                key={attr.name}
                                label={attr.name}
                                value={pokemonData[attr.field]}
                                max={5}
                                min={1}
                                color={attr.color}
                                onChange={(newValue) => onDataChange(attr.field, newValue)}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex-grow flex flex-col">
                    {/* Nature & Confidence */}
                    <NatureDisplay
                        nature={pokemonData.pokemonNature}
                        confidence={pokemonData.confidence}
                        onOpenNatureModal={onOpenNatureModal}
                    />
                    
                    {/* Growable Middle Section */}
                    <div className="flex gap-2 flex-grow my-2.5">
                        <div className="bg-[#2DB3B3] rounded-2xl p-2 w-1/2 border-4 border-[#3A3A3A] flex flex-col justify-around">
                            <div className="flex flex-col items-center">
                                <label className="text-white font-bold">HAPPINESS</label>
                                <CircleRating value={pokemonData.happiness} max={5} onChange={(v) => onDataChange('happiness', v)} circleClassName="w-3 h-3" className="mt-0.5"/>
                            </div>
                            <div className="flex flex-col items-center">
                                <label className="text-white font-bold">LOYALTY</label>
                                <CircleRating value={pokemonData.loyalty} max={5} onChange={(v) => onDataChange('loyalty', v)} circleClassName="w-3 h-3" className="mt-0.5" />
                            </div>
                        </div>
                        <div className="w-1/2 flex flex-col justify-around">
                            <div className="bg-[#C95649] rounded-2xl p-2 border-4 border-[#3A3A3A] space-y-2 flex-grow flex flex-col justify-center">
                                <div className="text-center">
                                    <label htmlFor="battles" className="font-primary uppercase text-white text-sm font-bold tracking-wider">
                                        Nº OF BATTLES:
                                    </label>
                                    <input
                                        id="battles"
                                        type="text"
                                        value={pokemonData.numberOfBattles}
                                        onChange={(e) => onDataChange('numberOfBattles', e.target.value)}
                                        className="w-full bg-white rounded-xl px-2 py-1.5 mt-1 text-black text-center text-sm font-sans focus:outline-none border-2 border-transparent focus:border-[#3A3A3A]"
                                    />
                                </div>
                                <div className="text-center">
                                    <label htmlFor="victories" className="font-primary uppercase text-white text-sm font-bold tracking-wider">
                                        VICTORIES:
                                    </label>
                                    <input
                                        id="victories"
                                        type="text"
                                        value={pokemonData.victories}
                                        onChange={(e) => onDataChange('victories', e.target.value)}
                                        className="w-full bg-white rounded-xl px-2 py-1.5 mt-1 text-black text-center text-sm font-sans focus:outline-none border-2 border-transparent focus:border-[#3A3A3A]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accessory Section */}
                    <div>
                        <div className="relative w-full bg-white rounded-xl px-2 pt-1.5 pb-1 border-2 border-[#3A3A3A] flex flex-col items-start">
                            <label htmlFor="accessory" className="font-primary text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold mb-1">
                                ACCESORY:
                            </label>
                            <textarea
                                id="accessory"
                                value={pokemonData.accessory}
                                onChange={(e) => onDataChange('accessory', e.target.value)}
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
                    <label htmlFor="type" className="font-primary text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold mb-1">
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
                    <label htmlFor="weakness" className="font-primary text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold mb-1">
                        WEAKNESS:
                    </label>
                    <textarea
                        id="weakness"
                        value={pokemonData.weakness}
                        readOnly={true}
                        className="bg-transparent text-black font-sans text-sm focus:outline-none w-full p-0 resize-none cursor-default"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
};

export default MiddleColumn;