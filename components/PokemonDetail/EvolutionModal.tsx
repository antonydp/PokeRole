import React from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { useEvolution, AvailableEvolution } from '../../src/hooks/useEvolution.js';
import { StatRedistributionModal } from './StatRedistributionModal.js';
import { CloseIcon } from '../Icons.js';

export const EvolutionModal: React.FC = () => {
    const { evolutionState, closeEvolutionModal, setEvolutionStep } = useUIStore();
    const { selectedTeamMember, initiatePermanentEvolution } = useSessionStore();
    const teamMember = selectedTeamMember();
    const { availableEvolutions } = useEvolution(teamMember);

    if (!evolutionState.isOpen || !teamMember) {
        return null;
    }

    const handleEvolutionSelect = (evolution: AvailableEvolution) => {
        if (!evolution.isEligible || !evolution.targetPokedex) return;

        if (evolution.Kind === 'Mega' || evolution.Kind === 'Form') {
            // Handle temporary forms (future feature)
            alert(`Temporary evolution to ${evolution.To} is not yet implemented.`);
        } else {
            // This is a permanent evolution
            initiatePermanentEvolution(teamMember.instanceID, evolution.targetPokedex);
        }
    };

    const renderStep = () => {
        switch (evolutionState.step) {
            case 'CHOICE':
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
            case 'REDISTRIBUTE':
                // This component now fetches all its data from the stores, no props needed
                return <StatRedistributionModal />;
            case 'MOVESET':
                // Placeholder for your MoveSelectionModal
                return <div className="p-6 bg-slate-800 text-white rounded-lg"><h2 className="text-2xl font-primary text-poke-yellow">Select New Moves</h2><button onClick={() => setEvolutionStep('LOYALTY_CHECK')}>Next</button></div>;
            case 'LOYALTY_CHECK':
                // Placeholder for your LoyaltyCheckModal
                return <div className="p-6 bg-slate-800 text-white rounded-lg"><h2 className="text-2xl font-primary text-poke-yellow">Loyalty Check</h2><button onClick={closeEvolutionModal}>Finish</button></div>;
            default:
                return null;
        }
    };

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