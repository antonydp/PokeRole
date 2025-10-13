

import React from 'react';
import { PokemonData, Move } from '../../src/types/index.js';
import { PlusIcon } from '../Icons.js';
import MoveCard from './MoveCard.js';
import { usePokemonSheetContext } from '../../src/context/PokemonSheetContext.js';

const EmptyMoveSlot: React.FC<{ index: number; onAdd: (index: number) => void }> = ({ index, onAdd }) => (
    <button
        onClick={() => onAdd(index)}
        aria-label="Add a move"
        className="h-full w-full min-h-[100px] bg-black/10 border-2 border-dashed border-black/20 rounded-md flex flex-col items-center justify-center group hover:bg-black/20 hover:border-white/50 transition-colors duration-200"
    >
        <PlusIcon className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
        <span className="mt-1.5 font-bold text-white/50 group-hover:text-white transition-colors text-sm">Add Move</span>
    </button>
);

const MemoizedEmptyMoveSlot = React.memo(EmptyMoveSlot);

const MovesSection: React.FC = () => {
    const {
        pokemonData,
        allMoves,
        openMoveModal,
        handleClearMove,
        expandedMoves,
        handleToggleMoveExpand
    } = usePokemonSheetContext();
    return (
        <div className="mt-2 bg-[#2DB3B3]/90 rounded-lg p-2 border-2 border-[#3A3A3A]">
            <h2 className="text-center text-base text-white font-bold mb-2 tracking-wider font-primary">MOVES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pokemonData.moves.map((moveId, index) => {
                    const move = moveId ? allMoves[moveId] : null;
                    return (
                        <div key={index}>
                            {move ? (
                                <MoveCard
                                    move={move}
                                    pokemonStats={pokemonData}
                                    index={index}
                                    onClear={handleClearMove}
                                    isExpanded={expandedMoves.has(index)}
                                    onToggleExpand={() => handleToggleMoveExpand(index)}
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
