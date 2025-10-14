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
    const { team, exportTeam, loadTeam, addSuggestionToTeam } = useSessionStore();

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
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
                   <div className="flex-1 flex justify-start items-center gap-2">
                       <button
                           onClick={exportTeam}
                        className="flex items-center justify-center px-4 py-2 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow"
                        aria-label="Export Session Data"
                        title="Export Session Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="hidden sm:inline ml-2">Export</span>
                    </button>
                    <button
                        onClick={handleLoadClick}
                        className="flex items-center justify-center px-4 py-2 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow"
                        aria-label="Load Session Data"
                        title="Load Session Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="hidden sm:inline ml-2">Load</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={loadTeam}
                        accept="application/json,.json"
                        className="hidden"
                        aria-hidden="true"
                    />
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