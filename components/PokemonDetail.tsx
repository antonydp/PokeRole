import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokedex, PokemonData, Move, Nature, Rank, LearnableMove } from '../src/types/index.js';
import { CloseIcon } from './Icons.js';

import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader.js';
import LeftColumn from './PokemonDetail/LeftColumn.js';
import MiddleColumn from './PokemonDetail/MiddleColumn.js';
import RightColumn from './PokemonDetail/RightColumn.js';
import MovesSection from './PokemonDetail/MovesSection.js';
import MoveModal from './PokemonDetail/MoveModal.js';
import NatureModal from './PokemonDetail/NatureModal.js';
import { createInitialSheetData } from '../src/logic/initializers.js';
import { parseMoveRank } from '../src/logic/formulas.js';
import { NATURES } from '../src/constants/gameConstants.js';
import {
    RANK_ORDER,
    RANK_SKILL_LIMITS,
    RANK_ATTRIBUTE_POINTS,
    RANK_SOCIAL_ATTRIBUTE_POINTS,
    RANK_SKILL_POINTS,
    calculatePokemonHP,
    calculatePokemonWill,
    calculateInitiative,
    calculateDefSDef,
    calculateEvasion,
    calculateClash,
    calculateMaxMoves
} from '../src/logic/core.js';

const ATTRIBUTE_FIELDS: (keyof PokemonData)[] = ['strength', 'dexterity', 'vitality', 'special', 'insight'];
const SOCIAL_ATTRIBUTE_FIELDS: (keyof PokemonData)[] = ['tough', 'cool', 'beauty', 'cute', 'clever'];
const SKILL_FIELDS: (keyof PokemonData)[] = ['brawl', 'channel', 'clash', 'evasion', 'alert', 'athletic', 'nature', 'stealth', 'allure', 'etiquette', 'intimidate', 'perform', 'extraSkillValue'];

/**
 * @interface PokemonDetailProps
 * @property {Pokedex} pokemon - The base Pokedex data for the Pokémon.
 * @property {Record<string, Move>} allMoves - A map of all available moves.
 * @property {() => void} onClose - Callback to close the detail sheet.
 * @property {(pokemon: Pokedex, sheetData: PokemonData) => void} onAddToTeam - Callback to add the Pokémon to the team.
 * @property {(pokemon: Pokedex) => void} onRemoveFromTeam - Callback to remove the Pokémon from the team.
 * @property {boolean} isInTeam - True if the Pokémon is currently in the team.
 * @property {boolean} teamIsFull - True if the team has reached its maximum capacity.
 * @property {PokemonData} [sheetData] - Optional existing sheet data for the Pokémon if it's already in the team.
 * @property {(pokemonDexID: string, newSheetData: PokemonData) => void} onSheetDataChange - Callback to update the Pokémon's sheet data in the team.
 * @property {{ height: 'imperial' | 'metric', weight: 'imperial' | 'metric' }} unitSettings - User's preferred unit settings.
 * @property {Rank} trainerRank - The current rank of the trainer.
 */

/**
 * The PokemonDetail component displays and allows editing of a Pokémon's full character sheet.
 * It includes sections for attributes, skills, social stats, moves, and derived combat statistics.
 * Users can customize their Pokémon's sheet, add it to their team, or remove it.
 * @param {PokemonDetailProps} props - The props for the PokemonDetail component.
 * @returns {React.FC} The rendered PokemonDetail component.
 */
interface PokemonDetailProps {
    pokemon: Pokedex;
    allMoves: Record<string, Move>;
    onClose: () => void;
    onAddToTeam: (pokemon: Pokedex, sheetData: PokemonData) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    isInTeam: boolean;
    teamIsFull: boolean;
    sheetData?: PokemonData;
    onSheetDataChange: (pokemonDexID: string, newSheetData: PokemonData) => void;
    unitSettings: { height: 'imperial' | 'metric', weight: 'imperial' | 'metric' };
    trainerRank: Rank;
}
const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, allMoves, onClose, onAddToTeam, onRemoveFromTeam, isInTeam, teamIsFull, sheetData, onSheetDataChange, unitSettings, trainerRank }) => {

    const [pokemonData, setPokemonData] = useState<PokemonData>(() => sheetData || createInitialSheetData(pokemon, unitSettings, trainerRank));
    
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveSlotIndex, setMoveSlotIndex] = useState<number | null>(null);
    const [moveSearchTerm, setMoveSearchTerm] = useState('');

    const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
    const [natureSearchTerm, setNatureSearchTerm] = useState('');

    const [expandedMoves, setExpandedMoves] = useState<Set<number>>(new Set());

    useEffect(() => {
        setPokemonData(sheetData || createInitialSheetData(pokemon, unitSettings, trainerRank));
        setExpandedMoves(new Set());
    }, [pokemon, sheetData, unitSettings, trainerRank]);

    useEffect(() => {
        if (isInTeam) {
            onSheetDataChange(pokemon.DexID, pokemonData);
        }
    }, [pokemonData, onSheetDataChange, isInTeam, pokemon.DexID]);
    
    const points = useMemo(() => {
        const currentRank = pokemonData.rank as Rank;
        const totalAttributePoints = RANK_ATTRIBUTE_POINTS[currentRank];
        const totalSocialAttributePoints = RANK_SOCIAL_ATTRIBUTE_POINTS[currentRank];
        const totalSkillPoints = RANK_SKILL_POINTS[currentRank];

        const spentAttributePoints = 
            (pokemonData.strength - pokemon.Strength) +
            (pokemonData.dexterity - pokemon.Dexterity) +
            (pokemonData.vitality - pokemon.Vitality) +
            (pokemonData.special - pokemon.Special) +
            (pokemonData.insight - pokemon.Insight);
        
        const spentSocialAttributePoints =
            (pokemonData.tough - 1) +
            (pokemonData.cool - 1) +
            (pokemonData.beauty - 1) +
            (pokemonData.cute - 1) +
            (pokemonData.clever - 1);

        const spentSkillPoints = 
            pokemonData.brawl + pokemonData.channel + pokemonData.clash + pokemonData.evasion +
            pokemonData.alert + pokemonData.athletic + pokemonData.nature + pokemonData.stealth +
            pokemonData.allure + pokemonData.etiquette + pokemonData.intimidate + pokemonData.perform +
            pokemonData.extraSkillValue;
        
        return {
            attributes: { spent: Math.max(0, spentAttributePoints), total: totalAttributePoints },
            social: { spent: Math.max(0, spentSocialAttributePoints), total: totalSocialAttributePoints },
            skills: { spent: Math.max(0, spentSkillPoints), total: totalSkillPoints },
        };
    }, [pokemonData, pokemon]);

    const isAttributePoolExhausted = points.attributes.spent >= points.attributes.total;
    const isSocialAttributePoolExhausted = points.social.spent >= points.social.total;
    const isSkillPoolExhausted = points.skills.spent >= points.skills.total;

    const handleDataChange = useCallback((field: keyof PokemonData, value: any) => {
        setPokemonData(prev => {
            const oldValue = (prev[field] as number) || 0;
            const isIncreasing = Number(value) > oldValue;

            if (isIncreasing) {
                 const currentSpentAttributes = (prev.strength - pokemon.Strength) + (prev.dexterity - pokemon.Dexterity) + (prev.vitality - pokemon.Vitality) + (prev.special - pokemon.Special) + (prev.insight - pokemon.Insight);
                 if (ATTRIBUTE_FIELDS.includes(field as any) && currentSpentAttributes >= points.attributes.total) return prev;

                 const currentSpentSocial = (prev.tough - 1) + (prev.cool - 1) + (prev.beauty - 1) + (prev.cute - 1) + (prev.clever - 1);
                 if (SOCIAL_ATTRIBUTE_FIELDS.includes(field as any) && currentSpentSocial >= points.social.total) return prev;
                 
                 const currentSpentSkills =
                    prev.brawl + prev.channel + prev.clash + prev.evasion +
                    prev.alert + prev.athletic + prev.nature + prev.stealth +
                    prev.allure + prev.etiquette + prev.intimidate + prev.perform +
                    prev.extraSkillValue;
                 if (SKILL_FIELDS.includes(field as any) && currentSpentSkills >= points.skills.total) return prev;
            }

            const newData = { ...prev, [field]: value };
            const numericValue = Number(value) || 0;
            
            if (field === 'rank') {
                const newRank = value as Rank;
                newData.hp = String(calculatePokemonHP(pokemon.BaseHP, newData.vitality, newRank));
                newData.will = String(calculatePokemonWill(newData.insight, newRank));
                newData.initiative = String(calculateInitiative(newData.dexterity, newData.alert, newRank));
                newData.defSDef = calculateDefSDef(newData.vitality, newData.insight, newRank);
            } else {
                const currentRank = newData.rank as Rank;
                switch (field) {
                    case 'vitality':
                        newData.hp = String(calculatePokemonHP(pokemon.BaseHP, numericValue, currentRank));
                        newData.defSDef = calculateDefSDef(numericValue, newData.insight, currentRank);
                        break;
                    case 'insight':
                        newData.will = String(calculatePokemonWill(numericValue, currentRank));
                        const maxMoves = calculateMaxMoves(numericValue);
                        if (prev.moves.length !== maxMoves) {
                            newData.moves = Array.from({ length: maxMoves }, (_, i) => prev.moves[i] || null);
                        }
                        newData.defSDef = calculateDefSDef(newData.vitality, numericValue, currentRank);
                        break;
                    case 'dexterity':
                        newData.initiative = String(calculateInitiative(numericValue, newData.alert, currentRank));
                        newData.evasionValue = String(calculateEvasion(numericValue, newData.evasion));
                        break;
                    case 'strength':
                    case 'special':
                    case 'clash':
                        newData.clashValue = calculateClash(newData.strength, newData.special, newData.clash);
                        break;
                    case 'alert':
                        newData.initiative = String(calculateInitiative(newData.dexterity, numericValue, currentRank));
                        break;
                    case 'evasion':
                        newData.evasionValue = String(calculateEvasion(newData.dexterity, numericValue));
                        break;
                }
            }
            
            return newData;
        });
    }, [points, pokemon]);

    const openMoveModal = useCallback((index: number) => {
        setMoveSlotIndex(index);
        setMoveSearchTerm('');
        setIsMoveModalOpen(true);
    }, []);

    const closeMoveModal = () => {
        setIsMoveModalOpen(false);
        setMoveSlotIndex(null);
    };

    const handleSelectMove = (move: Move) => {
        if (moveSlotIndex === null) return;

        setPokemonData(prev => {
            const newMoves = [...prev.moves];
            newMoves[moveSlotIndex] = move._id;
            return { ...prev, moves: newMoves };
        });
        closeMoveModal();
    };
    
    const handleSelectNature = useCallback((nature: Nature) => {
        setPokemonData(prev => ({
            ...prev,
            pokemonNature: nature.name,
            confidence: String(nature.confidence),
        }));
        setIsNatureModalOpen(false);
    }, []);

    const handleClearMove = useCallback((index: number) => {
        setPokemonData(prev => {
            const newMoves = [...prev.moves];
            newMoves[index] = null;
            return { ...prev, moves: newMoves };
        });
    }, []);

    const handleToggleMoveExpand = useCallback((index: number) => {
        setExpandedMoves(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const learnableMoves = useMemo((): LearnableMove[] => {
        const trainerRankOrder = RANK_ORDER[trainerRank];
        
        return pokemon.Moves
            .map(learnset => ({
                move: allMoves[learnset.Name.toLowerCase().replace(/'/g, "").replace(/ /g, "-")],
                learnset
            }))
            .filter(({ move }) => !!move)
            .map(({ move, learnset }) => {
                const requiredRank = parseMoveRank(learnset.Learned);
                let isAvailable = true;

                if (requiredRank) {
                    const moveRankOrder = RANK_ORDER[requiredRank];
                    if (moveRankOrder > trainerRankOrder) {
                        isAvailable = false;
                    }
                }
                 // If not a Rank move (e.g., Level up, Tutor), it's available by default in this implementation
                return { move, isAvailable, requiredRank };
            })
            .filter((item): item is { move: Move; isAvailable: boolean; requiredRank: Rank | null } => !!item.move) // Type guard
            .filter(({ move }) => move.Name.toLowerCase().includes(moveSearchTerm.toLowerCase()))
            .sort((a, b) => {
                // Sort by availability first, then alphabetically
                if (a.isAvailable && !b.isAvailable) return -1;
                if (!a.isAvailable && b.isAvailable) return 1;
                return a.move.Name.localeCompare(b.move.Name);
            });
    }, [pokemon.Moves, allMoves, moveSearchTerm, trainerRank]);
    
    const filteredNatures = useMemo(() => {
        const term = natureSearchTerm.toLowerCase();
        if (!term) return NATURES;
        return NATURES.filter(nature => 
            nature.name.toLowerCase().includes(term) ||
            nature.keywords.toLowerCase().includes(term)
        );
    }, [natureSearchTerm]);

    const availableAbilities = useMemo(() => {
        return [
            pokemon.Ability1,
            pokemon.Ability2,
            pokemon.HiddenAbility,
            ...(pokemon.EventAbilities?.split(',').map(a => a.trim()) || [])
        ].filter((a): a is string => !!a && a.trim() !== '');
    }, [pokemon]);
    
    const skillLimit = useMemo(() => RANK_SKILL_LIMITS[pokemonData.rank as Rank], [pokemonData.rank]);

    return (
        <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-pixel animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
            <MoveModal
                isOpen={isMoveModalOpen}
                onClose={closeMoveModal}
                learnableMoves={learnableMoves}
                onSelectMove={handleSelectMove}
                searchTerm={moveSearchTerm}
                onSearchTermChange={setMoveSearchTerm}
            />
            <NatureModal
                isOpen={isNatureModalOpen}
                onClose={() => setIsNatureModalOpen(false)}
                natures={filteredNatures}
                onSelectNature={handleSelectNature}
                searchTerm={natureSearchTerm}
                onSearchTermChange={setNatureSearchTerm}
            />

            <button onClick={onClose} className="absolute top-2 right-2 z-20 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110" aria-label="Close sheet">
                <CloseIcon className="w-5 h-5" />
            </button>

            <PokemonDetailHeader
                pokemonData={pokemonData}
                updateField={handleDataChange}
                isInTeam={isInTeam}
                teamIsFull={teamIsFull}
                onAddToTeam={() => onAddToTeam(pokemon, pokemonData)}
                onRemoveFromTeam={() => onRemoveFromTeam(pokemon)}
                pokemon={pokemon}
                availableAbilities={availableAbilities}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 gap-y-3">
                <LeftColumn 
                    pokemon={pokemon}
                    pokemonData={pokemonData} 
                    onDataChange={handleDataChange} 
                    skillLimit={skillLimit} 
                    points={points}
                    isAttributePoolExhausted={isAttributePoolExhausted}
                    isSkillPoolExhausted={isSkillPoolExhausted}
                />
                <MiddleColumn 
                    pokemonData={pokemonData} 
                    onDataChange={handleDataChange} 
                    onOpenNatureModal={() => {
                        setNatureSearchTerm('');
                        setIsNatureModalOpen(true);
                    }}
                    points={points}
                    isSocialAttributePoolExhausted={isSocialAttributePoolExhausted}
                />
                <RightColumn pokemonData={pokemonData} updateField={handleDataChange} pokemon={pokemon} trainerRank={trainerRank} />
            </div>

            <MovesSection 
                pokemonData={pokemonData} 
                allMoves={allMoves}
                openMoveModal={openMoveModal} 
                handleClearMove={handleClearMove}
                expandedMoves={expandedMoves}
                onToggleMoveExpand={handleToggleMoveExpand}
            />
        </div>
    );
};

export default PokemonDetail;