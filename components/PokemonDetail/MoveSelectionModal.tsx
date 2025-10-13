import React, { useMemo, useState, useEffect } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { Move, Rank } from '../../src/types/index.js';
import { calculateMaxMoves } from '../../src/logic/core.js';
import TypeBadge from '../TypeBadge.js';
import { parseMoveRank } from '../../src/logic/formulas.js';
import { RANKS } from '../../src/constants/gameConstants.js';

export const MoveSelectionModal: React.FC = () => {
    const evolutionState = useUIStore(state => state.evolutionState);
    const closeEvolutionModal = useUIStore(state => state.closeEvolutionModal);
    const updateSheetData = useSessionStore(state => state.updateSheetData);
    const team = useSessionStore(state => state.team);
    const allMoves = useGameDataStore(state => state.allMoves);

    // Bug Fix: Directly access the evolving member to avoid stale state from selectedTeamMember()
    const teamMember = useMemo(() => {
        if (!evolutionState.isOpen) return null;
        return team.find(m => m.instanceID === evolutionState.teamMemberInstanceId);
    }, [team, evolutionState]);
    
    const maxMoves = useMemo(() => teamMember ? calculateMaxMoves(teamMember.sheetData.insight) : 0, [teamMember]);
    const [selectedMoves, setSelectedMoves] = useState<(string | null)[]>([]);

    const learnableMoves = useMemo(() => {
        if (!teamMember) return [];
        const pokemonRank = teamMember.sheetData.rank as Rank;
        const pokemonRankIndex = RANKS.indexOf(pokemonRank);

        const learnsetForRank = teamMember.pokedexData.Moves
            .filter(moveInLearnset => {
                const moveRank = parseMoveRank(moveInLearnset.Learned);
                if (!moveRank) return false;
                const moveRankIndex = RANKS.indexOf(moveRank);
                return moveRankIndex !== -1 && moveRankIndex <= pokemonRankIndex;
            })
            .map(m => m.Name);

        const learnset = new Set(learnsetForRank);
        return Object.values(allMoves).filter((m: Move) => learnset.has(m.Name));
    }, [teamMember, allMoves]);

    useEffect(() => {
        if (!teamMember || !evolutionState.isOpen || !evolutionState.oldMoves) {
            setSelectedMoves(Array(maxMoves).fill(null));
            return;
        };

        const oldMoveNames = evolutionState.oldMoves
            .map(id => id ? allMoves[id]?.Name : null)
            .filter(Boolean);
        
        const learnableMoveNames = new Set(learnableMoves.map(m => m.Name));

        const preSelected = learnableMoves
            .filter(move => oldMoveNames.includes(move.Name) && learnableMoveNames.has(move.Name))
            .map(move => move._id);
        
        // Pad with nulls up to maxMoves
        const initialSelection = [...preSelected];
        while (initialSelection.length < maxMoves) {
            initialSelection.push(null);
        }

        setSelectedMoves(initialSelection.slice(0, maxMoves));

    }, [teamMember, learnableMoves, maxMoves, evolutionState]);


    const handleToggleMove = (moveId: string) => {
        setSelectedMoves(prev => {
            const newSelection = [...prev];
            const existingIndex = newSelection.indexOf(moveId);

            if (existingIndex > -1) {
                // Deselect move
                newSelection[existingIndex] = null;
            } else {
                // Select move in first empty slot
                const emptySlotIndex = newSelection.indexOf(null);
                if (emptySlotIndex > -1) {
                    newSelection[emptySlotIndex] = moveId;
                }
            }
            return newSelection;
        });
    };

    const handleConfirm = () => {
        if (!teamMember) return;
        updateSheetData(teamMember.instanceID, (prevSheet) => ({
            ...prevSheet,
            moves: selectedMoves,
        }));
        closeEvolutionModal();
    };

    if (!teamMember) return null;

    return (
        <div className="p-4 bg-slate-800 text-white rounded-lg w-full max-w-xl max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-primary text-poke-yellow mb-2 text-center">Select New Moveset</h2>
            <p className="text-center text-gray-400 mb-3 text-sm">Choose up to {maxMoves} moves for {teamMember.pokedexData.Name}. Moves from the previous form are lost.</p>
            <div className="grid grid-cols-2 gap-3 flex-grow overflow-hidden">
                <div className="flex flex-col space-y-1.5 pr-2 overflow-y-auto">
                    <h3 className="font-bold text-base text-poke-yellow">Available Moves</h3>
                    {learnableMoves.map(move => {
                        const isSelected = selectedMoves.includes(move._id);
                        return (
                            <button key={move._id} onClick={() => handleToggleMove(move._id)} className={`p-2 rounded-md text-left transition-colors ${isSelected ? 'bg-poke-blue ring-1 ring-poke-yellow' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                <p className="font-bold text-sm">{move.Name}</p>
                                <p className="text-xs text-gray-300 leading-tight">{move.Effect}</p>
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <h3 className="font-bold text-base text-poke-yellow">Selected Moves ({selectedMoves.filter(m => m).length}/{maxMoves})</h3>
                    {selectedMoves.map((moveId, index) => {
                         const move = moveId ? allMoves[moveId] : null;
                         return (
                            <div key={index} className="p-2 bg-slate-900 border border-slate-700 rounded-md min-h-[48px] flex items-center justify-between">
                               {move ? <p className="font-bold text-sm">{move.Name}</p> : <p className="text-gray-500 text-sm">Empty Slot</p>}
                               {move && <TypeBadge type={move.Type} />}
                            </div>
                         );
                    })}
                </div>
            </div>
             <div className="mt-3 flex justify-end pt-3 border-t border-slate-700">
                <button onClick={handleConfirm} className="px-4 py-1.5 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 text-sm">Confirm Moveset</button>
            </div>
        </div>
    );
};
