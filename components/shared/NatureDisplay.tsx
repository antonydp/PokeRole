import React from 'react';

interface NatureDisplayProps {
    nature: string | undefined;
    confidence: string | undefined;
    onOpenNatureModal: () => void;
    variant?: 'default' | 'compact';
}

const NatureDisplay: React.FC<NatureDisplayProps> = ({ nature, confidence, onOpenNatureModal, variant = 'default' }) => {
    if (variant === 'compact') {
        return (
            <div onClick={onOpenNatureModal} className="cursor-pointer h-full flex items-center justify-center p-0 rounded-md overflow-hidden">
                <div className="h-full flex-1 flex flex-col justify-center p-2 hover:bg-white/10 transition-colors">
                    <label className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Nature</label>
                    <div className="text-white font-primary text-sm truncate">
                        {nature || 'Select...'}
                    </div>
                </div>
                <div className="w-px h-4/5 bg-white/20"></div>
                <div className="h-full flex-1 flex flex-col justify-center p-2 hover:bg-white/10 transition-colors text-right">
                    <label className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Confidence</label>
                    <div className="text-white/80 font-primary text-sm">
                        {confidence || 'N/A'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#3A3A3A] rounded-2xl p-2 font-primary space-y-2">
            <div className="bg-white rounded-xl flex items-center px-3 py-1.5">
                <label htmlFor="pokemonNature" className="text-[#3A3A3A] font-bold text-sm uppercase mr-2 flex-shrink-0">
                    NATURE:
                </label>
                <button
                    id="pokemonNature"
                    onClick={onOpenNatureModal}
                    className="w-full bg-transparent focus:outline-none font-sans text-sm text-black p-0 text-left hover:opacity-70 transition-opacity"
                >
                    {nature || 'Select Nature...'}
                </button>
            </div>
            <div className="flex items-stretch gap-2">
                <label htmlFor="confidence" className="text-white font-bold text-sm uppercase flex items-center justify-start px-1 flex-shrink-0">
                    CONFIDENCE
                </label>
                <input
                    id="confidence"
                    type="text"
                    value={confidence || ''}
                    readOnly
                    className="w-full bg-white rounded-xl px-2 py-1.5 text-black text-sm font-sans focus:outline-none border-2 border-[#3A3A3A] cursor-default"
                />
            </div>
        </div>
    );
};

export default NatureDisplay;