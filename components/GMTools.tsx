// components/GMTools.tsx

import React, { useState } from 'react';
import RandomEncounterGenerator from './GMTools/RandomEncounterGenerator.js';
import NPCTrainerGenerator from './GMTools/NPCTrainerGenerator.js';
import SavedItemsViewer from './GMTools/SavedItemsViewer.js';

type Tool = 'encounter' | 'npc' | 'saved';

const GMTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('encounter');

    const getTabClassName = (tool: Tool) => {
        const base = "px-4 sm:px-6 py-3 font-primary text-base sm:text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:z-10 flex items-center gap-2";
        if (activeTool === tool) {
            return `${base} bg-slate-700/80 text-poke-yellow border-b-4 border-poke-yellow`;
        }
        return `${base} text-gray-400 hover:text-white hover:bg-slate-700/50`;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center border-b-2 border-slate-700/80">
                <button
                    onClick={() => setActiveTool('encounter')}
                    className={getTabClassName('encounter')}
                >
                    Random Encounter
                </button>
                <button
                    onClick={() => setActiveTool('npc')}
                    className={getTabClassName('npc')}
                >
                    NPC Trainer Generator
                </button>
                <button
                    onClick={() => setActiveTool('saved')}
                    className={getTabClassName('saved')}
                >
                    Saved Items
                </button>
            </div>
            <div className="flex-grow pt-4">
                {activeTool === 'encounter' && <RandomEncounterGenerator />}
                {activeTool === 'npc' && <NPCTrainerGenerator />}
                {activeTool === 'saved' && <SavedItemsViewer />}
            </div>
        </div>
    );
};

export default GMTools;