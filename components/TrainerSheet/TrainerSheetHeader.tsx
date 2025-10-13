import React, { useState } from 'react';
import { TrainerData, Rank } from '../../src/types/index.js';
import { AGE_GROUPS, RANKS, AgeGroup } from '../../src/constants/gameConstants.js';
import { ChevronDownIcon } from '../Icons.js';
import NatureDisplay from '../shared/NatureDisplay.js';
import { StatDisplay } from '../shared/StatDisplay.js';
import SpriteModal from './SpriteModal.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';

interface TrainerSheetHeaderProps {
    trainerData: TrainerData;
    onDataChange: (field: keyof TrainerData, value: any) => void;
    onOpenNatureModal: () => void;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const InfoField: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder: string; className?: string }> = ({ label, value, onChange, placeholder, className }) => (
    <div className={`bg-black/20 px-2 py-1 rounded-md border border-white/10 flex flex-col justify-center h-full ${className}`}>
        <label className="text-[9px] font-bold text-white/60 uppercase tracking-wider">{label}</label>
        <input
            type="text"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-white font-primary text-sm p-0 focus:outline-none"
        />
    </div>
);

const MoneyDisplay: React.FC<{ value: string; onChange: (value: string) => void; className?: string }> = ({ value, onChange, className }) => (
    <div className={`bg-black/20 px-2 py-1 rounded-md border border-white/10 h-full flex flex-col justify-center ${className}`}>
        <label className="text-green-300/70 text-[9px] font-bold uppercase tracking-wider">Poké Dollars</label>
        <div className="flex items-center gap-1">
            <span className="text-green-300 font-sans text-base font-bold">₽</span>
            <input
                type="text"
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-white font-sans text-sm font-bold p-0 text-right focus:outline-none"
                aria-label="Money"
            />
        </div>
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; className?: string }> = ({ label, value, onChange, children, className }) => (
    <div className={`bg-black/20 px-2 py-1 rounded-md border border-white/10 h-full flex flex-col justify-center ${className}`}>
        <label className="text-[9px] font-bold text-white/60 uppercase tracking-wider">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-transparent text-white font-primary text-sm p-0 focus:outline-none appearance-none pr-4 cursor-pointer"
            >
                {children}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-white/50 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    </div>
);

const TrainerSheetHeader: React.FC<TrainerSheetHeaderProps> = ({ trainerData, onDataChange, onOpenNatureModal }) => {
    const [isSpriteModalOpen, setIsSpriteModalOpen] = useState(false);
    const allSprites = useGameDataStore(state => state.allSprites);

    const handleSelectSprite = (spriteUrl: string) => {
        onDataChange('imageUrl', spriteUrl);
        setIsSpriteModalOpen(false);
    };

    return (
        <>
            <div className="bg-red-900/70 p-2 rounded-xl border border-red-800/60 shadow-2xl font-primary relative mb-2 backdrop-blur-sm">
                <div className="grid grid-cols-[auto,1fr] gap-2">
                {/* Image Column */}
                <div
                    className="w-24 h-24 bg-gray-700/50 rounded-lg border-2 border-white/20 shadow-lg flex items-center justify-center z-10 overflow-hidden cursor-pointer flex-shrink-0 hover:border-poke-yellow transition-colors group"
                    onClick={() => setIsSpriteModalOpen(true)}
                    title="Click to change image"
                >
                    {trainerData.imageUrl ? (
                        <img src={trainerData.imageUrl} alt={trainerData.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <UserIcon className="h-12 w-12 text-white/40 group-hover:text-poke-yellow transition-colors" />
                    )}
                </div>

                {/* Info Column */}
                <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
                    {/* Row 1 */}
                    <InfoField className="col-span-2" label="Trainer Name" value={trainerData.name} onChange={v => onDataChange('name', v)} placeholder="Enter Name" />
                    <div className="bg-black/20 p-2 rounded-md border border-white/10 flex items-center justify-around">
                        <StatDisplay label="HP" currentValue={trainerData.currentHP ?? (4 + trainerData.vitality)} maxValue={4 + trainerData.vitality} onValueChange={v => onDataChange('currentHP', v)} variant="inline" circleColorClass="bg-green-400" />
                        <div className="w-px h-4/5 bg-white/10"></div>
                        <StatDisplay label="Will" currentValue={trainerData.currentWill ?? (2 + trainerData.insight)} maxValue={2 + trainerData.insight} onValueChange={v => onDataChange('currentWill', v)} variant="inline" circleColorClass="bg-sky-400" />
                    </div>

                    {/* Row 2 */}
                    <InfoField label="Player" value={trainerData.playerName} onChange={v => onDataChange('playerName', v)} placeholder="Satoshi"/>
                    <InfoField label="Concept" value={trainerData.concept} onChange={v => onDataChange('concept', v)} placeholder="To be the very best"/>
                    <InfoField label="Hometown" value={trainerData.hometown} onChange={v => onDataChange('hometown', v)} placeholder="Pallet Town"/>
                </div>

                {/* Bottom Row on main grid */}
                <div className="col-span-2 grid grid-cols-5 gap-1.5 mt-0.5">
                    <MoneyDisplay className="col-span-1" value={trainerData.money} onChange={v => onDataChange('money', v)} />
                    <div className="col-span-2 bg-black/20 rounded-md border border-white/10">
                        <NatureDisplay
                            nature={trainerData.nature}
                            confidence={trainerData.confidence}
                            onOpenNatureModal={onOpenNatureModal}
                            variant="compact"
                        />
                    </div>
                    <SelectField label="Age" value={trainerData.age} onChange={v => onDataChange('age', v as AgeGroup)}>
                        {Object.keys(AGE_GROUPS).map(ageGroup => (
                            <option key={ageGroup} value={ageGroup} className="bg-stone-800">{ageGroup}</option>
                        ))}
                    </SelectField>
                    <SelectField label="Rank" value={trainerData.trainerRank} onChange={v => onDataChange('trainerRank', v as Rank)}>
                        {RANKS.map(rank => <option key={rank} value={rank} className="bg-slate-800 font-sans">{rank}</option>)}
                    </SelectField>
                </div>
            </div>
        </div>
        <SpriteModal
            isOpen={isSpriteModalOpen}
            onClose={() => setIsSpriteModalOpen(false)}
            allSprites={allSprites}
            onSelectSprite={handleSelectSprite}
        />
        </>
    );
};

export default TrainerSheetHeader;
