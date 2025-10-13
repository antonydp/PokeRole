import React, { useState, useMemo } from 'react';
import { Grid, type CellComponentProps } from 'react-window';
import { Sprite } from '../../src/types';
import { SearchIcon, ExclamationTriangleIcon } from '../Icons';

interface SpriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    allSprites: Sprite[];
    onSelectSprite: (spriteUrl: string) => void;
}

const SpriteModal: React.FC<SpriteModalProps> = ({ isOpen, onClose, allSprites, onSelectSprite }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [urlError, setUrlError] = useState<string | null>(null);

    const filteredSprites = useMemo(() => {
        if (!searchTerm) {
            return allSprites;
        }
        return allSprites.filter(sprite =>
            sprite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sprite.author?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allSprites, searchTerm]);

    if (!isOpen) {
        return null;
    }

    const handleAddCustomUrl = () => {
        if (customUrl.trim() === '') {
            setUrlError('URL cannot be empty.');
            return;
        }
        // Basic URL validation
        try {
            new URL(customUrl);
            onSelectSprite(customUrl);
            setCustomUrl('');
            setUrlError(null);
            onClose();
        } catch (_) {
            setUrlError('Please enter a valid URL.');
        }
    };

    const columnCount = 7;
    const rowCount = Math.ceil(filteredSprites.length / columnCount);
    const itemWidth = 130;
    const itemHeight = 150;

    const Cell = ({ columnIndex, rowIndex, style, ariaAttributes, sprites }: CellComponentProps<{ sprites: Sprite[] }>) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= sprites.length) {
            return null;
        }
        const sprite = sprites[index];
        return (
            <div style={style} {...ariaAttributes} className="flex flex-col items-center justify-center p-2">
                <div
                    className="w-24 h-24 bg-gray-700/50 rounded-lg border-2 border-white/20 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-poke-yellow transition-colors group"
                    onClick={() => onSelectSprite(sprite.spriteUrl)}
                >
                    <img src={sprite.spriteUrl} alt={sprite.name} className="object-contain w-full h-full" />
                </div>
                <div className="text-center mt-1">
                    <p className="text-sm font-bold truncate">{sprite.name}</p>
                    <p className="text-xs text-gray-400 truncate">{sprite.author || 'Unknown'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800/90 border border-gray-700/50 rounded-2xl shadow-2xl h-[85vh] flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold mb-4 text-white font-primary">Select a Sprite</h2>

                {/* Search and Custom URL */}
                <div className="flex items-center mb-4 gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or author..."
                            className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-poke-yellow focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Or add a custom URL"
                            className={`w-72 bg-gray-900/50 border ${urlError ? 'border-red-500' : 'border-gray-600/50'} rounded-lg px-4 py-2 text-white focus:ring-2 ${urlError ? 'focus:ring-red-500' : 'focus:ring-poke-yellow'} focus:outline-none transition-all`}
                            value={customUrl}
                            onChange={(e) => {
                                setCustomUrl(e.target.value);
                                if (urlError) setUrlError(null);
                            }}
                        />
                        <button
                            className="bg-poke-yellow text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                            onClick={handleAddCustomUrl}
                            disabled={!customUrl.trim()}
                        >
                            Add
                        </button>
                    </div>
                </div>
                {urlError && (
                    <div className="flex items-center text-red-400 mb-4">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        <span>{urlError}</span>
                    </div>
                )}

                {/* Grid */}
                <div className="flex-grow h-0">
                    {filteredSprites.length > 0 ? (
                         <Grid
                            cellComponent={Cell}
                            cellProps={{ sprites: filteredSprites }}
                            columnCount={columnCount}
                            columnWidth={itemWidth}
                            rowCount={rowCount}
                            rowHeight={itemHeight}
                         />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ExclamationTriangleIcon className="w-16 h-16 mb-4" />
                            <p className="text-xl">No sprites found.</p>
                            <p>Try adjusting your search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpriteModal;