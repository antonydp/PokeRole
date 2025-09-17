


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokedex, PokemonData, Move, Nature } from '../types';
import { CloseIcon } from './Icons';

import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader';
import LeftColumn from './PokemonDetail/LeftColumn';
import MiddleColumn from './PokemonDetail/MiddleColumn';
import RightColumn from './PokemonDetail/RightColumn';
import MovesSection from './PokemonDetail/MovesSection';
import MoveModal from './PokemonDetail/MoveModal';
import NatureModal from './PokemonDetail/NatureModal';
import { createInitialSheetData } from '../utils';
import { NATURES } from '../constants';


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
}

const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, allMoves, onClose, onAddToTeam, onRemoveFromTeam, isInTeam, teamIsFull, sheetData, onSheetDataChange, unitSettings }) => {
    const [pokemonData, setPokemonData] = useState<PokemonData>(() => sheetData || createInitialSheetData(pokemon, unitSettings));
    
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveSlotIndex, setMoveSlotIndex] = useState<number | null>(null);
    const [moveSearchTerm, setMoveSearchTerm] = useState('');

    const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
    const [natureSearchTerm, setNatureSearchTerm] = useState('');

    const [expandedMoves, setExpandedMoves] = useState<Set<number>>(new Set());

    useEffect(() => {
        setPokemonData(sheetData || createInitialSheetData(pokemon, unitSettings));
        setExpandedMoves(new Set());
    }, [pokemon, sheetData, unitSettings]);

    useEffect(() => {
        if (isInTeam) {
            onSheetDataChange(pokemon.DexID, pokemonData);
        }
    }, [pokemonData, onSheetDataChange, isInTeam, pokemon.DexID]);


    const updateField = useCallback((field: keyof PokemonData, value: any) => {
        setPokemonData(prev => {
            const newData = { ...prev, [field]: value };
            const numericValue = Number(value) || 0;

            switch (field) {
                // ATTRIBUTES
                case 'vitality':
                    newData.hp = String(pokemon.BaseHP + numericValue);
                    newData.defSDef = `${numericValue} / ${newData.insight}`;
                    break;
                case 'insight':
                    newData.will = String(numericValue + 2);
                    const maxMoves = Math.max(0, numericValue + 2);
                    if (prev.moves.length !== maxMoves) {
                        newData.moves = Array.from({ length: maxMoves }, (_, i) => prev.moves[i] || null);
                    }
                    newData.defSDef = `${newData.vitality} / ${numericValue}`;
                    break;
                case 'dexterity':
                    newData.initiative = String(numericValue + newData.alert);
                    newData.evasionValue = String(numericValue + newData.evasion);
                    break;
                case 'strength':
                case 'special':
                case 'clash': {
                    const { strength, special, clash } = newData;
                    if (clash > 0) {
                        newData.clashValue = `${strength + clash} / ${special + clash}`;
                    } else {
                        newData.clashValue = `${strength} / ${special}`;
                    }
                    break;
                }
                // SKILLS
                case 'alert':
                    newData.initiative = String(newData.dexterity + numericValue);
                    break;
                case 'evasion':
                    newData.evasionValue = String(newData.dexterity + numericValue);
                    break;
            }
            
            return newData;
        });
    }, [pokemon.BaseHP]);

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

    const learnableMoves = useMemo(() => pokemon.Moves
        .map(learnset => allMoves[learnset.Name.toLowerCase().replace(/ /g, '-')])
        .filter((move): move is Move => !!move)
        .filter(move => move.Name.toLowerCase().includes(moveSearchTerm.toLowerCase()))
        .sort((a, b) => a.Name.localeCompare(b.Name)),
        [pokemon.Moves, allMoves, moveSearchTerm]
    );
    
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
                updateField={updateField}
                isInTeam={isInTeam}
                teamIsFull={teamIsFull}
                onAddToTeam={() => onAddToTeam(pokemon, pokemonData)}
                onRemoveFromTeam={() => onRemoveFromTeam(pokemon)}
                pokemon={pokemon}
                availableAbilities={availableAbilities}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 gap-y-3">
                <LeftColumn pokemonData={pokemonData} updateField={updateField} />
                <MiddleColumn 
                    pokemonData={pokemonData} 
                    updateField={updateField} 
                    onOpenNatureModal={() => {
                        setNatureSearchTerm('');
                        setIsNatureModalOpen(true);
                    }}
                />
                <RightColumn pokemonData={pokemonData} updateField={updateField} pokemon={pokemon} />
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