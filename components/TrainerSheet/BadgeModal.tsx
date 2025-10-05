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

const CustomBadgeForm: React.FC<{
    onAddBadge: (badge: Badge) => void;
    onBack: () => void;
}> = ({ onAddBadge, onBack }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !imageUrl.trim()) {
            alert('Badge name and Image URL are required.');
            return;
        }
        const customBadge: Badge = {
            name: name.trim(),
            description: description.trim(),
            image_url: imageUrl.trim(),
        };
        onAddBadge(customBadge);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
                <label htmlFor="custom-badge-name" className="block text-sm font-medium text-gray-300 mb-1">Badge Name</label>
                <input
                    id="custom-badge-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="custom-badge-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    id="custom-badge-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
            </div>
            <div>
                <label htmlFor="custom-badge-url" className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                    id="custom-badge-url"
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onBack} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors">
                    Back to List
                </button>
                <button type="submit" className="px-4 py-2 bg-poke-blue text-white rounded-md hover:bg-blue-600 transition-colors">
                    Add Badge
                </button>
            </div>
        </form>
    );
};


const BadgeModal: React.FC<BadgeModalProps> = ({
    isOpen,
    onClose,
    allBadges,
    onSelectBadge,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'list' | 'custom'>('list');
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

    const handleSelect = (badge: Badge) => {
        onSelectBadge(badge);
        onClose();
        setView('list');
    };

    const handleClose = () => {
        onClose();
        setView('list');
    };

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setView('list');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                    <h3 className="text-xl font-bold text-poke-yellow text-center font-primary">
                        {view === 'list' ? 'Select a Badge' : 'Create Custom Badge'}
                    </h3>
                    {view === 'list' && (
                        <input
                            type="text"
                            placeholder="Search badges..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 mt-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                        />
                    )}
                </div>

                {view === 'list' ? (
                    <>
                        <div ref={scrollContainerRef} className="overflow-y-auto p-4">
                            <div className="grid grid-cols-6 gap-2">
                                {filteredBadges.map((badge, index) => (
                                    <button
                                        key={`${badge.name}-${badge.description}-${index}`}
                                        onClick={() => handleSelect(badge)}
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
                        <div className="p-3 border-t border-slate-700 bg-slate-800">
                            <button
                                onClick={() => setView('custom')}
                                className="w-full py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 transition-colors"
                            >
                                Create Custom Badge
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="overflow-y-auto">
                        <CustomBadgeForm
                            onAddBadge={handleSelect}
                            onBack={() => setView('list')}
                        />
                    </div>
                )}

                <button onClick={handleClose} className="absolute top-2 right-2 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default BadgeModal;