

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokedex, PokemonData, Move } from '../types';
import { CloseIcon } from './Icons';

import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader';
import LeftColumn from './PokemonDetail/LeftColumn';
import MiddleColumn from './PokemonDetail/MiddleColumn';
import RightColumn from './PokemonDetail/RightColumn';
import MovesSection from './PokemonDetail/MovesSection';
import MoveModal from './PokemonDetail/MoveModal';
import { createInitialSheetData } from '../utils';


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
            
            if (field === 'insight') {
                const newInsight = value as number;
                const maxMoves = Math.max(0, newInsight + 2);
                if (prev.moves.length !== maxMoves) {
                    newData.moves = Array.from({ length: maxMoves }, (_, i) => prev.moves[i] || null);
                }
            }
            
            return newData;
        });
    }, []);

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
                <MiddleColumn pokemonData={pokemonData} updateField={updateField} />
                <RightColumn pokemonData={pokemonData} updateField={updateField} />
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