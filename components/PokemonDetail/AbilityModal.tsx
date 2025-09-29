import React, { useState, useMemo } from 'react';
import { Ability } from '../../src/types/index.js';
import { CloseIcon } from '../Icons.js';
import Fuse from 'fuse.js';

interface AbilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    pokemonAbilities: string[];
    allAbilities: Ability[];
    onSelectAbility: (ability: string) => void;
}

const AbilityModal: React.FC<AbilityModalProps> = ({
    isOpen,
    onClose,
    pokemonAbilities,
    allAbilities,
    onSelectAbility,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customAbility, setCustomAbility] = useState('');

    const otherAbilities = useMemo(() => {
        return allAbilities.filter(ab => !pokemonAbilities.includes(ab.Name));
    }, [allAbilities, pokemonAbilities]);

    const fuse = useMemo(() => new Fuse(otherAbilities, {
        keys: ['Name', 'Effect'],
        threshold: 0.3,
    }), [otherAbilities]);

    const filteredAbilities = useMemo(() => {
        if (!searchTerm.trim()) {
            return otherAbilities;
        }
        return fuse.search(searchTerm).map(result => result.item);
    }, [otherAbilities, searchTerm, fuse]);

    if (!isOpen) return null;

    const handleSelect = (ability: string) => {
        onSelectAbility(ability);
        onClose();
    };
    
    const handleCustomAbilitySubmit = () => {
        if (customAbility.trim()) {
            handleSelect(customAbility.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-xl font-bold text-poke-yellow text-center font-primary">Select an Ability</h3>
                    <input
                        type="text"
                        placeholder="Search abilities..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 mt-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                    />
                </div>
                <div className="overflow-y-auto p-4">
                    {/* Pokemon's Abilities */}
                    <div className="mb-4">
                        <h4 className="text-lg font-bold text-white mb-2 font-primary">Pokémon's Abilities</h4>
                        <div className="flex flex-wrap gap-2">
                            {pokemonAbilities.map(abilityName => {
                                const abilityData = allAbilities.find(ab => ab.Name === abilityName);
                                return (
                                    <button
                                        key={abilityName}
                                        onClick={() => handleSelect(abilityName)}
                                        className="px-3 py-1 bg-poke-blue text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                                        title={abilityData?.Effect}
                                    >
                                        {abilityName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Other Abilities */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2 font-primary">Other Abilities</h4>
                        <div className="flex flex-wrap gap-2">
                            {filteredAbilities.map(ability => (
                                <button
                                    key={ability._id}
                                    onClick={() => handleSelect(ability.Name)}
                                    className="px-3 py-1 bg-slate-600 text-white rounded-full text-sm hover:bg-slate-500 transition-colors"
                                    title={ability.Effect}
                                >
                                    {ability.Name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 sticky bottom-0 bg-slate-800">
                     <h4 className="text-lg font-bold text-white mb-2 font-primary">Custom Ability</h4>
                     <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter custom ability"
                            value={customAbility}
                            onChange={e => setCustomAbility(e.target.value)}
                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                        />
                        <button onClick={handleCustomAbilitySubmit} className="px-4 py-2 bg-poke-green text-white rounded-lg hover:bg-green-700 transition-colors font-bold">
                            Set
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default AbilityModal;