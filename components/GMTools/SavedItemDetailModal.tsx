// components/GMTools/SavedItemDetailModal.tsx

import React from 'react';
import { SavedEncounter, SavedNPC, NPCTrainer } from '../../src/types';
import { CloseIcon } from '../Icons';
import EncounterPokemonCard from './EncounterPokemonCard';
import { SKILLS, TRAINER_ATTRIBUTES } from '../../src/constants/gameConstants';

const StatDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="bg-slate-900/50 p-2 rounded-lg text-center shadow-inner w-full">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
        <div className="text-3xl font-bold text-white mt-1">{value}</div>
    </div>
);

const SkillDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex items-center justify-between bg-slate-700/60 px-3 py-1.5 rounded-lg shadow-sm text-white">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="font-bold text-lg bg-slate-900/50 rounded-full h-7 w-7 flex items-center justify-center">{value}</span>
    </div>
);

interface SavedItemDetailModalProps {
    item: SavedEncounter | SavedNPC;
    onClose: () => void;
}

const SavedItemDetailModal: React.FC<SavedItemDetailModalProps> = ({ item, onClose }) => {
    const isNpc = 'trainer' in item;

    const modalSizeClasses = isNpc
        ? "w-11/12 max-w-7xl h-5/6"
        : "w-full max-w-4xl max-h-[90vh]";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`bg-slate-800 rounded-lg shadow-xl flex flex-col ${modalSizeClasses}`}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-poke-yellow">{item.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isNpc ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-slate-900/40 p-4 rounded-lg flex flex-col items-center text-center">
                                <img src={item.trainer.spriteUrl} alt="Trainer Sprite" className="w-40 h-40 object-contain bg-slate-700/50 rounded-full p-1 mb-4 border-2 border-slate-600" />
                                <h3 className="text-3xl font-bold text-white">{item.trainer.name}</h3>
                                <p className="text-poke-yellow font-bold">{item.trainer.rank}</p>
                                <div className="w-full border-t border-slate-700 my-4"></div>
                                <h4 className="text-xl font-bold text-poke-yellow mb-3">Attributes</h4>
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    {TRAINER_ATTRIBUTES.map(attr => (
                                        <StatDisplay key={attr.field} label={attr.name} value={item.trainer[attr.field as keyof NPCTrainer] as number} />
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-900/40 p-4 rounded-lg">
                                    <h4 className="text-xl font-bold text-poke-yellow mb-3 text-center">Skills</h4>
                                    <div className="flex justify-around gap-x-4">
                                        {Object.entries(SKILLS).map(([category, skills]) => (
                                            <div key={category} className="space-y-2">
                                                <h5 className="text-center font-semibold text-gray-300 capitalize">{category}</h5>
                                                {skills.map(skill => (
                                                    <SkillDisplay key={skill.field} label={skill.name} value={item.trainer[skill.field as keyof NPCTrainer] as number} />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 p-4 rounded-lg">
                                    <h4 className="text-xl font-bold text-poke-yellow mb-3">Pokémon Team ({item.trainer.team.length})</h4>
                                    <div className="space-y-4">
                                        {item.trainer.team.map((pokemon, index) => (
                                            <EncounterPokemonCard
                                                key={`${pokemon.pokedexData.DexID}-${index}`}
                                                pokemon={{
                                                    instanceID: `${pokemon.pokedexData.DexID}-${index}`,
                                                    pokedexData: pokemon.pokedexData,
                                                    sheetData: pokemon.sheetData,
                                                    forms: {},
                                                    currentFormName: null,
                                                }}
                                                onUpdatePokemon={() => {}}
                                                isReadOnly={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {item.pokemon.map(p => (
                                <EncounterPokemonCard key={p.instanceID} pokemon={p} onUpdatePokemon={() => {}} isReadOnly={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedItemDetailModal;