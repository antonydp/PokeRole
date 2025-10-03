import React, { useState, useMemo } from 'react';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { PokemonData, Pokedex, Rank } from '../../src/types/index.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { usePointCalculations } from '../../src/hooks/usePointCalculations.js';
import { POKEMON_ATTRIBUTES, POKEMON_SKILLS } from '../../src/constants/gameConstants.js';
import { RANK_SKILL_LIMITS } from '../../src/logic/core.js';
import { AttributeBlock } from '../shared/AttributeBlock.js';
import { CurvedSkillBlock, CurvedExtraSkillBlock } from '../shared/CurvedSkillBlock.js';
import { PointsDisplay } from '../shared/Points.js';
import { SOCIAL_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import { SocialAttribute } from '../shared/SocialAttribute.js';

export const StatRedistributionModal: React.FC = () => {
    const { evolutionState, setEvolutionStep } = useUIStore();
    const { finalizePermanentEvolution, selectedTeamMember } = useSessionStore();
    const teamMember = selectedTeamMember();

    if (!evolutionState.isOpen || evolutionState.step !== 'REDISTRIBUTE' || !evolutionState.bonusPoints || !evolutionState.newPokedexData || !teamMember) {
        return <div className="p-4 text-red-500">Error: Missing data for redistribution.</div>;
    }

    const { bonusPoints, newPokedexData } = evolutionState;
    const { unitSettings } = useUIStore.getState(); // Get unit settings for sheet creation

    const [tempSheet, setTempSheet] = useState<PokemonData>(() => {
        const newSheet = createInitialSheetData(newPokedexData, unitSettings, teamMember.sheetData.rank as Rank);
        
        // Conditionally set the Pokémon's name
        const isDefaultName = teamMember.sheetData.pokemonName === teamMember.pokedexData.Name;
        newSheet.pokemonName = isDefaultName
            ? newPokedexData.Name // Update to the new species name if it was the default
            : teamMember.sheetData.pokemonName; // Keep the existing nickname

        // Carry over other non-resettable data
        newSheet.pokemonNature = teamMember.sheetData.pokemonNature;
        newSheet.confidence = teamMember.sheetData.confidence;
        newSheet.happiness = teamMember.sheetData.happiness;
        newSheet.loyalty = teamMember.sheetData.loyalty;
        newSheet.extraSkillName = teamMember.sheetData.extraSkillName;
        
        return newSheet;
    });

    const { points: spentPoints } = usePointCalculations(tempSheet, newPokedexData);

    const remainingPoints = useMemo(() => ({
        attributes: bonusPoints.attributes - spentPoints.attributes.spent,
        skills: bonusPoints.skills - spentPoints.skills.spent,
        social: bonusPoints.social - spentPoints.social.spent,
    }), [bonusPoints, spentPoints]);

    const handleDataChange = (field: keyof PokemonData, value: any) => {
        setTempSheet(prev => ({ ...prev, [field]: value }));
    };

    const canConfirm = remainingPoints.attributes === 0 && remainingPoints.skills === 0 && remainingPoints.social === 0;

    const handleConfirm = () => {
        if (!canConfirm) return;
        finalizePermanentEvolution(teamMember.instanceID, tempSheet);
    };

    return (
        <div className="p-4 bg-slate-800 text-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-primary text-poke-yellow mb-2 text-center">Redistribute Bonus Points</h2>
            <p className="text-center text-gray-300 mb-4">Re-assign the points your Pokémon earned. You must spend all points to continue.</p>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <div className="grid grid-cols-3 gap-4 sticky top-0 bg-slate-800 py-2 z-10">
                    <PointsDisplay label="Attribute Points Left" spent={0} total={remainingPoints.attributes} />
                    <PointsDisplay label="Skill Points Left" spent={0} total={remainingPoints.skills} />
                    <PointsDisplay label="Social Points Left" spent={0} total={remainingPoints.social} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Attributes */}
                    <div className="lg:col-span-1 space-y-2">
                        <h3 className="font-bold text-center text-poke-yellow">Attributes</h3>
                        {POKEMON_ATTRIBUTES.map(attr => (
                            <AttributeBlock<PokemonData>
                                key={attr.name}
                                name={attr.name}
                                value={tempSheet[attr.field as keyof PokemonData] as number}
                                onChange={(v) => {
                                    const baseValue = newPokedexData[attr.name.charAt(0).toUpperCase() + attr.name.slice(1).toLowerCase() as keyof Pokedex] as number;
                                    if (v < baseValue) return;
                                    const oldValue = tempSheet[attr.field as keyof PokemonData] as number;
                                    if (v > oldValue && remainingPoints.attributes <= 0) return;
                                    handleDataChange(attr.field as keyof PokemonData, v);
                                }}
                                isPoolExhausted={remainingPoints.attributes <= 0}
                                max={newPokedexData[`Max${attr.name.charAt(0) + attr.name.slice(1).toLowerCase()}` as keyof Pokedex] as number}
                                baseValue={newPokedexData[attr.name.charAt(0).toUpperCase() + attr.name.slice(1).toLowerCase() as keyof Pokedex] as number}
                            />
                        ))}
                    </div>

                    {/* Skills */}
                    <div className="lg:col-span-1 flex flex-col">
                         <h3 className="font-bold text-center text-poke-yellow">Skills</h3>
                        <CurvedSkillBlock<PokemonData> title="FIGHT" skills={POKEMON_SKILLS.FIGHT.map(s => ({...s, value: tempSheet[s.field as keyof PokemonData] as number}))} onSkillChange={handleDataChange} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="top" />
                        <CurvedSkillBlock<PokemonData> title="SURVIVAL" skills={POKEMON_SKILLS.SURVIVAL.map(s => ({...s, value: tempSheet[s.field as keyof PokemonData] as number}))} onSkillChange={handleDataChange} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="middle" />
                         <CurvedSkillBlock<PokemonData> title="SOCIAL" skills={POKEMON_SKILLS.SOCIAL.map(s => ({...s, value: tempSheet[s.field as keyof PokemonData] as number}))} onSkillChange={handleDataChange} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="middle" />
                         <CurvedExtraSkillBlock title="EXTRA" extraSkills={[{ name: tempSheet.extraSkillName, value: tempSheet.extraSkillValue }]} onSkillChange={(index, field, value) => handleDataChange(field === 'name' ? 'extraSkillName' : 'extraSkillValue', value)} skillLimit={RANK_SKILL_LIMITS[tempSheet.rank as Rank]} isPoolExhausted={remainingPoints.skills <= 0} position="bottom" />
                    </div>

                    {/* *** ADD THIS SECTION FOR SOCIAL ATTRIBUTES *** */}
                    <div className="lg:col-span-1 space-y-2">
                        <h3 className="font-bold text-center text-poke-yellow">Social Attributes</h3>
                        {SOCIAL_ATTRIBUTES.map(attr => (
                            <SocialAttribute
                                key={attr.name}
                                label={attr.name}
                                value={tempSheet[attr.field]}
                                max={5}
                                min={1}
                                color={attr.color}
                                onChange={(newValue) => {
                                    if (newValue < 1) return;
                                    const oldValue = tempSheet[attr.field];
                                    if (newValue > oldValue && remainingPoints.social <= 0) return;
                                    handleDataChange(attr.field, newValue);
                                }}
                            />
                        ))}
                    </div>
                     {/* *** END OF ADDED SECTION *** */}
                </div>
            </div>

            <div className="mt-4 flex justify-end pt-4 border-t border-slate-700">
                <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {canConfirm ? 'Confirm & Continue' : `Spend All Points`}
                </button>
            </div>
        </div>
    );
};