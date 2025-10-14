// components/GMTools/SavedItemsViewer.tsx

import React, { useState } from 'react';
import { useGameDataStore } from '../../src/store/useGameDataStore';
import { SavedEncounter, SavedNPC } from '../../src/types';
import { TrashIcon } from '../Icons';
import SavedItemDetailModal from './SavedItemDetailModal';

const SavedItemsViewer: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<SavedEncounter | SavedNPC | null>(null);
    const { savedEncounters, savedNPCs } = useGameDataStore();

    const handleRenameEncounter = (encounter: SavedEncounter) => {
        const newName = prompt("Enter a new name for the encounter:", encounter.name);
        if (newName && newName.trim() !== '') {
            useGameDataStore.setState(state => ({
                savedEncounters: state.savedEncounters.map(e => e.id === encounter.id ? { ...e, name: newName.trim() } : e)
            }));
        }
    };

    const handleRenameNPC = (npc: SavedNPC) => {
        const newName = prompt("Enter a new name for the NPC:", npc.name);
        if (newName && newName.trim() !== '') {
            useGameDataStore.setState(state => ({
                savedNPCs: state.savedNPCs.map(n => n.id === npc.id ? { ...n, name: newName.trim() } : n)
            }));
        }
    };

    const deleteEncounter = (id: string) => {
        useGameDataStore.setState(state => ({
            savedEncounters: state.savedEncounters.filter(e => e.id !== id)
        }));
    };

    const deleteNPC = (id: string) => {
        useGameDataStore.setState(state => ({
            savedNPCs: state.savedNPCs.filter(n => n.id !== id)
        }));
    };

    return (
        <>
            <div className="p-4 bg-gray-800 rounded-lg text-white">
                <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Saved Items</h2>
                <div className="flex flex-col gap-6">
                    {/* Saved Encounters */}
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-2">Saved Encounters</h3>
                        <div className="space-y-2">
                            {savedEncounters.length > 0 ? (
                                savedEncounters.map(encounter => (
                                    <div key={encounter.id} className="flex items-center justify-between bg-slate-700/60 p-2 rounded-lg">
                                        <button onClick={() => setSelectedItem(encounter)} className="font-semibold text-left hover:text-poke-yellow transition-colors">
                                            {encounter.name}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRenameEncounter(encounter)} className="text-gray-400 hover:text-poke-yellow transition-colors text-sm">
                                                Rename
                                            </button>
                                            <button onClick={() => deleteEncounter(encounter.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No saved encounters.</p>
                            )}
                        </div>
                    </div>

                    {/* Saved NPCs */}
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-2">Saved NPCs</h3>
                        <div className="space-y-2">
                            {savedNPCs.length > 0 ? (
                                savedNPCs.map(npc => (
                                    <div key={npc.id} className="flex items-center justify-between bg-slate-700/60 p-2 rounded-lg">
                                        <button onClick={() => setSelectedItem(npc)} className="font-semibold text-left hover:text-poke-yellow transition-colors">
                                            {npc.name}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleRenameNPC(npc)} className="text-gray-400 hover:text-poke-yellow transition-colors text-sm">
                                                Rename
                                            </button>
                                            <button onClick={() => deleteNPC(npc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No saved NPCs.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {selectedItem && (
                <SavedItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </>
    );
};

export default SavedItemsViewer;