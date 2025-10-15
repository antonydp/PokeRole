// App.tsx
import React, { useEffect, useRef } from 'react';
import Headroom from '@webappsconception/react-headroom';
import PokemonList from './components/PokemonList.js';
import PokemonDetail from './components/PokemonDetail.js';
import Dashboard from './components/Dashboard.js';
import GMTools from './components/GMTools.js';
import { PokeballIcon, SettingsIcon, DiceIcon } from './components/Icons.js';
import SuggestTeamModal from './components/SuggestTeamModal.js';
import PokemonListModal from './components/PokemonListModal.js';
import { useGameDataStore } from './src/store/useGameDataStore.js';
import { useUIStore } from './src/store/useUIStore.js';
import { useSessionStore } from './src/store/useSessionStore.js';
import NotificationContainer from './components/shared/NotificationContainer.js';
import { supabase } from './src/services/supabaseClient.js';
import Auth from './components/Auth.js'; // Importa il nuovo componente Auth
import { createInitialTrainerData } from './src/logic/initializers.js';

/**
 * @typedef {object} UnitSettings
 * @property {'imperial' | 'metric'} height - The unit for height measurement.
 * @property {'imperial' | 'metric'} weight - The unit for weight measurement.
 */

/**
 * @interface SettingsModalProps
 * @property {boolean} isOpen - Whether the settings modal is open.
 * @property {() => void} onClose - Callback function to close the modal.
 * @property {UnitSettings} settings - Current unit settings (height and weight).
 * @property {(settings: UnitSettings) => void} onSettingsChange - Callback to update unit settings.
 * @property {string} currentFont - The currently selected font.
 * @property {(font: string) => void} onFontChange - Callback to update the selected font.
 */

/**
 * SettingsModal component allows users to configure unit settings for height and weight.
 * @param {SettingsModalProps} props - The props for the SettingsModal component.
 * @returns {React.FC} The rendered SettingsModal component.
 */
const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
    onSettingsChange: (settings: { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' }) => void;
}> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 font-sans" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-primary text-poke-yellow mb-6 text-center">Settings</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-300 font-bold mb-2">Height Unit</label>
                    <div className="flex bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => onSettingsChange({ ...settings, height: 'imperial' })}
                            className={`w-1/2 p-2 text-sm rounded-md transition-colors ${settings.height === 'imperial' ? 'bg-poke-blue text-white' : 'text-gray-400 hover:bg-slate-600'}`}
                        >
                            Feet / Inches (ft'in")
                        </button>
                        <button
                             onClick={() => onSettingsChange({ ...settings, height: 'metric' })}
                             className={`w-1/2 p-2 text-sm rounded-md transition-colors ${settings.height === 'metric' ? 'bg-poke-blue text-white' : 'text-gray-400 hover:bg-slate-600'}`}
                        >
                            Meters (m)
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-300 font-bold mb-2">Weight Unit</label>
                    <div className="flex bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => onSettingsChange({ ...settings, weight: 'imperial' })}
                             className={`w-1/2 p-2 text-sm rounded-md transition-colors ${settings.weight === 'imperial' ? 'bg-poke-blue text-white' : 'text-gray-400 hover:bg-slate-600'}`}
                        >
                            Pounds (lbs)
                        </button>
                        <button
                            onClick={() => onSettingsChange({ ...settings, weight: 'metric' })}
                             className={`w-1/2 p-2 text-sm rounded-md transition-colors ${settings.weight === 'metric' ? 'bg-poke-blue text-white' : 'text-gray-400 hover:bg-slate-600'}`}
                        >
                            Kilograms (kg)
                        </button>
                    </div>
                </div>
                
                <button
                    onClick={onClose}
                    className="w-full bg-poke-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

/**
 * The main application component for the Pokérole Team Builder.
 * It orchestrates the entire application, managing global state, data loading,
 * and rendering the main UI, including the Pokémon list, detail view, and dashboard.
 * It leverages the `useAppContext` hook to centralize state management.
 * @returns {React.FC} The root App component.
 */
const App: React.FC = () => {
    const { allPokemon, isLoading, error, loadData } = useGameDataStore();
    const { isPokemonListModalOpen, isSettingsOpen, isSuggestModalOpen, unitSettings, selectedPokemonId, mainView, setIsPokemonListModalOpen, setIsSettingsOpen, setUnitSettings, setIsSuggestModalOpen, selectPokemon, setMainView } = useUIStore();
    
    // --- NUOVI HOOK PER AUTH ---
    const { session, user, setUser, fetchSessionData, isDataLoaded, team, addSuggestionToTeam, clearUserData } = useSessionStore();

    // --- NUOVO useEffect PER L'AUTH ---
    useEffect(() => {
        // Carica i dati del gioco (pokedex, mosse, etc.) una sola volta
        loadData();

        // Controlla la sessione utente al caricamento dell'app
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null, session);
            if(session?.user) {
                fetchSessionData();
            }
        });

        // Ascolta i cambiamenti dello stato di autenticazione (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null, session);
            if(session?.user && !isDataLoaded) { // Se l'utente si logga, carica i suoi dati
                fetchSessionData();
            } else if (!session?.user) {
                // Resetta lo stato se l'utente fa logout
                clearUserData();
            }
        });

        return () => subscription.unsubscribe();
    }, [loadData, setUser, fetchSessionData, isDataLoaded, clearUserData]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                <PokeballIcon className="w-24 h-24 text-poke-yellow animate-spin" />
                <p className="mt-4 text-xl font-primary">Loading Pokédex...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center p-4">
                <PokeballIcon className="w-24 h-24 mb-4 text-poke-red opacity-70 animate-pulse-slow" />
                <h1 className="text-3xl font-bold text-poke-yellow font-primary">Oops! Something went wrong.</h1>
                <p className="mt-2 max-w-md text-gray-300">{error}</p>
                <button
                    onClick={loadData}
                    className="mt-6 px-6 py-2 bg-poke-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-poke-yellow"
                >
                    Try Again
                </button>
            </div>
        );
    }
    
    // --- NUOVA LOGICA DI RENDER ---
    // Se non c'è una sessione utente, mostra la schermata di login
    if (!session) {
        return <Auth />;
    }
    
    // Se la sessione c'è ma i dati non sono ancora stati caricati, mostra un loader
    if (!isDataLoaded) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                <PokeballIcon className="w-24 h-24 text-poke-yellow animate-spin" />
                <p className="mt-4 text-xl font-primary">Loading your session...</p>
            </div>
        );
    }

    // Se la sessione c'è e i dati sono caricati, mostra l'app
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
            <NotificationContainer />
            <PokemonListModal />
             <SuggestTeamModal
                isOpen={isSuggestModalOpen}
                onClose={() => setIsSuggestModalOpen(false)}
                allPokemon={allPokemon}
                team={team}
                onAddSuggestionToTeam={addSuggestionToTeam}
           />
            <SettingsModal
               isOpen={isSettingsOpen}
               onClose={() => setIsSettingsOpen(false)}
               settings={unitSettings}
              onSettingsChange={setUnitSettings}
           />
           <Headroom>
               <header className="w-full p-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
                   {/* --- HEADER SINISTRO - NUOVO PULSANTE LOGOUT --- */}
                   <div className="flex-1 flex justify-start">
                        <button
                           onClick={handleLogout}
                           className="flex items-center justify-center px-4 py-2 bg-poke-red text-white font-semibold text-sm rounded-lg hover:bg-red-700 transition-all"
                           title="Sign Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span className="hidden sm:inline ml-2">Logout</span>
                        </button>
                   </div>
                   <div className="flex-1 flex items-center justify-center">
                        <PokeballIcon className="w-8 h-8 md:w-10 md:h-10 mr-3 text-poke-red" />
                        <h1 className="text-2xl md:text-3xl font-bold text-poke-yellow tracking-wider font-primary text-center">
                            {mainView === 'gm' ? 'GM Tools' : 'Pokérole Team Builder'}
                        </h1>
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <button
                            onClick={() => setMainView(mainView === 'gm' ? 'dashboard' : 'gm')}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${mainView === 'gm' ? 'bg-poke-blue text-white' : 'bg-slate-700 text-gray-200 hover:bg-slate-600'}`}
                            aria-label={mainView === 'gm' ? "Return to Dashboard" : "Open GM Tools"}
                            title={mainView === 'gm' ? "Return to Dashboard" : "Open GM Tools"}
                        >
                            <DiceIcon className="w-5 h-5" />
                            <span className="hidden md:inline">
                                {mainView === 'gm' ? "Dashboard" : "GM Tools"}
                            </span>
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg bg-slate-700 text-gray-200 hover:bg-slate-600 transition-colors"
                            aria-label="Open settings"
                            title="Settings"
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    </div>
               </header>
            </Headroom>

            {mainView === 'dashboard' ? (
                <div className="flex flex-1 relative overflow-hidden">
                    <main className="flex-1 p-4 w-full">
                        <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                            {selectedPokemonId ? <PokemonDetail /> : <Dashboard />}
                        </div>
                    </main>
                </div>
            ) : (
                 <main className="flex-1 p-4 w-full">
                    <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                        <GMTools />
                    </div>
                </main>
            )}
        </div>
    );
};

export default App;