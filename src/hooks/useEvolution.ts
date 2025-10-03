// src/hooks/useEvolution.ts
import { useMemo } from 'react';
import { TeamMember, TrainerData, Pokedex, Evolution } from '../types/index.js';
import { useSessionStore } from '../store/useSessionStore.js';
import { useGameDataStore } from '../store/useGameDataStore.js';

// Define the victory requirements
const VICTORY_THRESHOLDS = { Fast: 5, Medium: 15, Slow: 45 };

export interface AvailableEvolution extends Evolution {
    isEligible: boolean;
    reason: string; // e.g., "Requires 15 victories", "Trainer has Thunder Stone"
    targetPokedex: Pokedex;
}

export function useEvolution(teamMember: TeamMember | null) {
    const { trainerData } = useSessionStore();
    const { allPokemon, allItems } = useGameDataStore();

    const availableEvolutions = useMemo<AvailableEvolution[]>(() => {
        if (!teamMember) return [];

        const { pokedexData, sheetData } = teamMember;
        const allEvolutions = pokedexData.Evolutions || [];

        return allEvolutions.map(evo => {
            const targetPokedex = allPokemon.find(p => p.Name === evo.To);
            if (!targetPokedex) {
                // Return an ineligible object if the target form doesn't exist
                return { ...evo, isEligible: false, reason: 'Evolved form not found.', targetPokedex: {} as Pokedex };
            }

            let eligibility = { isEligible: false, reason: '' };

            switch (evo.Kind) {
                case 'Level':
                    const requiredVictories = VICTORY_THRESHOLDS[evo.Speed as keyof typeof VICTORY_THRESHOLDS] || Infinity;
                    const currentVictories = parseInt(sheetData.victories, 10) || 0;
                    if (currentVictories >= requiredVictories) {
                        eligibility = { isEligible: true, reason: `Reached ${requiredVictories} victories.` };
                    } else {
                        eligibility = { isEligible: false, reason: `Requires ${requiredVictories} victories (${currentVictories} so far).` };
                    }
                    break;

                case 'Stone':
                    const hasStone = trainerData.mainPocket.some(item => item.name === evo.Item) || trainerData.smallPocket.some(item => item.name === evo.Item);
                    if (hasStone) {
                        eligibility = { isEligible: true, reason: `Trainer has a ${evo.Item}.` };
                    } else {
                        eligibility = { isEligible: false, reason: `Requires a ${evo.Item}.` };
                    }
                    break;

                case 'Stat':
                    const statValue = sheetData[evo.Stat?.toLowerCase() as keyof typeof sheetData] as number || 0;
                    if (statValue >= parseInt(evo.Value || '99', 10)) {
                        eligibility = { isEligible: true, reason: `${evo.Stat} is high enough.` };
                    } else {
                        eligibility = { isEligible: false, reason: `Requires ${evo.Stat} of ${evo.Value}.` };
                    }
                    break;
                
                case 'Special':
                    // Manual override is the only way to handle these text-based conditions
                    eligibility = { isEligible: true, reason: `Special Condition: ${evo.Special} (Storyteller approval needed).` };
                    break;

                case 'Mega':
                case 'Form':
                    // These are always "available" but handled differently.
                    eligibility = { isEligible: true, reason: `This is a temporary ${evo.Kind} change.` };
                    break;

                // Trade logic would be handled elsewhere.
                case 'Trade':
                    eligibility = { isEligible: false, reason: 'Requires trading.' };
                    break;

                default:
                    eligibility = { isEligible: false, reason: 'Unknown evolution method.' };
            }

            return { ...evo, ...eligibility, targetPokedex };
        }).filter(evo => evo.targetPokedex.Name); // Filter out any evolutions where the target couldn't be found
    }, [teamMember, trainerData, allPokemon]);

    return { availableEvolutions };
}