import React from 'react';
import { useUIStore } from '../src/store/useUIStore.js';
import PokemonList from './PokemonList.js';

const PokemonListModal: React.FC = () => {
    const { isPokemonListModalOpen, setIsPokemonListModalOpen } = useUIStore();

    if (!isPokemonListModalOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={() => setIsPokemonListModalOpen(false)}
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] p-4 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-primary text-poke-yellow mb-4 text-center">Add a Pokémon</h2>
                <div className="bg-slate-800/50 rounded-lg h-full overflow-y-auto">
                    <PokemonList isOpen={isPokemonListModalOpen} />
                </div>
            </div>
        </div>
    );
};

export default PokemonListModal;