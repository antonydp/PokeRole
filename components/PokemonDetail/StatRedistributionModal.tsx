// components/PokemonDetail/StatRedistributionModal.tsx
import React, { useState, useMemo } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { PokemonData, Rank } from '../../src/types/index.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { usePointCalculations } from '../../src/hooks/usePointCalculations.js';
import { PointsDisplay } from '../shared/Points.js';
// ... other necessary imports for UI components like AttributeBlock

export const StatRedistributionModal: React.FC = () => {
    const { evolutionState } = useUIStore();
    const { finalizePermanentEvolution, selectedTeamMember } = useSessionStore();
    const teamMember = selectedTeamMember();

    // Guard against incorrect state
    if (!evolutionState.isOpen || evolutionState.step !== 'REDISTRIBUTE' || !teamMember) {
        return <div>Error: Invalid state for redistribution.</div>;
    }

    const { bonusPoints, newPokedexData } = evolutionState;

    // Create a temporary, local state for the user to modify
    const [tempSheet, setTempSheet] = useState<PokemonData>(() =>
        createInitialSheetData(newPokedexData, { height: 'imperial', weight: 'imperial' }, teamMember.sheetData.rank as Rank)
    );

    // Calculate points spent ON THE TEMPORARY SHEET relative to the NEW BASE stats
    const { points: spentPoints } = usePointCalculations(tempSheet, newPokedexData);

    const remainingPoints = useMemo(() => ({
        attributes: bonusPoints.attributes - spentPoints.attributes.spent,
        skills: bonusPoints.skills - spentPoints.skills.spent,
    }), [bonusPoints, spentPoints]);

    const canConfirm = remainingPoints.attributes === 0 && remainingPoints.skills === 0;

    const handleConfirm = () => {
        if (!canConfirm) return;
        // Pass the final, edited sheet to the store action
        finalizePermanentEvolution(teamMember.instanceID, tempSheet);
    };

    return (
        <div className="p-4 bg-slate-800 ...">
            {/* Header with remaining points displays */}
            <div className="grid grid-cols-2 gap-4">
                <PointsDisplay label="Attribute Points Remaining" spent={0} total={remainingPoints.attributes} />
                <PointsDisplay label="Skill Points Remaining" spent={0} total={remainingPoints.skills} />
            </div>

            {/* UI for editing attributes and skills (AttributeBlock, CurvedSkillBlock) */}
            {/* Pass `isPoolExhausted={remainingPoints.attributes <= 0}` to AttributeBlock */}
            {/* Pass `isPoolExhausted={remainingPoints.skills <= 0}` to CurvedSkillBlock */}
            
            <button onClick={handleConfirm} disabled={!canConfirm}>
                Confirm & Continue
            </button>
        </div>
    );
};