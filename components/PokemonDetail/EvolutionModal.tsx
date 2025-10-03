import React from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { useEvolution, AvailableEvolution } from '../../src/hooks/useEvolution.js';
import { StatRedistributionModal } from './StatRedistributionModal.js';
import { OverrankMoveSelectionModal } from './OverrankMoveSelectionModal.js';
import { MoveSelectionModal } from './MoveSelectionModal.js';
import { LoyaltyCheckModal } from './LoyaltyCheckModal.js';
import { CloseIcon } from '../Icons.js';

export const EvolutionModal: React.FC = () => {
    const { evolutionState, closeEvolutionModal, setEvolutionStep } = useUIStore();
    // Get the right member using the ID from the UI store
    const teamMember = useSessionStore(state =>
        state.team.find(m => m.instanceID === evolutionState.teamMemberInstanceId)
    );
    // Get the actions from the session store
    const { initiatePermanentEvolution, applyTemporaryForm } = useSessionStore();
    const { availableEvolutions } = useEvolution(teamMember);

    // ... guard clauses
    if (!evolutionState.isOpen || !teamMember) {
        return null;
    }

    const handleEvolutionSelect = (evolution: AvailableEvolution) => {
        if (!evolution.isEligible || !evolution.targetPokedex || !teamMember) return;

        if (evolution.Kind === 'Mega' || evolution.Kind === 'Form') {
            // This now calls the correct action to apply a temporary change
            applyTemporaryForm(teamMember.instanceID, evolution.targetPokedex);
        } else {
            // For permanent evolutions, show the overrank choice
            setEvolutionStep('OVERRANK_CHOICE', { selectedEvolution: evolution });
        }
    };

    const handleOverrankChoice = (shouldEvolve: boolean) => {
        if (!evolutionState.isOpen || !evolutionState.selectedEvolution || !teamMember) return;

        if (shouldEvolve) {
            // This is where we calculate bonus points and switch to redistribution UI
            initiatePermanentEvolution(teamMember.instanceID, evolutionState.selectedEvolution.targetPokedex);
        } else {
            // Switch to the move selection UI for overranking
            setEvolutionStep('OVERRANK_MOVESET');
        }
    }
    
    const renderStep = () => {
        switch (evolutionState.step) {
            case 'CHOICE':
                // Your existing CHOICE UI is good. It just needs to call handleEvolutionSelect.
                return (
                    <div className="p-6 bg-slate-800 text-white rounded-lg w-full max-w-lg">
                        <h2 className="text-2xl font-primary text-poke-yellow mb-4 text-center">Evolve {teamMember.pokedexData.Name}?</h2>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {availableEvolutions.length > 0 ? availableEvolutions.map(evo => (
                                <button
                                    key={evo.To}
                                    onClick={() => handleEvolutionSelect(evo)}
                                    disabled={!evo.isEligible}
                                    className="w-full p-4 border rounded-lg text-left transition-colors bg-slate-700 border-slate-600 hover:bg-poke-blue hover:border-poke-yellow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700"
                                >
                                    <p className="font-bold text-lg">Evolve to {evo.To}</p>
                                    <p className="text-sm text-gray-300 mt-1">{evo.reason}</p>
                                </button>
                            )) : <p className="text-center text-gray-400">No evolutions available.</p>}
                        </div>
                    </div>
                );
            
            case 'OVERRANK_CHOICE':
                // This is the new modal asking "Evolve Now" or "Stop Evolution (Overrank)"
                return (
                    <div className="p-6 bg-slate-800 ...">
                        {/* ... title ... */}
                        <div className="flex justify-center gap-4">
                            <button onClick={() => handleOverrankChoice(true)} className="...">
                                Evolve Now
                            </button>
                            <button onClick={() => handleOverrankChoice(false)} className="...">
                                Stop Evolution (Overrank)
                            </button>
                        </div>
                    </div>
                );

            case 'REDISTRIBUTE':
                return <StatRedistributionModal />; // This new component will handle redistribution
            case 'OVERRANK_MOVESET':
                return <OverrankMoveSelectionModal />;
            case 'MOVESET':
                return <MoveSelectionModal />;
            case 'LOYALTY_CHECK':
                return <LoyaltyCheckModal />;
            default:
                return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in" onClick={closeEvolutionModal}>
            <div className="relative" onClick={e => e.stopPropagation()}>
                {renderStep()}
                <button onClick={closeEvolutionModal} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-poke-red text-white hover:bg-red-700 transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};