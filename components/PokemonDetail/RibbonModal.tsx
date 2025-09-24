import React from 'react';
import { Ribbon } from '../../src/types/index.js';
import { CloseIcon } from '../Icons.js';

interface RibbonModalProps {
    isOpen: boolean;
    onClose: () => void;
    allRibbons: Ribbon[];
    onSelectRibbon: (ribbon: Ribbon) => void;
}

const RibbonModal: React.FC<RibbonModalProps> = ({
    isOpen,
    onClose,
    allRibbons,
    onSelectRibbon,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-xl font-bold text-poke-yellow text-center font-primary">Select a Ribbon</h3>
                </div>
                <div className="overflow-y-auto p-4">
                    <div className="grid grid-cols-6 gap-2">
                        {allRibbons.map((ribbon) => (
                            <button
                                key={ribbon.name}
                                onClick={() => onSelectRibbon(ribbon)}
                                className="p-2 bg-slate-700 rounded-lg transition-colors hover:bg-poke-blue focus:outline-none focus:ring-2 focus:ring-poke-blue"
                                title={`${ribbon.name}: ${ribbon.description}`}
                            >
                                <img src={ribbon.image_url} alt={ribbon.name} className="w-full h-full object-contain" />
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default RibbonModal;