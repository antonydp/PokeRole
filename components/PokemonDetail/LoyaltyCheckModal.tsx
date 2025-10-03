import React, { useState } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { DiceIcon } from '../Icons.js';
import { SOCIAL_ATTRIBUTES } from '../../src/constants/gameConstants.js';

// A simple dice roll simulator for this example
const rollDice = (count: number) => {
    let successes = 0;
    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * 6) + 1;
        if (roll >= 5) successes++;
    }
    return successes;
};

export const LoyaltyCheckModal: React.FC = () => {
    const { closeEvolutionModal } = useUIStore();
    const { updateSheetData, selectedTeamMember } = useSessionStore();
    const teamMember = selectedTeamMember();
    const [rollResult, setRollResult] = useState<{ successes: number; lostLoyalty: boolean } | null>(null);

    if (!teamMember) return null;

    const highestSocial = Math.max(...SOCIAL_ATTRIBUTES.map(attr => teamMember.sheetData[attr.field]));

    const handleRoll = () => {
        const successes = rollDice(highestSocial);
        const lostLoyalty = successes < 2;

        if (lostLoyalty) {
            const newSheet = { ...teamMember.sheetData, loyalty: Math.max(0, teamMember.sheetData.loyalty - 1) };
            updateSheetData(teamMember.instanceID, newSheet);
        }
        setRollResult({ successes, lostLoyalty });
    };

    return (
        <div className="p-6 bg-slate-800 text-white rounded-lg w-full max-w-lg text-center">
            <h2 className="text-2xl font-primary text-poke-yellow mb-2">Loyalty Check</h2>
            <p className="mb-4">The sudden change from evolution can affect a Pokémon's loyalty. Roll your highest Social Attribute ({highestSocial}) to see how it reacts.</p>
            
            {!rollResult ? (
                <button onClick={handleRoll} className="px-6 py-3 bg-poke-blue text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center mx-auto">
                    <DiceIcon className="w-6 h-6 mr-2" />
                    Roll {highestSocial} Dice
                </button>
            ) : (
                <div className="animate-fade-in">
                    <p className="text-4xl font-bold mb-2">{rollResult.successes} Successes!</p>
                    {rollResult.lostLoyalty ? (
                        <p className="text-lg text-red-400">Oh no! Its Loyalty decreased by 1.</p>
                    ) : (
                        <p className="text-lg text-green-400">It trusts you completely! Loyalty is unchanged.</p>
                    )}
                    <button onClick={closeEvolutionModal} className="mt-6 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
                        Finish Evolution
                    </button>
                </div>
            )}
        </div>
    );
};