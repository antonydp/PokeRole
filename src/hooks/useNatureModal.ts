import { useState, useMemo, useCallback } from 'react';
import { NATURES } from '../constants/gameConstants.js';
import type { Nature } from '../types/index.js';

export function useNatureModal() {
    const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
    const [natureSearchTerm, setNatureSearchTerm] = useState('');

    const openNatureModal = useCallback(() => {
        setNatureSearchTerm('');
        setIsNatureModalOpen(true);
    }, []);

    const closeNatureModal = useCallback(() => {
        setIsNatureModalOpen(false);
    }, []);

    const filteredNatures = useMemo(() => {
        const term = natureSearchTerm.toLowerCase();
        if (!term) return NATURES;
        return NATURES.filter(nature =>
            nature.name.toLowerCase().includes(term) ||
            nature.keywords.toLowerCase().includes(term)
        );
    }, [natureSearchTerm]);

    return {
        isNatureModalOpen,
        closeNatureModal,
        openNatureModal,
        natureSearchTerm,
        setNatureSearchTerm,
        filteredNatures,
    };
}