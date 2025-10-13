import React from 'react';
import { PotionBottle } from '../../src/types/index.js';

interface PotionManagerProps {
    potions: PotionBottle[];
    onUpdate: (potions: PotionBottle[]) => void;
}

type PotionType = 'potion' | 'superPotion' | 'hyperPotion';

const POTION_CONFIG: Record<PotionType, { name: string; units: number }> = {
    potion: { name: 'Potion', units: 2 },
    superPotion: { name: 'Super Potion', units: 4 },
    hyperPotion: { name: 'Hyper Potion', units: 14 },
};

const UnitSquares: React.FC<{ current: number; max: number }> = React.memo(({ current, max }) => {
    const gridClass = max > 8 ? 'grid-cols-7' : 'grid-cols-4';
    return (
        <div className={`grid ${gridClass} gap-0.5`}>
            {Array.from({ length: max }).map((_, i) => (
                <div
                    key={i}
                    className={`w-2.5 h-2.5 border border-stone-500 rounded-sm shadow-inner ${i < current ? 'bg-[#f5f1de]' : 'bg-stone-900/40'}`}
                ></div>
            ))}
        </div>
    );
});

const PotionCard: React.FC<{
    bottle: PotionBottle;
    onUnitChange: (id: string, newUnits: number) => void;
    onDiscard: (id: string) => void;
}> = ({ bottle, onUnitChange, onDiscard }) => {
    const config = POTION_CONFIG[bottle.type];

    const handleDecrement = () => {
        if (bottle.currentUnits > 0) {
            onUnitChange(bottle.id, bottle.currentUnits - 1);
        }
    };
    const handleIncrement = () => {
        if (bottle.currentUnits < bottle.maxUnits) {
            onUnitChange(bottle.id, bottle.currentUnits + 1);
        }
    };

    return (
        <div className="bg-stone-800/50 p-1.5 rounded-lg flex items-center gap-2">
            <div className="flex-grow">
                <p className="font-bold text-xs text-[#f5f1de]">{config.name}</p>
                <div className="mt-1">
                    <UnitSquares current={bottle.currentUnits} max={bottle.maxUnits} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-1">
                    <button onClick={handleDecrement} className="w-5 h-5 bg-poke-red text-white rounded-md flex items-center justify-center font-bold text-base hover:bg-red-700 transition-colors disabled:bg-slate-500" disabled={bottle.currentUnits === 0}>-</button>
                    <span className="w-10 text-center font-bold font-sans text-sm bg-[#f5f1de] text-stone-900 rounded-md">{bottle.currentUnits}/{bottle.maxUnits}</span>
                    <button onClick={handleIncrement} className="w-5 h-5 bg-green-600 text-white rounded-md flex items-center justify-center font-bold text-base hover:bg-green-700 transition-colors disabled:bg-slate-500" disabled={bottle.currentUnits === bottle.maxUnits}>+</button>
                </div>
            </div>
             <button onClick={() => onDiscard(bottle.id)} className="p-1 bg-stone-600 text-white rounded-md hover:bg-stone-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    )
}

const PotionManager: React.FC<PotionManagerProps> = ({ potions, onUpdate }) => {
    const totalUnits = React.useMemo(() => {
        return (potions || []).reduce((sum, bottle) => sum + bottle.currentUnits, 0);
    }, [potions]);

    const handleAddPotion = (type: PotionType) => {
        const config = POTION_CONFIG[type];
        const newBottle: PotionBottle = {
            id: `${type}-${Date.now()}-${Math.random()}`,
            type,
            maxUnits: config.units,
            currentUnits: config.units,
        };
        onUpdate([...(potions || []), newBottle]);
    };

    const handleUnitChange = (id: string, newUnits: number) => {
        const newPotions = (potions || []).map(p => p.id === id ? { ...p, currentUnits: newUnits } : p);
        onUpdate(newPotions);
    };

    const handleDiscard = (id: string) => {
        onUpdate((potions || []).filter(p => p.id !== id));
    };

    return (
        <div 
            className="bg-[#6b645d] rounded-lg p-2 border-2 border-[#3a3a3a] font-primary text-white shadow-inner" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")` }}
        >
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs tracking-wider" style={{ textShadow: '1px 1px 1px #3a3a3a' }}>Potions Pocket</h3>
                 <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-300">Total Units</span>
                    <div className="w-12 h-6 bg-poke-yellow rounded-md flex items-center justify-center text-stone-900 font-bold text-base border-2 border-[#3a3a3a] shadow-md">
                        <span style={{ textShadow: '1px 1px 0 #fff' }}>{totalUnits}</span>
                    </div>
                </div>
            </div>
            
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {(potions || []).length > 0 ? (potions || []).map(bottle => (
                    <PotionCard key={bottle.id} bottle={bottle} onUnitChange={handleUnitChange} onDiscard={handleDiscard} />
                )) : (
                    <p className="text-center text-xs text-stone-300 py-3">No potions in pocket.</p>
                )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t-2 border-stone-800/50">
                <button onClick={() => handleAddPotion('potion')} className="text-[10px] bg-stone-700 py-0.5 rounded-md hover:bg-stone-600 transition-colors">+ Potion</button>
                <button onClick={() => handleAddPotion('superPotion')} className="text-[10px] bg-stone-700 py-0.5 rounded-md hover:bg-stone-600 transition-colors">+ Super</button>
                <button onClick={() => handleAddPotion('hyperPotion')} className="text-[10px] bg-stone-700 py-0.5 rounded-md hover:bg-stone-600 transition-colors">+ Hyper</button>
            </div>
            
            <p className="text-center text-[10px] leading-tight text-stone-300 mt-2" style={{ textShadow: '1px 1px 1px #3a3a3a' }}>
                1 Unit = 1 HP | 2 Units = 1 Lethal HP<br/>
                Max 3 HP healed per round in-battle.
            </p>
        </div>
    );
};

export default PotionManager;
