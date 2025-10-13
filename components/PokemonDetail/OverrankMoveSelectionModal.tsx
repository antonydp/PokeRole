import React, { useMemo, useState } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useActivePokemon } from '../../src/hooks/useActivePokemon.js';
import { Rank, Move } from '../../src/types/index.js';
import { RANK_ORDER } from '../../src/logic/core.js';
import { parseMoveRank } from '../../src/logic/formulas.js';
import TypeBadge from '../TypeBadge.js';

export const OverrankMoveSelectionModal: React.FC = () => {
    const { evolutionState, closeEvolutionModal } = useUIStore();
    const { applyOverrank } = useSessionStore();
    const { allMoves } = useGameDataStore();
    const { teamMember } = useActivePokemon();
    const [searchTerm, setSearchTerm] = useState('');

    const availableMoves = useMemo(() => {
        if (!teamMember) return [];
        const currentRank = teamMember.sheetData.rank as Rank;
        const currentRankOrder = RANK_ORDER[currentRank];
        
        // Find all moves that are one rank higher
        return Object.values(allMoves).filter((move: Move) => {
            const learnset = teamMember.pokedexData.Moves.find(m => m.Name.toLowerCase() === move.Name.toLowerCase());
            if (!learnset) return false;
            
            const moveRank = parseMoveRank(learnset.Learned);
            if (!moveRank) return false;
            const moveRankOrder = RANK_ORDER[moveRank];

            const nameMatch = move.Name.toLowerCase().includes(searchTerm.toLowerCase());
            
            return moveRankOrder === currentRankOrder + 1 && nameMatch;
        });
    }, [teamMember, allMoves, searchTerm]);

    if (!teamMember || !evolutionState.isOpen) return null;

    const handleSelectMove = (move: Move) => {
        if (window.confirm(`Are you sure you want to learn ${move.Name}? This will stop the evolution and reset your victory count.`)) {
            applyOverrank(teamMember.instanceID, move._id);
        }
    };
    
    return (
        <div className="p-4 bg-slate-800 text-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-primary text-poke-yellow mb-2 text-center">Select an Overrank Move</h2>
            <p className="text-center text-gray-400 mb-3 text-sm">Choose one move from the next rank to learn.</p>
            <input
                type="text"
                placeholder="Search moves..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-1.5 mb-3 bg-slate-900 border border-slate-600 rounded-md text-sm"
            />
            <div className="flex-grow overflow-y-auto pr-2 space-y-1.5">
                {availableMoves.length > 0 ? availableMoves.map(move => (
                    <button key={move._id} onClick={() => handleSelectMove(move)} className="w-full flex justify-between items-center p-2 bg-slate-700 rounded-md hover:bg-poke-blue transition-colors text-left">
                        <div>
                            <p className="font-bold text-white text-sm">{move.Name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{move.Effect}</p>
                        </div>
                        <TypeBadge type={move.Type} />
                    </button>
                )) : <p className="text-gray-400 text-center text-sm">No overrank moves available for this Pokémon.</p>}
            </div>
        </div>
    );
};
