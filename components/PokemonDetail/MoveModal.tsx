import React from 'react';
import { Move, LearnableMove } from '../../types';
import { CloseIcon, LockIcon } from '../Icons';
import TypeBadge from '../TypeBadge';

interface MoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    learnableMoves: LearnableMove[];
    onSelectMove: (move: Move) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const MoveModal: React.FC<MoveModalProps> = ({
    isOpen,
    onClose,
    learnableMoves,
    onSelectMove,
    searchTerm,
    onSearchTermChange,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-xl font-bold text-poke-yellow text-center font-pixel">Select a Move</h3>
                    <input
                        type="text"
                        placeholder="Search moves..."
                        value={searchTerm}
                        onChange={e => onSearchTermChange(e.target.value)}
                        className="w-full p-2 mt-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                    />
                </div>
                <div className="overflow-y-auto p-2">
                    {learnableMoves.length > 0 ? learnableMoves.map(({ move, isAvailable, requiredRank }) => (
                        <button
                            key={move._id}
                            onClick={() => onSelectMove(move)}
                            disabled={!isAvailable}
                            className={`w-full text-left p-3 my-1 bg-slate-700 rounded-lg transition-colors flex justify-between items-center ${isAvailable ? 'hover:bg-poke-blue' : 'opacity-60 cursor-not-allowed'}`}
                        >
                            <div>
                                <p className="font-bold text-white">{move.Name}</p>
                                <p className="text-sm text-gray-400 hidden sm:block">{move.Effect}</p>
                                {!isAvailable && requiredRank && (
                                    <div className="flex items-center gap-1.5 mt-2 text-poke-yellow text-xs font-semibold">
                                        <LockIcon className="w-4 h-4" />
                                        <span>Requires {requiredRank} Rank</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <TypeBadge type={move.Type} />
                                <p className="text-xs mt-1 text-gray-300">Pwr: {move.Power > 0 ? move.Power : '--'}</p>
                            </div>
                        </button>
                    )) : (
                        <p className="text-center text-gray-400 py-8">No moves found.</p>
                    )}
                </div>
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MoveModal;