import React, { useState, useMemo } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { PokemonData, Pokedex, Rank } from '../../src/types/index.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { usePointCalculations } from '../../src/hooks/usePointCalculations.js';
import { POKEMON_ATTRIBUTES, POKEMON_SKILLS } from '../../src/constants/gameConstants.js';
import { RANK_SKILL_LIMITS } from '../../src/logic/core.js';
import { AttributeBlock } from '../shared/AttributeBlock.js';
import { CurvedSkillBlock } from '../shared/CurvedSkillBlock.js';
import { PointsDisplay } from '../shared/Points.js';

export const StatRedistributionModal: React.FC = () => {
    const { evolutionState, setEvolutionStep } = useUIStore();
    const { finalizePermanentEvolution, selectedTeamMember } = useSessionStore();
    const teamMember = selectedTeamMember();

    // Guard clauses to ensure we have the necessary data
    if (!evolutionState.isOpen || evolutionState.step !== 'REDISTRIBUTE' || !evolutionState.bonusPoints || !evolutionState.newPokedexData || !teamMember) {
        return <div className="p-4 text-red-500">Error: Missing data for redistribution.</div>;
    }

    const { bonusPoints, newPokedexData } = evolutionState;

    // Create a temporary sheet for the user to modify
    const [tempSheet, setTempSheet] = useState<PokemonData>(() => {
        const newSheet = createInitialSheetData(newPokedexData, { height: 'imperial', weight: 'imperial' }, teamMember.sheetData.rank as Rank);
        // Carry over non-resettable data
        newSheet.pokemonName = teamMember.sheetData.pokemonName;
        newSheet.pokemonNature = teamMember.sheetData.pokemonNature;
        newSheet.confidence = teamMember.sheetData.confidence;
        newSheet.happiness = teamMember.sheetData.happiness;
        newSheet.loyalty = teamMember.sheetData.loyalty;
        return newSheet;
    });

    // Calculate points spent on the *temporary sheet*
    const { points: spentPoints } = usePointCalculations(tempSheet, newPokedexData);

    // *** THE KEY FIX IS HERE ***
    // We calculate the *remaining* bonus points, not the total points for the rank.
    const remainingPoints = useMemo(() => ({
        attributes: bonusPoints.attributes - spentPoints.attributes.spent,
        // social: bonusPoints.social - spentPoints.social.spent, // For when you implement social
        skills: bonusPoints.skills - spentPoints.skills.spent,
    }), [bonusPoints, spentPoints]);

    const handleDataChange = (field: keyof PokemonData, value: any) => {
        setTempSheet(prev => (prev ? { ...prev, [field]: value } : null));
    };

    // The user can only confirm when they have spent all their bonus points (remaining is 0)
    const canConfirm = remainingPoints.attributes === 0 && remainingPoints.skills === 0;

    const handleConfirm = () => {
        if (!canConfirm) return;
        finalizePermanentEvolution(teamMember.instanceID, tempSheet);
    };

    return (
        <div className="p-4 bg-slate-800 text-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-primary text-poke-yellow mb-2 text-center">Redistribute Bonus Points</h2>
            <p className="text-center text-gray-300 mb-4">Your Pokémon has evolved! Re-assign the points it earned from its previous form. You must spend all points to continue.</p>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <div className="grid grid-cols-2 gap-4 sticky top-0 bg-slate-800 py-2 z-10">
                    <PointsDisplay label="Attribute Points Remaining" spent={0} total={remainingPoints.attributes} />
                    <PointsDisplay label="Skill Points Remaining" spent={0} total={remainingPoints.skills} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attributes Column */}
                    <div className="space-y-2">
                        {POKEMON_ATTRIBUTES.map(attr => (
                            <AttributeBlock<PokemonData>
                                key={attr.name}
                                name={attr.name}
                                value={tempSheet[attr.field as keyof PokemonData] as number}
                                onChange={(v) => handleDataChange(attr.field as keyof PokemonData, v)}
                                // Disable incrementing if the user has spent all their bonus points
                                isPoolExhausted={remainingPoints.attributes <= 0}
                                max={newPokedexData[`Max${attr.name.charAt(0) + attr.name.slice(1).toLowerCase()}` as keyof Pokedex] as number}
                                baseValue={newPokedexData[attr.name.charAt(0).toUpperCase() + attr.name.slice(1).toLowerCase() as keyof Pokedex] as number}
                            />
                        ))}
                    </div>

                    {/* Skills Column */}
                    <div className="flex flex-col">
                        <CurvedSkillBlock<PokemonData> title="FIGHT" skills={POKEMON_SKILLS.FIGHT.map(s => ({...s, value: tempSheet[s.field as keyof PokemonData] as number}))} onSkillChange={handleDataChange} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="top" />
                        <CurvedSkillBlock<PokemonData> title="SURVIVAL" skills={POKEMON_SKILLS.SURVIVAL.map(s => ({...s, value: tempSheet[s.field as keyof PokemonData] as number}))} onSkillChange={handleDataChange} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="middle" />
                        <CurvedSkillBlock<PokemonData> title="SOCIAL" skills={POKEMON_SKILLS.SOCIAL.map(s => ({...s, value: tempSheet[s.field as keyof PokemonData] as number}))} onSkillChange={handleDataChange} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="bottom" />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-end pt-4 border-t border-slate-700">
                <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {canConfirm ? 'Confirm & Continue' : `Spend all remaining points to continue`}
                </button>
            </div>
        </div>
    );
};