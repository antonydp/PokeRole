import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Badge } from '../../src/types/index.js';
import { CloseIcon } from '../Icons.js';
import Fuse from 'fuse.js';
import LazyImage from '../shared/LazyImage.js';

interface BadgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    allBadges: Badge[];
    onSelectBadge: (badge: Badge) => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({
    isOpen,
    onClose,
    allBadges,
    onSelectBadge,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const fuse = useMemo(() => new Fuse(allBadges, {
        keys: ['name', 'description'],
        threshold: 0.2,
    }), [allBadges]);

    const filteredBadges = useMemo(() => {
        if (!searchTerm.trim()) {
            return allBadges;
        }
        return fuse.search(searchTerm).map(result => result.item);
    }, [allBadges, searchTerm, fuse]);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
                    <h3 className="text-xl font-bold text-poke-yellow text-center font-primary">Select a Badge</h3>
                    <input
                        type="text"
                        placeholder="Search badges..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 mt-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                    />
                </div>
                <div ref={scrollContainerRef} className="overflow-y-auto p-4">
                    <div className="grid grid-cols-6 gap-2">
                        {filteredBadges.map((badge, index) => (
                            <button
                                key={`${badge.name}-${badge.description}-${index}`}
                                onClick={() => onSelectBadge(badge)}
                                className="p-2 bg-slate-700 rounded-lg transition-colors hover:bg-poke-blue focus:outline-none focus:ring-2 focus:ring-poke-blue aspect-square"
                                title={`${badge.name}: ${badge.description}`}
                            >
                                <LazyImage
                                    src={badge.image_url}
                                    alt={badge.name}
                                    className="w-full h-full object-contain"
                                    placeholderSrc="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // 1x1 transparent gif
                                    scrollContainerRef={scrollContainerRef}
                                />
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

export default BadgeModal;