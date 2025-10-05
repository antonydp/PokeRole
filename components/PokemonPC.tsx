import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSessionStore } from '../src/store/useSessionStore.js';
import { useUIStore } from '../src/store/useUIStore.js';
import { TeamMember } from '../src/types/index.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';
import TypeBadge from './TypeBadge.js';
import { PokeballIcon } from './Icons.js';

const SortablePokemonItem = ({ member, onSelect }: { member: TeamMember, onSelect: (dexId: string, instanceId: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: member.instanceID });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onSelect(member.pokedexData.DexID, member.instanceID)}
            className="bg-slate-700/80 p-2 rounded-lg flex items-center gap-4 touch-none cursor-pointer hover:bg-slate-700 transition-colors"
        >
            <img src={`${IMAGE_BASE_URL}${member.pokedexData.Image}`} alt={member.pokedexData.Name} className="w-16 h-16" />
            <div className="flex-grow">
                <p className="font-bold text-white">{member.sheetData.pokemonName || member.pokedexData.Name}</p>
                <div className="flex gap-1 mt-1">
                    <TypeBadge type={member.pokedexData.Type1} />
                    {member.pokedexData.Type2 && <TypeBadge type={member.pokedexData.Type2} />}
                </div>
            </div>
        </div>
    );
};

const PokemonContainer = ({ id, title, items, onAddClick, onSelectPokemon }: { id: string, title: string, items: TeamMember[], onAddClick?: () => void, onSelectPokemon: (dexId: string, instanceId: string) => void }) => {
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg w-full">
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-2xl font-bold font-primary text-poke-yellow text-center">{title}</h2>
                {onAddClick && (
                    <button onClick={onAddClick} className="ml-4 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                        <PokeballIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <SortableContext items={items.map(item => item.instanceID)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 min-h-[100px]">
                    {items.map(member => (
                        <SortablePokemonItem key={member.instanceID} member={member} onSelect={onSelectPokemon} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

const PokemonPC: React.FC = () => {
    const { team, pokemonPC, moveFromPCToTeam, moveFromTeamToPC } = useSessionStore();
    const { setIsSidebarOpen, selectPokemon } = useUIStore();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeContainer = team.some(p => p.instanceID === activeId) ? 'team' : 'pc';
        const overContainer = team.some(p => p.instanceID === overId) || overId === 'team-container' ? 'team' : 'pc';

        if (activeContainer === 'pc' && overContainer === 'team') {
            moveFromPCToTeam(activeId);
        } else if (activeContainer === 'team' && overContainer === 'pc') {
            moveFromTeamToPC(activeId);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                <div className="lg:col-span-2">
                    <PokemonContainer id="pc-container" title="Pokémon PC" items={pokemonPC} onAddClick={() => setIsSidebarOpen(true, 'pc')} onSelectPokemon={selectPokemon} />
                </div>
                <div className="lg:col-span-1">
                    <PokemonContainer id="team-container" title="Pokémon Team" items={team} onSelectPokemon={selectPokemon} />
                </div>
            </div>
        </DndContext>
    );
};

export default PokemonPC;