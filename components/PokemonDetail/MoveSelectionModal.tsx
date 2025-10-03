import React, { useMemo, useState } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { Move } from '../../src/types/index.js';
import { calculateMaxMoves } from '../../src/logic/core.js';
import TypeBadge from '../TypeBadge.js';

export const MoveSelectionModal: React.FC = () => {
    const { setEvolutionStep } = useUIStore();
    const { updateSheetData, selectedTeamMember } = useSessionStore();
    const { allMoves } = useGameDataStore();
    const teamMember = selectedTeamMember();
    
    const maxMoves = useMemo(() => teamMember ? calculateMaxMoves(teamMember.sheetData.insight) : 0, [teamMember]);
    const [selectedMoves, setSelectedMoves] = useState<(string | null)[]>(() => Array(maxMoves).fill(null));

    const learnableMoves = useMemo(() => {
        if (!teamMember) return [];
        const learnset = new Set(teamMember.pokedexData.Moves.map(m => m.Name));
        return Object.values(allMoves).filter((m: Move) => learnset.has(m.Name));
    }, [teamMember, allMoves]);

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
        const newSheet = { ...teamMember.sheetData, moves: selectedMoves };
        updateSheetData(teamMember.instanceID, newSheet);
        setEvolutionStep('LOYALTY_CHECK');
    };

    if (!teamMember) return null;

    return (
        <div className="p-6 bg-slate-800 text-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <h2 className="text-2xl font-primary text-poke-yellow mb-2 text-center">Select New Moveset</h2>
            <p className="text-center text-gray-400 mb-4">Choose up to {maxMoves} moves for {teamMember.pokedexData.Name}. Moves from the previous form are lost.</p>
            <div className="grid grid-cols-2 gap-4 flex-grow overflow-hidden">
                <div className="flex flex-col space-y-2 pr-2 overflow-y-auto">
                    <h3 className="font-bold text-lg text-poke-yellow">Available Moves</h3>
                    {learnableMoves.map(move => {
                        const isSelected = selectedMoves.includes(move._id);
                        return (
                            <button key={move._id} onClick={() => handleToggleMove(move._id)} className={`p-3 rounded-lg text-left transition-colors ${isSelected ? 'bg-poke-blue ring-2 ring-poke-yellow' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                <p className="font-bold">{move.Name}</p>
                                <p className="text-xs text-gray-300">{move.Effect}</p>
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-col space-y-2">
                    <h3 className="font-bold text-lg text-poke-yellow">Selected Moves ({selectedMoves.filter(m => m).length}/{maxMoves})</h3>
                    {selectedMoves.map((moveId, index) => {
                         const move = moveId ? allMoves[moveId] : null;
                         return (
                            <div key={index} className="p-3 bg-slate-900 border border-slate-700 rounded-lg min-h-[60px] flex items-center justify-between">
                               {move ? <p className="font-bold">{move.Name}</p> : <p className="text-gray-500">Empty Slot</p>}
                               {move && <TypeBadge type={move.Type} />}
                            </div>
                         );
                    })}
                </div>
            </div>
             <div className="mt-4 flex justify-end pt-4 border-t border-slate-700">
                <button onClick={handleConfirm} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">Confirm Moveset</button>
            </div>
        </div>
    );
};