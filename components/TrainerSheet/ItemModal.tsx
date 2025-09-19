import React, { useState, useMemo } from 'react';
import { ItemsData, Item, HealingItemsSubCategory } from '../../src/types/index.js';
import { CloseIcon } from '../Icons.js';

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemsData: ItemsData;
    onSelectItem: (item: Item) => void;
}

const ItemCard: React.FC<{ item: Item; onSelect: () => void; }> = ({ item, onSelect }) => {
    const imageUrl = item.image ? item.image : null;
    return (
        <button
            onClick={onSelect}
            className="w-full text-left p-2 my-1 bg-slate-700 rounded-lg hover:bg-poke-blue transition-colors flex items-center gap-3"
        >
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={item.name} 
                    className="w-10 h-10 object-contain bg-white/10 rounded-full p-1 flex-shrink-0" 
                    loading="lazy"
                    width="40"
                    height="40"
                />
            ) : (
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 font-bold text-lg">?</span>
                </div>
            )}
            <div>
                <p className="font-bold text-white">{item.name}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
            </div>
        </button>
    );
};

const AccordionSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 font-bold text-lg text-poke-yellow hover:bg-slate-700/50 transition-colors"
            >
                <span className="capitalize">{title.replace(/_/g, ' ')}</span>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-2 bg-slate-900/50">{children}</div>
            </div>
        </div>
    );
};

const CustomItemForm: React.FC<{
    onAddItem: (item: Item) => void;
    onBack: () => void;
}> = ({ onAddItem, onBack }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [usableInBattle, setUsableInBattle] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Item name is required.');
            return;
        }
        const customItem: Item = {
            name: name.trim(),
            description: description.trim(),
            usable_in_battle: usableInBattle,
            image: null,
        };
        onAddItem(customItem);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
                <label htmlFor="custom-item-name" className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                <input
                    id="custom-item-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                />
            </div>
            <div>
                <label htmlFor="custom-item-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    id="custom-item-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
            </div>
            <div className="flex items-center">
                <input
                    id="custom-item-usable"
                    type="checkbox"
                    checked={usableInBattle}
                    onChange={e => setUsableInBattle(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-poke-blue focus:ring-poke-blue"
                />
                <label htmlFor="custom-item-usable" className="ml-2 block text-sm text-gray-300">
                    Usable in battle? <span className="text-xs text-gray-400">(Goes to Small Pocket)</span>
                </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onBack} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors">
                    Back to List
                </button>
                <button type="submit" className="px-4 py-2 bg-poke-blue text-white rounded-md hover:bg-blue-600 transition-colors">
                    Add Item
                </button>
            </div>
        </form>
    );
};

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, itemsData, onSelectItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'list' | 'custom'>('list');

    const handleSelect = (item: Item) => {
        onSelectItem(item);
        onClose();
        setView('list'); // Reset view on close
    };

    const handleClose = () => {
        onClose();
        setView('list');
    };

    const filterItems = (items: Item[]): Item[] => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
        );
    };

    const renderedCategories = useMemo(() => {
        return Object.entries(itemsData.items).map(([category, content]) => {
            if (category === 'healing_items') {
                const healingSub = content as HealingItemsSubCategory;
                const potions = filterItems(healingSub.potions);
                const statusHeals = filterItems(healingSub.status_heals);
                if (potions.length === 0 && statusHeals.length === 0) return null;

                return (
                    <AccordionSection key={category} title={category}>
                        {potions.length > 0 && (
                            <>
                                <h4 className="text-md font-semibold text-gray-300 p-2">Potions</h4>
                                {potions.map(item => <ItemCard key={item.name} item={item} onSelect={() => handleSelect(item)} />)}
                            </>
                        )}
                         {statusHeals.length > 0 && (
                            <>
                                <h4 className="text-md font-semibold text-gray-300 p-2 mt-2">Status Heals</h4>
                                {statusHeals.map(item => <ItemCard key={item.name} item={item} onSelect={() => handleSelect(item)} />)}
                            </>
                        )}
                    </AccordionSection>
                );

            } else {
                const items = filterItems(content as Item[]);
                if (items.length === 0) return null;
                return (
                     <AccordionSection key={category} title={category}>
                        {items.map(item => <ItemCard key={item.name} item={item} onSelect={() => handleSelect(item)} />)}
                    </AccordionSection>
                );
            }
        }).filter(Boolean);

    }, [itemsData, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col font-sans" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                    <h3 className="text-xl font-bold text-poke-yellow text-center font-pixel">
                        {view === 'list' ? 'Add Item to Pockets' : 'Create Custom Item'}
                    </h3>
                    {view === 'list' && (
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 mt-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                        />
                    )}
                </div>

                {view === 'list' ? (
                     <>
                        <div className="overflow-y-auto">
                            {renderedCategories.length > 0 ? renderedCategories : (
                                <p className="text-center text-gray-400 py-8">No items found.</p>
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-700 bg-slate-800">
                            <button
                                onClick={() => setView('custom')}
                                className="w-full py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 transition-colors"
                            >
                                Create Custom Item
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="overflow-y-auto">
                        <CustomItemForm 
                            onAddItem={handleSelect}
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

export default ItemModal;