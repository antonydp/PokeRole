import { StateCreator } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabaseClient';
import { useGameDataStore } from '../useGameDataStore';
import useNotificationStore from '../useNotificationStore';
import { createInitialTrainerData } from '../../logic/initializers';
import { SessionState } from '../useSessionStore';

const clientSessionId = crypto.randomUUID();

export interface SessionSlice {
    user: User | null;
    session: Session | null;
    isDataLoaded: boolean;
    setUser: (user: User | null, session: Session | null) => void;
    fetchSessionData: () => Promise<void>;
    saveSessionData: () => Promise<void>;
    clearUserData: () => void;
}

export const createSessionSlice: StateCreator<
    SessionState,
    [],
    [],
    SessionSlice
> = (set, get) => ({
    user: null,
    session: null,
    isDataLoaded: false,
    setUser: (user, session) => {
        set({ user, session });
    },
    clearUserData: () => {
        set({
            isDataLoaded: false,
            team: [],
            pokemonPC: [],
            trainerData: createInitialTrainerData(),
        });
    },
    fetchSessionData: async () => {
        const user = get().user;
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('session_data')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data && data.session_data) {
                const { team, pokemonPC, trainerData, savedEncounters, savedNPCs } = data.session_data;
                set({
                    team: team || [],
                    pokemonPC: pokemonPC || [],
                    trainerData: trainerData || createInitialTrainerData(),
                    isDataLoaded: true
                });
                useGameDataStore.setState({
                    savedEncounters: savedEncounters || [],
                    savedNPCs: savedNPCs || [],
                });
                useNotificationStore.getState().addNotification({
                    message: 'Session data loaded from cloud!',
                    type: 'success',
                });
            } else {
                set({ isDataLoaded: true });
            }
        } catch (error) {
            console.error('Error fetching session data:', error);
            useNotificationStore.getState().addNotification({
                message: `Error loading data: ${(error as Error).message}`,
                type: 'error',
            });
        }
    },
    saveSessionData: async () => {
        const { user, team, pokemonPC, trainerData } = get();
        if (!user) return;

        const { savedEncounters, savedNPCs } = useGameDataStore.getState();

        const session_data = {
            team,
            pokemonPC,
            trainerData,
            savedEncounters,
            savedNPCs,
            lastUpdatedBy: clientSessionId 
        };

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                session_data,
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error saving session data:', error);
             useNotificationStore.getState().addNotification({
                message: `Error saving data: ${(error as Error).message}`,
                type: 'error',
            });
        }
    },
});