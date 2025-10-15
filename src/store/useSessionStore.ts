import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useGameDataStore } from './useGameDataStore.ts';
import useNotificationStore from './useNotificationStore';
import { createInitialTrainerData } from '../logic/initializers.ts';

import { PokemonSlice, createPokemonSlice } from './slices/pokemonSlice';
import { SessionSlice, createSessionSlice } from './slices/sessionSlice';
import { TrainerSlice, createTrainerSlice } from './slices/trainerSlice';
import { EvolutionSlice, createEvolutionSlice } from './slices/evolutionSlice';
import { ImportExportSlice, createImportExportSlice } from './slices/importExportSlice';

export interface SessionState extends PokemonSlice, SessionSlice, TrainerSlice, EvolutionSlice, ImportExportSlice {}

const clientSessionId = crypto.randomUUID();

export const useSessionStore = create<SessionState>()((...a) => ({
    ...createPokemonSlice(...a),
    ...createSessionSlice(...a),
    ...createTrainerSlice(...a),
    ...createEvolutionSlice(...a),
    ...createImportExportSlice(...a),
}));


// --- NEW, ROBUST SYNC LOGIC ---

const syncState = {
    isSaving: false,
    isApplyingRemoteUpdate: false,
};

const throttledSave = () => {
    const { user, isDataLoaded } = useSessionStore.getState();

    if (!user || !isDataLoaded || syncState.isSaving) {
        return;
    }

    syncState.isSaving = true;
    console.log("Lock acquired. Saving data...");

    useSessionStore.getState().saveSessionData()
        .then(() => {
            console.log("Save successful.");
        })
        .catch((err) => {
            console.error("Save operation failed:", err);
        })
        .finally(() => {
            syncState.isSaving = false;
            console.log("Lock released.");
        });
};

useSessionStore.subscribe(
    (state, prevState) => {
        if (syncState.isApplyingRemoteUpdate) {
            return;
        }

        const hasSessionDataChanged =
            state.team !== prevState.team ||
            state.pokemonPC !== prevState.pokemonPC ||
            state.trainerData !== prevState.trainerData;

        if (hasSessionDataChanged) {
            throttledSave();
        }
    }
);

useGameDataStore.subscribe(
    (state, prevState) => {
        if (syncState.isApplyingRemoteUpdate) {
            return;
        }

        const hasGameDataChanged =
            state.savedEncounters !== prevState.savedEncounters ||
            state.savedNPCs !== prevState.savedNPCs;

        if (hasGameDataChanged) {
            throttledSave();
        }
    }
);


// --- REVISED AUTHENTICATION & REALTIME LISTENER ---

let realtimeChannel: RealtimeChannel | null = null;
let isInitialAuthEvent = true;
 
 supabase.auth.onAuthStateChange((event, session) => {
     const { setUser, fetchSessionData, clearUserData } = useSessionStore.getState();

    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
        console.log("Unsubscribed from old realtime channel.");
    }
    
    if (session) {
        setUser(session.user, session);
        if (!useSessionStore.getState().isDataLoaded) {
            fetchSessionData();
        }

        console.log(`Setting up realtime subscription for user: ${session.user.id}`);
        realtimeChannel = supabase
            .channel(`profile-changes:${session.user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${session.user.id}`,
                },
                (payload) => {
                    if (isInitialAuthEvent) {
                        isInitialAuthEvent = false;
                        return;
                    }
                    console.log('Realtime update received:', payload);
                    const newSessionData = payload.new.session_data;

                    if (newSessionData.lastUpdatedBy === clientSessionId) {
                        console.log("Ignoring own update.");
                        return;
                    }
                    
                    if (syncState.isSaving) {
                        console.warn("Conflict detected: A remote update was received while a local save was in progress. The remote update will be ignored to preserve local changes.");
                        return;
                    }

                    syncState.isApplyingRemoteUpdate = true;
                    console.log("Applying remote update. Pausing local save trigger.");

                    useNotificationStore.getState().addNotification({
                        message: 'Session data synced from another tab or device!',
                        type: 'success',
                    });

                    const { team, pokemonPC, trainerData, savedEncounters, savedNPCs } = newSessionData;
                    
                    useSessionStore.setState({
                        team: team || [],
                        pokemonPC: pokemonPC || [],
                        trainerData: trainerData || createInitialTrainerData(),
                    });

                    useGameDataStore.setState({
                        savedEncounters: savedEncounters || [],
                        savedNPCs: savedNPCs || [],
                    });
                    
                    setTimeout(() => {
                        syncState.isApplyingRemoteUpdate = false;
                        console.log("Remote update applied. Resuming local save trigger.");
                    }, 0);
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to realtime channel!');
                }
                if (status === 'CHANNEL_ERROR') {
                     console.error('Realtime subscription error:', err);
                }
            });

    } else {
        setUser(null, null);
        clearUserData();
    }
});