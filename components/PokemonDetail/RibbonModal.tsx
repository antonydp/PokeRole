import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ribbon } from '../../src/types/index.js';
import { CloseIcon } from '../Icons.js';
import Fuse from 'fuse.js';
import LazyImage from '../shared/LazyImage.js';

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
    const [searchTerm, setSearchTerm] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const fuse = useMemo(() => new Fuse(allRibbons, {
        keys: ['name', 'description'],
        threshold: 0.2,
    }), [allRibbons]);

    const filteredRibbons = useMemo(() => {
        if (!searchTerm.trim()) {
            return allRibbons;
        }
        return fuse.search(searchTerm).map(result => result.item);
    }, [allRibbons, searchTerm, fuse]);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-lg font-bold text-poke-yellow text-center font-primary">Select a Ribbon</h3>
                    <input
                        type="text"
                        placeholder="Search ribbons..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-1.5 mt-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-poke-blue text-sm"
                    />
                </div>
                <div ref={scrollContainerRef} className="overflow-y-auto p-3">
                    <div className="grid grid-cols-8 gap-1.5">
                        {filteredRibbons.map((ribbon, index) => (
                            <button
                                key={`${ribbon.name}-${ribbon.description}-${index}`}
                                onClick={() => onSelectRibbon(ribbon)}
                                className="p-1 bg-slate-700 rounded-md transition-colors hover:bg-poke-blue focus:outline-none focus:ring-2 focus:ring-poke-blue aspect-square"
                                title={`${ribbon.name}: ${ribbon.description}`}
                            >
                                <LazyImage
                                    src={ribbon.image_url}
                                    alt={ribbon.name}
                                    className="w-full h-full object-contain"
                                    placeholderSrc="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // 1x1 transparent gif
                                    scrollContainerRef={scrollContainerRef}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default RibbonModal;
