

import React from 'react';
import { PokemonData, Move } from '../../types';
import { PlusIcon } from '../Icons';
import MoveCard from './MoveCard';

interface MovesSectionProps {
    pokemonData: PokemonData;
    allMoves: Record<string, Move>;
    openMoveModal: (index: number) => void;
    handleClearMove: (index: number) => void;
    expandedMoves: Set<number>;
    onToggleMoveExpand: (index: number) => void;
}

const EmptyMoveSlot: React.FC<{ index: number; onAdd: (index: number) => void }> = ({ index, onAdd }) => (
    <button
        onClick={() => onAdd(index)}
        aria-label="Add a move"
        className="h-full w-full min-h-[125px] bg-black/10 border-4 border-dashed border-black/20 rounded-md flex flex-col items-center justify-center group hover:bg-black/20 hover:border-white/50 transition-colors duration-200"
    >
        <PlusIcon className="w-10 h-10 text-white/50 group-hover:text-white transition-colors" />
        <span className="mt-2 font-bold text-white/50 group-hover:text-white transition-colors">Add Move</span>
    </button>
);

const MemoizedEmptyMoveSlot = React.memo(EmptyMoveSlot);


const MovesSection: React.FC<MovesSectionProps> = ({ pokemonData, allMoves, openMoveModal, handleClearMove, expandedMoves, onToggleMoveExpand }) => {
    return (
        <div className="mt-4 bg-[#2DB3B3]/90 rounded-xl p-3 border-4 border-[#3A3A3A]">
            <h2 className="text-center text-lg text-white font-bold mb-3 tracking-wider font-pixel">MOVES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pokemonData.moves.map((moveId, index) => {
                    const move = moveId ? allMoves[moveId] : null;
                    return (
                        <div key={index}>
                            {move ? (
                                <MoveCard 
                                    move={move} 
                                    index={index} 
                                    onClear={handleClearMove} 
                                    isExpanded={expandedMoves.has(index)}
                                    onToggleExpand={() => onToggleMoveExpand(index)}
                                />
                            ) : (
                                <MemoizedEmptyMoveSlot index={index} onAdd={openMoveModal} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MovesSection;