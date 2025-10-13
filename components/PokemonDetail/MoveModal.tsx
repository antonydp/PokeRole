import React from 'react';
import { Move, LearnableMove } from '../../src/types/index.js';
import { CloseIcon, LockIcon } from '../Icons.js';
import TypeBadge from '../TypeBadge.js';

interface MoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    learnableMoves: LearnableMove[];
    onSelectMove: (move: Move) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    showTutorMoves: boolean;
    onShowTutorMovesChange: (show: boolean) => void;
}

const MoveModal: React.FC<MoveModalProps> = ({
    isOpen,
    onClose,
    learnableMoves,
    onSelectMove,
    searchTerm,
    onSearchTermChange,
    showTutorMoves,
    onShowTutorMovesChange,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-lg font-bold text-poke-yellow text-center font-primary">Select a Move</h3>
                    <input
                        type="text"
                        placeholder="Search moves..."
                        value={searchTerm}
                        onChange={e => onSearchTermChange(e.target.value)}
                        className="w-full p-1.5 mt-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-poke-blue text-sm"
                    />
                    <div className="mt-1.5 text-center">
                        <button
                            onClick={() => onShowTutorMovesChange(!showTutorMoves)}
                            className="text-xs text-poke-yellow font-semibold hover:underline"
                        >
                            {showTutorMoves ? 'Hide Tutor Moves' : 'Show Tutor Moves'}
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto p-1.5">
                    {learnableMoves.length > 0 ? learnableMoves.map(({ move, isAvailable, requiredRank, isOverRanked, isTutorMove }) => (
                        <button
                            key={move._id}
                            onClick={() => onSelectMove(move)}
                            className={`w-full text-left p-2 my-0.5 bg-slate-700 rounded-md transition-colors flex justify-between items-center ${isOverRanked ? 'opacity-60 hover:bg-slate-600' : 'hover:bg-poke-blue'}`}
                        >
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-white text-sm">{move.Name}</p>
                                    {isTutorMove && <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full">Tutor</span>}
                                    {isOverRanked && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full">Over-Rank</span>}
                                </div>
                                <p className="text-xs text-gray-400 hidden sm:block mt-0.5 leading-tight">{move.Effect}</p>
                                {!isAvailable && requiredRank && (
                                    <div className="flex items-center gap-1 mt-1.5 text-poke-yellow text-xs font-semibold">
                                        <LockIcon className="w-3.5 h-3.5" />
                                        <span>Requires {requiredRank} Rank</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-1.5">
                                <TypeBadge type={move.Type} />
                                <p className="text-xs mt-0.5 text-gray-300">Pwr: {move.Power > 0 ? move.Power : '--'}</p>
                            </div>
                        </button>
                    )) : (
                        <p className="text-center text-gray-400 py-6 text-sm">No moves found.</p>
                    )}
                </div>
                <button onClick={onClose} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MoveModal;
