import React, { useState } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { useActivePokemon } from '../../src/hooks/useActivePokemon.js';
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
    const { updateSheetData } = useSessionStore();
    const { teamMember } = useActivePokemon();
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
        <div className="p-4 bg-slate-800 text-white rounded-lg w-full max-w-md text-center">
            <h2 className="text-xl font-primary text-poke-yellow mb-2">Loyalty Check</h2>
            <p className="mb-3 text-sm">The sudden change from evolution can affect a Pokémon's loyalty. Roll your highest Social Attribute ({highestSocial}) to see how it reacts.</p>
            
            {!rollResult ? (
                <button onClick={handleRoll} className="px-4 py-2 bg-poke-blue text-white font-bold rounded-md hover:bg-blue-700 flex items-center justify-center mx-auto text-sm">
                    <DiceIcon className="w-5 h-5 mr-2" />
                    Roll {highestSocial} Dice
                </button>
            ) : (
                <div className="animate-fade-in">
                    <p className="text-3xl font-bold mb-1">{rollResult.successes} Successes!</p>
                    {rollResult.lostLoyalty ? (
                        <p className="text-base text-red-400">Oh no! Its Loyalty decreased by 1.</p>
                    ) : (
                        <p className="text-base text-green-400">It trusts you completely! Loyalty is unchanged.</p>
                    )}
                    <button onClick={closeEvolutionModal} className="mt-4 px-4 py-1.5 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 text-sm">
                        Finish Evolution
                    </button>
                </div>
            )}
        </div>
    );
};
