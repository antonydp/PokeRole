// components/GMTools.tsx

import React, { useState } from 'react';
import RandomEncounterGenerator from './GMTools/RandomEncounterGenerator.js';
import NPCTrainerGenerator from './GMTools/NPCTrainerGenerator.js';

type Tool = 'encounter' | 'npc';

const GMTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('encounter');

    const getTabClassName = (tool: Tool) => {
        return `px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTool === tool
                ? 'bg-poke-blue text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
        }`;
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-3xl font-bold text-poke-yellow text-center mb-4 font-primary">
                Game Master Tools
            </h2>
            <div className="flex justify-center gap-4 mb-6 border-b border-slate-700 pb-4">
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
                {/* Add buttons for future tools here */}
                <button className="px-4 py-2 rounded-lg font-bold bg-slate-800 text-gray-500 cursor-not-allowed">
                    More Tools (Soon)
                </button>
            </div>
            <div className="flex-grow">
                {activeTool === 'encounter' && <RandomEncounterGenerator />}
                {activeTool === 'npc' && <NPCTrainerGenerator />}
                {/* Render other tools based on activeTool state here */}
            </div>
        </div>
    );
};

export default GMTools;