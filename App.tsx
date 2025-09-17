



import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Pokedex, Move, Ability, TeamMember, PokemonData, TrainerData, ItemsData, ItemInstance, Rank } from './types';
import { fetchAllData } from './services/pokedexService';
import PokemonList from './components/PokemonList';
import PokemonDetail from './components/PokemonDetail';
import Dashboard from './components/Dashboard';
import { PokeballIcon, MenuIcon, SettingsIcon } from './components/Icons';
import { createInitialSheetData, calculateWeaknesses, createInitialTrainerData } from './utils';

type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };

const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: UnitSettings;
    onSettingsChange: (settings: UnitSettings) => void;
}> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 font-sans" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-pixel text-poke-yellow mb-6 text-center">Settings</h2>
                
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

const App: React.FC = () => {
    const [allPokemon, setAllPokemon] = useState<Pokedex[]>([]);
    const [allMoves, setAllMoves] = useState<Record<string, Move>>({});
    const [allAbilities, setAllAbilities] = useState<Record<string, Ability>>({});
    const [allItems, setAllItems] = useState<ItemsData | null>(null);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [trainerData, setTrainerData] = useState<TrainerData>(createInitialTrainerData());
    const [selectedPokemon, setSelectedPokemon] = useState<Pokedex | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [unitSettings, setUnitSettings] = useState<UnitSettings>(() => {
        try {
            const saved = localStorage.getItem('pokerole-unit-settings');
            return saved ? JSON.parse(saved) : { height: 'imperial', weight: 'imperial' };
        } catch (e) {
            console.error("Failed to parse unit settings from localStorage", e);
            return { height: 'imperial', weight: 'imperial' };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('pokerole-unit-settings', JSON.stringify(unitSettings));
        } catch (e) {
            console.error("Failed to save unit settings to localStorage", e);
        }
    }, [unitSettings]);
    
    useEffect(() => {
        setTeam(prevTeam =>
            prevTeam.map(member => {
                const { pokedexData } = member;
                const feet = Math.floor(pokedexData.Height.Feet);
                const inches = Math.round((pokedexData.Height.Feet % 1) * 12);
                
                const newSize = unitSettings.height === 'imperial'
                    ? `${feet}'${inches}"`
                    : `${pokedexData.Height.Meters}m`;
                
                const newWeight = unitSettings.weight === 'imperial'
                    ? `${pokedexData.Weight.Pounds} lbs`
                    : `${pokedexData.Weight.Kilograms}kg`;
                
                return {
                    ...member,
                    sheetData: {
                        ...member.sheetData,
                        size: newSize,
                        weight: newWeight,
                    }
                };
            })
        );
    }, [unitSettings]);


    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { pokemonData, movesData, abilitiesData, itemsData } = await fetchAllData();
            
            const movesMap = movesData.reduce((acc, move) => {
                acc[move._id] = move;
                return acc;
            }, {} as Record<string, Move>);

            const abilitiesMap = abilitiesData.reduce((acc, ability) => {
                acc[ability._id] = ability;
                return acc;
            }, {} as Record<string, Ability>);

            setAllPokemon(pokemonData);
            setAllMoves(movesMap);
            setAllAbilities(abilitiesMap);
            setAllItems(itemsData);
        } catch (err) {
            setError('Failed to fetch Pokémon data. The servers might be down or your connection is unstable. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleSelectPokemon = useCallback((pokemon: Pokedex) => {
        setSelectedPokemon(pokemon);
        setIsSidebarOpen(false);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPokemon(null);
    }, []);

    const handleAddToTeam = useCallback((pokemon: Pokedex, sheetData: PokemonData) => {
        if (team.length < 6 && !team.some(member => member.pokedexData.DexID === pokemon.DexID)) {
            const newMember: TeamMember = {
                pokedexData: pokemon,
                sheetData: sheetData,
            };
            setTeam(prevTeam => [...prevTeam, newMember]);
        }
    }, [team]);

    const handleRemoveFromTeam = useCallback((pokemon: Pokedex) => {
        setTeam(prevTeam => prevTeam.filter(member => member.pokedexData.DexID !== pokemon.DexID));
    }, []);
    
    const handleAddPokemonClick = useCallback(() => {
        setIsSidebarOpen(true);
    }, []);
    
    const handleSheetDataChange = useCallback((pokemonDexID: string, newSheetData: PokemonData) => {
        setTeam(prevTeam =>
            prevTeam.map(member =>
                member.pokedexData.DexID === pokemonDexID
                    ? { ...member, sheetData: newSheetData }
                    : member
            )
        );
    }, []);

    const handleTrainerDataChange = useCallback((data: TrainerData) => {
        setTrainerData(data);
    }, []);

    const handleExportTeam = useCallback(() => {
        if (team.length === 0 && !trainerData.name) {
            alert("Your team and trainer sheet are empty!");
            return;
        }
        try {
            const dataStr = JSON.stringify({ team, trainer: trainerData, unitSettings }, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pokerole-session.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to export data. Please try again.');
            console.error('Export error:', err);
        }
    }, [team, trainerData, unitSettings]);
    
    const handleLoadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleLoadTeam = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') {
                    throw new Error("File content could not be read as text.");
                }
                const loadedData = JSON.parse(content);
                const loadedTeam: TeamMember[] = loadedData.team || []; 
                const loadedSettings: UnitSettings | undefined = loadedData.unitSettings;
                const loadedTrainer: TrainerData | undefined = loadedData.trainer;

                if (!Array.isArray(loadedTeam)) {
                     throw new Error("Invalid team data format.");
                }

                if (loadedTeam.some(m => !m.pokedexData || !m.sheetData)) {
                     throw new Error("Invalid Pokémon data within the team file.");
                }
                
                if (loadedSettings) {
                    setUnitSettings(loadedSettings);
                }

                if (loadedTrainer) {
                    // Backwards compatibility migration for pockets
                    const parsePocketString = (pocketString: string): ItemInstance[] => {
                        if (!pocketString || typeof pocketString !== 'string') return [];
                        const itemMap = new Map<string, number>();
                        const itemLines = pocketString.split('\n');
                        
                        itemLines.forEach(line => {
                            if (!line.trim()) return;
                            const match = line.match(/^(.*)\s+x(\d+)$/i);
                            let name = line.trim();
                            let quantity = 1;
                            if (match) {
                                name = match[1].trim();
                                quantity = parseInt(match[2], 10);
                            }
                            itemMap.set(name, (itemMap.get(name) || 0) + quantity);
                        });
                        
                        return Array.from(itemMap.entries()).map(([name, quantity], index) => ({
                            id: `${name.replace(/\s+/g, '-')}-${index}`,
                            name,
                            quantity,
                        }));
                    };

                    if (typeof (loadedTrainer.smallPocket as any) === 'string') {
                        loadedTrainer.smallPocket = parsePocketString(loadedTrainer.smallPocket as any);
                    }
                    if (typeof (loadedTrainer.mainPocket as any) === 'string') {
                         loadedTrainer.mainPocket = parsePocketString(loadedTrainer.mainPocket as any);
                    }
                    setTrainerData(loadedTrainer);
                } else {
                    setTrainerData(createInitialTrainerData());
                }

                const teamWithUpdatedWeaknesses = loadedTeam.map(member => {
                    if (!member.pokedexData) return member;
                    const weakness = calculateWeaknesses(member.pokedexData.Type1, member.pokedexData.Type2);
                    return {
                        ...member,
                        sheetData: {
                            ...member.sheetData,
                            weakness,
                        }
                    };
                });


                setTeam(teamWithUpdatedWeaknesses.slice(0, 6)); 
                setError(null);
                setSelectedPokemon(null);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError("Failed to load data. The file might be corrupted or in an incorrect format.");
            }
        };
        reader.onerror = () => {
             setError("Failed to read the selected file.");
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }, []);

    const isPokemonInTeam = useMemo(() => {
        if (!selectedPokemon) return false;
        return team.some(member => member.pokedexData.DexID === selectedPokemon.DexID);
    }, [selectedPokemon, team]);
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                <PokeballIcon className="w-24 h-24 text-poke-yellow animate-spin" />
                <p className="mt-4 text-xl font-pixel">Loading Pokédex...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center p-4">
                <PokeballIcon className="w-24 h-24 mb-4 text-poke-red opacity-70 animate-pulse-slow" />
                <h1 className="text-3xl font-bold text-poke-yellow font-pixel">Oops! Something went wrong.</h1>
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
             <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={unitSettings}
                onSettingsChange={setUnitSettings}
             />
            <header className="w-full p-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-700/50">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-md text-gray-300 hover:bg-slate-700 hover:text-white transition-colors z-50"
                    aria-label="Toggle Pokémon List"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <PokeballIcon className="w-8 h-8 md:w-10 md:h-10 mr-3 text-poke-red" />
                    <h1 className="text-2xl md:text-3xl font-bold text-poke-yellow tracking-wider font-pixel">Pokérole Team Builder</h1>
                </div>
                 <div className="flex items-center gap-2">
                     <button
                        onClick={handleExportTeam}
                        className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white font-pixel text-xs rounded-md border-b-2 border-green-800 hover:bg-green-500 active:translate-y-px active:border-b-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow"
                        aria-label="Export Session Data"
                        title="Export Session Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="hidden sm:inline ml-1.5">Export</span>
                    </button>
                    <button
                        onClick={handleLoadClick}
                        className="flex items-center justify-center px-3 py-1.5 bg-poke-yellow text-slate-900 font-pixel text-xs rounded-md border-b-2 border-yellow-600 hover:bg-yellow-400 active:translate-y-px active:border-b-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow"
                        aria-label="Load Session Data"
                        title="Load Session Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="hidden sm:inline ml-1.5">Load</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLoadTeam}
                        accept="application/json,.json"
                        className="hidden"
                        aria-hidden="true"
                    />
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 rounded-md text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label="Open settings"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden">
                <div
                    className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
                <aside className={`
                    flex-shrink-0 bg-slate-800/80 backdrop-blur-sm 
                    transform transition-transform duration-300 ease-in-out
                    fixed top-16 left-0 h-[calc(100vh-64px)] w-80 z-40
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                }>
                    <div className="h-full p-2">
                        <div className="bg-slate-800/50 rounded-lg h-full overflow-y-auto">
                            <PokemonList allPokemon={allPokemon} onSelectPokemon={handleSelectPokemon} />
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-4 w-full">
                    <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                        {selectedPokemon ? (
                            <PokemonDetail 
                                pokemon={selectedPokemon}
                                allMoves={allMoves}
                                onClose={handleClearSelection}
                                onAddToTeam={handleAddToTeam}
                                onRemoveFromTeam={handleRemoveFromTeam}
                                isInTeam={isPokemonInTeam}
                                teamIsFull={team.length >= 6}
                                sheetData={team.find(member => member.pokedexData.DexID === selectedPokemon.DexID)?.sheetData}
                                onSheetDataChange={handleSheetDataChange}
                                unitSettings={unitSettings}
                                trainerRank={trainerData.trainerRank}
                            />
                        ) : (
                            <Dashboard 
                                team={team} 
                                onSelectPokemon={handleSelectPokemon} 
                                onRemoveFromTeam={handleRemoveFromTeam}
                                onAddPokemonClick={handleAddPokemonClick}
                                trainerData={trainerData}
                                onTrainerDataChange={handleTrainerDataChange}
                                allItems={allItems}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;