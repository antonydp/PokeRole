import { useMemo } from 'react';
import { useUIStore } from '../store/useUIStore.js';
import { useSessionStore } from '../store/useSessionStore.js';
import { useGameDataStore } from '../store/useGameDataStore.js';
import { TeamMember, Pokedex, PokemonData } from '../types/index.js';

interface ActivePokemonResult {
  teamMember: TeamMember | null;
  pokedexData: Pokedex | null;
  sheetData: PokemonData | null;
  activeForm: { pokedexData: Pokedex; sheetData: PokemonData } | null;
}

export const useActivePokemon = (): ActivePokemonResult => {
  const selectedPokemonId = useUIStore(state => state.selectedPokemonId);
  const team = useSessionStore(state => state.team);
  const allPokemon = useGameDataStore(state => state.allPokemon);

  const teamMember = useMemo(() => {
    if (!selectedPokemonId?.instanceID) return null;
    return team.find(m => m.instanceID === selectedPokemonId.instanceID) || null;
  }, [selectedPokemonId, team]);

  const activeForm = useMemo(() => {
    if (teamMember?.currentFormName && teamMember.forms?.[teamMember.currentFormName]) {
      return teamMember.forms[teamMember.currentFormName];
    }
    return null;
  }, [teamMember]);

  const pokedexData = useMemo(() => {
    if (activeForm) return activeForm.pokedexData;
    if (teamMember) return teamMember.pokedexData;
    if (selectedPokemonId) {
      return allPokemon.find(p => p.DexID === selectedPokemonId.dexID) || null;
    }
    return null;
  }, [teamMember, activeForm, selectedPokemonId, allPokemon]);

  const sheetData = useMemo(() => {
    if (activeForm) return activeForm.sheetData;
    if (teamMember) return teamMember.sheetData;
    return null;
  }, [teamMember, activeForm]);

  return { teamMember, pokedexData, sheetData, activeForm };
};