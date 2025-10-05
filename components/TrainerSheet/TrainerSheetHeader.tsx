import React from 'react';
import { TrainerData, Rank } from '../../src/types/index.js';
import { RANKS } from '../../src/constants/gameConstants.js';
import { ChevronDownIcon } from '../Icons.js';
import NatureDisplay from '../shared/NatureDisplay.js';

interface TrainerSheetHeaderProps {
    trainerData: TrainerData;
    onDataChange: (field: keyof TrainerData, value: any) => void;
    onOpenNatureModal: () => void;
}

const InfoField: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
    <div className="flex-1 min-w-[120px]">
        <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{label}</label>
        <input
            type="text"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white font-primary text-lg p-0 focus:outline-none border-b border-transparent focus:border-poke-yellow transition-colors"
        />
    </div>
);

const MoneyDisplay: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
    <div className="bg-black/40 p-2 rounded-lg border-2 border-black/60 shadow-inner h-full flex flex-col justify-center">
        <label className="text-green-300/80 text-[10px] font-bold uppercase tracking-widest">Poké Dollars</label>
        <div className="flex items-center gap-2 mt-0.5">
            <span className="text-green-300 font-sans text-2xl font-bold">₽</span>
            <input
                type="text"
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-white font-sans text-xl font-bold p-0 text-right focus:outline-none"
                aria-label="Money"
            />
        </div>
    </div>
);

const StatCalculationDisplay: React.FC<{ label: string; base: number; attributeValue: number; result: number }> = ({ label, base, attributeValue, result }) => (
    <div className="flex items-center justify-between bg-black/20 px-2 py-1 rounded">
        <span className="font-bold text-sm text-cyan-200/80">{label}:</span>
        <div className="font-sans font-bold text-base text-white text-right">
            <span>{base}</span>
            <span className="text-cyan-300/80 mx-1">+</span>
            <span title="From Attribute">{attributeValue}</span>
            <span className="text-cyan-300/80 mx-1">=</span>
            <span className="bg-white/10 px-1.5 rounded" aria-live="polite">{result}</span>
        </div>
    </div>
);

const TrainerSheetHeader: React.FC<TrainerSheetHeaderProps> = ({ trainerData, onDataChange, onOpenNatureModal }) => {
    const handleImageClick = () => {
        const newUrl = window.prompt("Enter the URL for the trainer's image:", trainerData.imageUrl ?? '');
        if (newUrl !== null) {
            onDataChange('imageUrl', newUrl);
        }
    };

    return (
        <div className="bg-gradient-to-b from-stone-800 to-stone-900 p-1.5 rounded-xl border-2 border-stone-900 shadow-2xl font-primary relative mb-4">
            <div
                className="absolute top-1/2 -translate-y-1/2 left-4 w-28 h-28 bg-gray-700 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 overflow-hidden cursor-pointer"
                onClick={handleImageClick}
                title="Click to change image"
            >
                {trainerData.imageUrl ? (
                    <img src={trainerData.imageUrl} alt={trainerData.name} className="w-full h-full object-cover" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/50" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            
            <div className="bg-[#B2483D] p-3 rounded-lg border-2 border-[#3A3A3A] grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 relative md:pl-36">
                {/* Column 1: ID Panel */}
                <div className="flex flex-col justify-between h-full pt-12 md:pt-0">
                     <input
                        type="text" value={trainerData.name} onChange={e => onDataChange('name', e.target.value)}
                        placeholder="Trainer Name"
                        className="w-full bg-transparent p-0 pb-1 text-3xl font-primary text-white border-b-2 border-white/30 focus:ring-0 focus:outline-none focus:border-poke-yellow placeholder:text-white/50"
                        aria-label="Trainer Name"
                    />
                    <div className="grid grid-cols-2 gap-x-4 mt-2">
                         <InfoField label="Player" value={trainerData.playerName} onChange={v => onDataChange('playerName', v)} placeholder="Satoshi"/>
                         <InfoField label="Concept" value={trainerData.concept} onChange={v => onDataChange('concept', v)} placeholder="To be the very best"/>
                    </div>
                     <div className="grid grid-cols-2 gap-x-4 mt-2">
                        <InfoField label="Hometown" value={trainerData.hometown} onChange={v => onDataChange('hometown', v)} placeholder="Pallet Town"/>
                        <InfoField label="Age" value={trainerData.age} onChange={v => onDataChange('age', v)} placeholder="10"/>
                    </div>
                </div>

                {/* Column 2: Vitals Panel */}
                <div className="flex flex-col justify-between h-full space-y-2">
                    <div className="flex items-stretch gap-2">
                        <div className="flex-1">
                             <div className="bg-gradient-to-b from-slate-700 to-slate-800 p-2 rounded-lg border-2 border-slate-600 shadow-inner h-full flex flex-col justify-center">
                                <label htmlFor="trainerRankSelect" className="text-poke-yellow/80 text-[10px] font-bold uppercase tracking-widest">Trainer Rank</label>
                                <div className="flex items-center gap-2 mt-0.5 relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-poke-yellow flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <select
                                        id="trainerRankSelect"
                                        value={trainerData.trainerRank}
                                        onChange={e => onDataChange('trainerRank', e.target.value as Rank)}
                                        className="w-full bg-transparent text-white font-sans text-lg p-0 focus:outline-none appearance-none cursor-pointer"
                                        aria-label="Trainer Rank"
                                    >
                                        {RANKS.map(rank => <option key={rank} value={rank} className="bg-slate-800 font-sans">{rank}</option>)}
                                    </select>
                                    <ChevronDownIcon className="w-4 h-4 text-white/50 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <MoneyDisplay value={trainerData.money} onChange={v => onDataChange('money', v)} />
                        </div>
                    </div>
                    <NatureDisplay
                        nature={trainerData.nature}
                        confidence={trainerData.confidence}
                        onOpenNatureModal={onOpenNatureModal}
                    />
                </div>
                
                {/* Column 3: Live Stats Screen */}
                <div className="bg-black/40 rounded-lg p-3 border-2 border-black/50 shadow-inner flex flex-col justify-between h-full">
                    <div>
                        <label className="text-cyan-200/70 text-[9px] font-bold uppercase tracking-widest text-center block">Pokédex</label>
                        <div className="flex items-baseline justify-center gap-1 text-white">
                            <div className="text-center">
                                <input 
                                    type="text"
                                    value={trainerData.pokedexCaught}
                                    onChange={e => onDataChange('pokedexCaught', e.target.value)}
                                    className="bg-transparent font-sans text-2xl font-bold text-center w-full focus:outline-none"
                                    aria-label="Pokémon Caught"
                                />
                                <span className="text-xs text-white/60 block -mt-1">Caught</span>
                            </div>
                            <span className="text-2xl text-white/40">/</span>
                            <div className="text-center">
                                <input 
                                    type="text"
                                    value={trainerData.pokedexSeen}
                                    onChange={e => onDataChange('pokedexSeen', e.target.value)}
                                    className="bg-transparent font-sans text-2xl font-bold text-center w-full focus:outline-none"
                                    aria-label="Pokémon Seen"
                                />
                                <span className="text-xs text-white/60 block -mt-1">Seen</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 mt-2">
                        <StatCalculationDisplay label="HP" base={4} attributeValue={trainerData.vitality} result={4 + trainerData.vitality} />
                        <StatCalculationDisplay label="Will" base={2} attributeValue={trainerData.insight} result={2 + trainerData.insight} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerSheetHeader;