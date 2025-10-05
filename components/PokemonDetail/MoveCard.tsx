

import React from 'react';
import { Move, AddedEffects, PokemonData } from '../../src/types/index.js';
import { CloseIcon, DiceIcon, ChevronDownIcon } from '../Icons.js';
import TypeBadge from '../TypeBadge.js';
import { calculateMoveValue } from '../../src/logic/formulas.js';

interface MoveCardProps {
    move: Move;
    pokemonStats: PokemonData;
    index: number;
    onClear: (index: number) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const TriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 10 10" fill="currentColor">
        <path d="M 2 2 L 8 5 L 2 8 Z" />
    </svg>
);


const AddedEffectsDisplay: React.FC<{ effects: AddedEffects; effectString: string }> = ({ effects, effectString }) => {
    if (!effects) {
        if (!effectString) return null;
        return <p className="text-xs">{effectString}</p>;
    }
    const chanceEffects: string[] = [];
    const guaranteedEffects: string[] = [];
    let diceCount: number | undefined;

    // Process Stat Changes
    effects.StatChanges?.forEach(sc => {
        const verb = sc.Stages > 0 ? 'Increase' : 'Reduce';
        const text = `${verb} ${sc.Stats.join(', ')} (${sc.Affects}) by ${Math.abs(sc.Stages)} stage(s)`;
        if (sc.ChanceDice) {
            diceCount = sc.ChanceDice;
            chanceEffects.push(text);
        } else {
            guaranteedEffects.push(text);
        }
    });
    
    // Process Status Effects
    effects.InflictStatus?.forEach(is => {
        const text = `Inflict ${is.Status} (${is.Affects})`;
        if (is.ChanceDice) {
            diceCount = is.ChanceDice;
            chanceEffects.push(text);
        } else {
            guaranteedEffects.push(text);
        }
    });

    if (effects.TerrainEffect) {
        guaranteedEffects.push(`Activate ${effects.TerrainEffect} Weather.`);
    }

    const hasChanceEffects = diceCount && chanceEffects.length > 0;
    const hasGuaranteedEffects = guaranteedEffects.length > 0;

    // If no structured effects, just show the raw string from the Effect property.
    if (!hasChanceEffects && !hasGuaranteedEffects) {
        return <p className="text-xs">{effectString}</p>
    }

    return (
        <div>
            {hasChanceEffects && (
                 <div className="flex items-start gap-2 mb-2">
                    <div className="w-10 h-10 flex-shrink-0">
                        <DiceIcon className="w-full h-full" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm font-bold uppercase">
                            {diceCount} Chance Dice to
                        </p>
                        <ul className="text-sm">
                            {chanceEffects.map((text, i) => (
                                <li key={i} className="flex"><span className="mr-1.5 mt-1">•</span><span>{text}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {hasGuaranteedEffects && (
                <div>
                    <p className="text-sm font-bold uppercase">Effects</p>
                    <ul className="text-sm">
                        {guaranteedEffects.map((text, i) => (
                           <li key={i} className="flex"><span className="mr-1.5 mt-1">•</span><span>{text}</span></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const MoveCard: React.FC<MoveCardProps> = ({ move, pokemonStats, index, onClear, isExpanded, onToggleExpand }) => {
    const damageString = calculateMoveValue([move.Damage1, move.Power > 0 ? move.Power : null].filter(Boolean).join(' + ') || '--', pokemonStats);
    const accuracyString = calculateMoveValue([move.Accuracy1, move.Accuracy2].filter(Boolean).join(' + ') || '--', pokemonStats);
    const hasAddedEffects = move.AddedEffects && Object.keys(move.AddedEffects).length > 0;

    return (
        <div className="relative bg-stone-200 text-stone-900 rounded-md border-4 border-stone-900 font-sans shadow-lg flex flex-col animate-fade-in">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClear(index);
                }}
                className="absolute top-1 right-1 z-10 p-1 rounded-full bg-stone-400/50 hover:bg-poke-red hover:text-white transition-colors"
                aria-label="Clear move"
            >
                <CloseIcon className="w-4 h-4" />
            </button>
            
            <button
                onClick={onToggleExpand}
                className="w-full text-left p-2 focus:outline-none focus:ring-2 focus:ring-poke-blue focus:ring-inset rounded-t-sm"
                aria-expanded={isExpanded}
                aria-controls={`move-details-${index}`}
            >
                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-stone-900 pb-1 mb-2">
                    <div className="flex items-center gap-2 pr-2">
                        <TriangleIcon className="w-3 h-3 text-stone-900 flex-shrink-0 mt-1" />
                        <h3 className="font-bold text-lg uppercase tracking-tight leading-tight">{move.Name}</h3>
                    </div>
                    <div className="flex border-2 border-stone-900 text-center text-sm flex-shrink-0 bg-stone-100">
                        <div className="px-2 py-0.5 border-r-2 border-stone-900">
                            <p className="text-[10px] font-bold uppercase">Power</p>
                            <p className="font-semibold">{move.Power > 0 ? move.Power : '--'}</p>
                        </div>
                        <div className="px-2 py-0.5">
                            <p className="text-[10px] font-bold uppercase">Category</p>
                            <p className="font-semibold text-xs capitalize">{move.Category}</p>
                        </div>
                    </div>
                </div>

                {/* Always visible Body part */}
                <div className="space-y-1 text-sm flex justify-between items-center">
                    <div className="flex items-center"><span className="font-bold uppercase w-24 flex-shrink-0">TYPE:</span> <TypeBadge type={move.Type} /></div>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform text-stone-600 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {/* Collapsible Content */}
            <div 
                id={`move-details-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-2 pb-2">
                    <div className="space-y-1 text-sm flex-grow">
                        <div className="flex items-start"><span className="font-bold uppercase w-24 flex-shrink-0">ACCURACY:</span> <span>{accuracyString}</span></div>
                        <div className="flex items-start"><span className="font-bold uppercase w-24 flex-shrink-0">DAMAGE:</span> <span>{damageString}</span></div>
                    </div>

                    {(move.Effect || hasAddedEffects) && (
                        <div className="mt-2 pt-2 border-t-2 border-stone-800/50">
                            <AddedEffectsDisplay effects={move.AddedEffects} effectString={move.Effect} />
                        </div>
                    )}
                    
                    {move.Description && (
                        <>
                            <hr className="border-t-2 border-stone-800/50 my-2" />
                            <p className="text-xs italic pb-1">{move.Description}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(MoveCard);