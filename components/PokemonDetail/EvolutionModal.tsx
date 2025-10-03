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
    const teamMemberInstanceId = evolutionState.isOpen ? evolutionState.teamMemberInstanceId : undefined;

    // Get the right member using the ID from the UI store
    const teamMember = useSessionStore(state =>
        state.team.find(m => m.instanceID === teamMemberInstanceId)
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
                                <div key={evo.To} className="flex gap-2 items-center">
                                    <button
                                        onClick={() => handleEvolutionSelect(evo)}
                                        disabled={!evo.isEligible && evo.Kind !== 'Special'} // Only special can be forced
                                        className="w-full p-4 border rounded-lg text-left transition-colors bg-slate-700 border-slate-600 hover:bg-poke-blue hover:border-poke-yellow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700"
                                    >
                                        <p className="font-bold text-lg">Evolve to {evo.To}</p>
                                        <p className="text-sm text-gray-300 mt-1">{evo.reason}</p>
                                    </button>
                                    {/* *** ADD THIS BUTTON *** */}
                                    {evo.Kind === 'Special' && (
                                        <button
                                            onClick={() => handleEvolutionSelect(evo)}
                                            title="Manually trigger this special evolution (Storyteller)"
                                            className="p-4 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        </button>
                                    )}
                                    {/* *** END OF ADDED BUTTON *** */}
                                </div>
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