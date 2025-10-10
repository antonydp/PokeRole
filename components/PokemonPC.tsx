import React, { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, useDroppable, rectIntersection } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSessionStore } from '../src/store/useSessionStore.js';
import { useUIStore } from '../src/store/useUIStore.js';
import { TeamMember } from '../src/types/index.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';
import TypeBadge from './TypeBadge.js';
import PCPokemonCard from './PCPokemonCard.js';
import { PokeballIcon } from './Icons.js';

const SortablePokemonCard = ({ member, onSelect }: { member: TeamMember, onSelect: (dexId: string, instanceId: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.instanceID });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none"
        >
            <PCPokemonCard pokemon={member} onSelect={(_dexId) => onSelect(member.pokedexData.DexID, member.instanceID)} />
        </div>
    );
};

const PokemonContainer = ({ id, title, items, onAddClick, onSelectPokemon }: { id: string, title: string, items: TeamMember[], onAddClick?: () => void, onSelectPokemon: (dexId: string, instanceId: string) => void }) => {
    const { setNodeRef } = useDroppable({ id });
    const isTeam = id === 'team-container';
    const containerClasses = isTeam
        ? 'grid grid-cols-2 grid-rows-3 gap-2'
        : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2';
    
    const sortableStrategy = rectSortingStrategy;

    return (
        <div ref={setNodeRef} className="bg-slate-800/50 p-4 rounded-lg w-full">
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-2xl font-bold font-primary text-poke-yellow text-center">{title}</h2>
                {onAddClick && (
                    <button onClick={onAddClick} className="ml-4 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                        <PokeballIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
            <SortableContext items={items.map(item => item.instanceID)} strategy={sortableStrategy}>
                <div className={`${containerClasses} min-h-[250px]`}>
                    {items.map(member => (
                        <SortablePokemonCard key={member.instanceID} member={member} onSelect={onSelectPokemon} />
                    ))}
                    {isTeam && Array.from({ length: Math.max(0, 6 - items.length) }).map((_, index) => (
                        <div key={`placeholder-${index}`} className="aspect-square border-2 border-dashed border-slate-600 rounded-lg bg-slate-800/30" />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

const PokemonPC: React.FC = () => {
    const { team, pokemonPC, moveFromPCToTeam, moveFromTeamToPC } = useSessionStore();
    const { setIsSidebarOpen, selectPokemon } = useUIStore();
    const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeId = active.id as string;
        const member = team.find(p => p.instanceID === activeId) || pokemonPC.find(p => p.instanceID === activeId);
        setActiveMember(member || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveMember(null);

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
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveMember(null)}
        >
            <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
                <div className="lg:col-span-3">
                    <PokemonContainer id="pc-container" title="Pokémon PC" items={pokemonPC} onAddClick={() => setIsSidebarOpen(true, 'pc')} onSelectPokemon={(dexId, instanceId) => selectPokemon(dexId, instanceId, 'pc')} />
                </div>
                <div className="lg:col-span-1">
                    <PokemonContainer id="team-container" title="Pokémon Team" items={team} onSelectPokemon={(dexId, instanceId) => selectPokemon(dexId, instanceId, 'team')} />
                </div>
            </div>
            <DragOverlay>
                {activeMember ? (
                    <PCPokemonCard pokemon={activeMember} onSelect={() => {}} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default PokemonPC;