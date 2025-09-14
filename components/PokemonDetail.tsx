import React, { useState, useEffect, useMemo } from 'react';
import type { Pokedex, PokemonData, Move } from '../types';
import { CloseIcon, PlusIcon, MinusIcon } from './Icons';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS } from '../constants';


interface PokemonDetailProps {
    pokemon: Pokedex;
    allMoves: Record<string, Move>;
    onClose: () => void;
    onAddToTeam: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    isInTeam: boolean;
    teamIsFull: boolean;
}

const createInitialSheetData = (pokemon: Pokedex): PokemonData => {
    const emptyMoves = Array(5).fill({ name: '', power: '', dicePool: '' });
    
    const availableAbilities = [
        pokemon.Ability1,
        pokemon.Ability2,
        pokemon.HiddenAbility,
        ...(pokemon.EventAbilities?.split(',').map(a => a.trim()) || [])
    ].filter((a): a is string => !!a && a.trim() !== '');

    const feet = Math.floor(pokemon.Height.Feet);
    const inches = Math.round((pokemon.Height.Feet % 1) * 12);
    const sizeString = `${feet}'${inches}" (${pokemon.Height.Meters}m)`;
    const weightString = `${pokemon.Weight.Pounds} lbs (${pokemon.Weight.Kilograms}kg)`;

    return {
        pokemonNumber: String(pokemon.Number).padStart(4, '0'),
        pokemonName: pokemon.Name,
        ability: availableAbilities[0] || '',
        strength: pokemon.Strength,
        dexterity: pokemon.Dexterity,
        vitality: pokemon.Vitality,
        special: pokemon.Special,
        insight: pokemon.Insight,
        brawl: 0, channel: 0, clash: 0, evasion: 0,
        alert: 0, athletic: 0, nature: 0, stealth: 0,
        allure: 0, etiquette: 0, intimidate: 0, perform: 0,
        tough: 0, cool: 0, beauty: 0, cute: 0, clever: 0,
        pokemonNature: '',
        confidence: '',
        happiness: 2,
        loyalty: 2,
        numberOfBattles: '0',
        victories: '0',
        accessory: '',
        type: [pokemon.Type1, pokemon.Type2].filter(Boolean).join(' / '),
        weakness: '',
        hp: String(pokemon.BaseHP + pokemon.Vitality),
        will: String(pokemon.Insight + 2),
        item: '',
        status: 'Healthy',
        initiative: String(pokemon.Dexterity),
        accuracy: '',
        damage: '',
        evasionValue: '',
        clashValue: '',
        defSDef: `${pokemon.Vitality} / ${pokemon.Insight}`,
        rank: pokemon.RecommendedRank || 'Starter',
        size: sizeString,
        weight: weightString,
        moves: emptyMoves,
    };
};

const CircleRating: React.FC<{
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}> = ({ value, max, onChange, className = '' }) => {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Set rating to ${i + 1}`}
          onClick={() => onChange(i < value ? i : i + 1)}
          className={`w-5 h-5 rounded-full transition-colors flex-shrink-0 ${
            i < value ? 'bg-white' : 'bg-black/20 hover:bg-white/50'
          }`}
        />
      ))}
    </div>
  );
};

const LabeledInput: React.FC<{
  label: string;
  field: keyof PokemonData;
  value: string;
  onChange: (field: keyof PokemonData, value: string) => void;
  labelClassName?: string;
}> = ({ label, field, value, onChange, labelClassName }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={field} className={`text-xs tracking-wider ${labelClassName || 'text-[#3A3A3A]'}`}>{label}</label>
    <input
      id={field}
      type="text"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full bg-white rounded-lg px-2 py-1 text-black text-sm font-sans"
    />
  </div>
);


const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, allMoves, onClose, onAddToTeam, onRemoveFromTeam, isInTeam, teamIsFull }) => {
  const [pokemonData, setPokemonData] = useState<PokemonData>(() => createInitialSheetData(pokemon));
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveSlotIndex, setMoveSlotIndex] = useState<number | null>(null);
  const [moveSearchTerm, setMoveSearchTerm] = useState('');

  useEffect(() => {
    setPokemonData(createInitialSheetData(pokemon));
    const abilities = [
        pokemon.Ability1,
        pokemon.Ability2,
        pokemon.HiddenAbility,
        ...(pokemon.EventAbilities?.split(',').map(a => a.trim()) || [])
    ].filter((a): a is string => !!a && a.trim() !== '');
    setAvailableAbilities(abilities);
  }, [pokemon]);


  const updateField = (field: keyof PokemonData, value: any) => {
    setPokemonData(prev => ({ ...prev, [field]: value }));
  };

  const handleMoveChange = (index: number, field: 'name' | 'power' | 'dicePool', value: string) => {
    const newMoves = [...pokemonData.moves];
    newMoves[index] = { ...newMoves[index], [field]: value };
    updateField('moves', newMoves);
  };

  const openMoveModal = (index: number) => {
      setMoveSlotIndex(index);
      setMoveSearchTerm('');
      setIsMoveModalOpen(true);
  };

  const closeMoveModal = () => {
      setIsMoveModalOpen(false);
      setMoveSlotIndex(null);
  };

  const handleSelectMove = (move: Move) => {
      if (moveSlotIndex === null) return;
      
      const newMoves = [...pokemonData.moves];
      newMoves[moveSlotIndex] = {
          name: move.Name,
          power: String(move.Power > 0 ? move.Power : '--'),
          dicePool: move.Damage1 || ''
      };
      updateField('moves', newMoves);
      closeMoveModal();
  };

  const learnableMoves = useMemo(() => pokemon.Moves
      .map(learnset => allMoves[learnset.Name.toLowerCase().replace(/ /g, '-')])
      .filter((move): move is Move => !!move)
      .filter(move => move.Name.toLowerCase().includes(moveSearchTerm.toLowerCase()))
      .sort((a,b) => a.Name.localeCompare(b.Name)),
      [pokemon.Moves, allMoves, moveSearchTerm]
  );
  
  const attributes = [
    { name: 'STRENGTH', value: pokemonData.strength, field: 'strength' as const },
    { name: 'DEXTERITY', value: pokemonData.dexterity, field: 'dexterity' as const },
    { name: 'VITALITY', value: pokemonData.vitality, field: 'vitality' as const },
    { name: 'SPECIAL', value: pokemonData.special, field: 'special' as const },
    { name: 'INSIGHT', value: pokemonData.insight, field: 'insight' as const },
  ];
  
  const skills = {
    fight: [
      { name: 'BRAWL', value: pokemonData.brawl, field: 'brawl' as const },
      { name: 'CHANNEL', value: pokemonData.channel, field: 'channel' as const },
      { name: 'CLASH', value: pokemonData.clash, field: 'clash' as const },
      { name: 'EVASION', value: pokemonData.evasion, field: 'evasion' as const },
    ],
    survival: [
      { name: 'ALERT', value: pokemonData.alert, field: 'alert' as const },
      { name: 'ATHLETIC', value: pokemonData.athletic, field: 'athletic' as const },
      { name: 'NATURE', value: pokemonData.nature, field: 'nature' as const },
      { name: 'STEALTH', value: pokemonData.stealth, field: 'stealth' as const },
    ],
    social: [
      { name: 'ALLURE', value: pokemonData.allure, field: 'allure' as const },
      { name: 'ETIQUETTE', value: pokemonData.etiquette, field: 'etiquette' as const },
      { name: 'INTIMIDATE', value: pokemonData.intimidate, field: 'intimidate' as const },
      { name: 'PERFORM', value: pokemonData.perform, field: 'perform' as const },
    ],
  };

  const socialAttributes = [
    { name: 'TOUGH', value: pokemonData.tough, field: 'tough' as const },
    { name: 'COOL', value: pokemonData.cool, field: 'cool' as const },
    { name: 'BEAUTY', value: pokemonData.beauty, field: 'beauty' as const },
    { name: 'CUTE', value: pokemonData.cute, field: 'cute' as const },
    { name: 'CLEVER', value: pokemonData.clever, field: 'clever' as const },
  ];
  
  const socialAttributeColors: { [key: string]: string } = {
    TOUGH: 'bg-[#F7F0A0]',
    COOL: 'bg-[#F4A27A]',
    BEAUTY: 'bg-[#A1C6F4]',
    CUTE: 'bg-[#F6B8D0]',
    CLEVER: 'bg-[#A8D79A]',
  };


  const MoveModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeMoveModal}>
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
                <h3 className="text-xl font-bold text-poke-yellow text-center">Select a Move</h3>
                <input
                    type="text"
                    placeholder="Search moves..."
                    value={moveSearchTerm}
                    onChange={e => setMoveSearchTerm(e.target.value)}
                    className="w-full p-2 mt-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                />
            </div>
            <div className="overflow-y-auto p-2">
                {learnableMoves.length > 0 ? learnableMoves.map(move => (
                    <button key={move._id} onClick={() => handleSelectMove(move)} className="w-full text-left p-3 my-1 bg-slate-700 rounded-lg hover:bg-poke-blue transition-colors flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{move.Name}</p>
                            <p className="text-sm text-gray-400 hidden sm:block">{move.Effect}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                           <TypeBadge type={move.Type} />
                           <p className="text-xs mt-1 text-gray-300">Pwr: {move.Power > 0 ? move.Power : '--'}</p>
                        </div>
                    </button>
                )) : (
                    <p className="text-center text-gray-400 py-8">No moves found.</p>
                )}
            </div>
             <button onClick={closeMoveModal} className="absolute top-2 right-2 p-1 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 sm:p-6 rounded-2xl font-pixel animate-fade-in" style={{ backgroundColor: '#E46243' }}>
       {isMoveModalOpen && <MoveModal />}
       <button onClick={onClose} className="absolute top-0 right-0 mt-2 mr-2 z-10 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110" aria-label="Close sheet">
        <CloseIcon className="w-6 h-6" />
      </button>

       {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
          <LabeledInput label="POKÉMON NAME" field="pokemonName" value={pokemonData.pokemonName} onChange={updateField} />
          <LabeledInput label="POKÉDEX #" field="pokemonNumber" value={pokemonData.pokemonNumber} onChange={updateField} />
          <div className="flex flex-col gap-1">
            <label htmlFor="ability" className="text-[#3A3A3A] text-xs tracking-wider">ABILITY</label>
            <select
                id="ability"
                value={pokemonData.ability}
                onChange={(e) => updateField('ability', e.target.value)}
                className="w-full bg-white rounded-lg px-3 py-1 text-black text-sm font-sans"
                disabled={availableAbilities.length <= 1}
            >
                {availableAbilities.map(ab => <option key={ab} value={ab}>{ab}</option>)}
                {availableAbilities.length === 0 && <option value="">N/A</option>}
            </select>
          </div>
           <div className="flex flex-col space-y-2">
              {isInTeam ? (
                  <button onClick={() => onRemoveFromTeam(pokemon)} className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-white transition-colors text-sm">
                      <MinusIcon className="w-5 h-5 mr-2" /> Remove
                  </button>
              ) : (
                  <button onClick={() => onAddToTeam(pokemon)} disabled={teamIsFull} className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-sm">
                      <PlusIcon className="w-5 h-5 mr-2" /> Add to Team
                  </button>
              )}
            </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Left Column: Attributes & Size/Weight */}
        <div className="space-y-3">
          {attributes.map(attr => (
            <div key={attr.name} className="bg-[#2DB3B3] rounded-2xl p-3 border-4 border-[#3A3A3A]">
               <div className="flex flex-col items-center gap-3">
                <span className="text-[#3A3A3A] font-bold text-base tracking-tighter">{attr.name}</span>
                <CircleRating
                  value={attr.value}
                  max={10}
                  onChange={(value) => updateField(attr.field, value)}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex-1 flex items-center gap-2">
                <label htmlFor="size" className="text-[#3A3A3A] text-base">SIZE:</label>
                <input id="size" type="text" value={pokemonData.size} onChange={(e) => updateField('size', e.target.value)} className="w-full bg-white rounded-lg px-3 py-2 text-black text-sm font-sans" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <label htmlFor="weight" className="text-[#3A3A3A] text-base">WEIGHT:</label>
                <input id="weight" type="text" value={pokemonData.weight} onChange={(e) => updateField('weight', e.target.value)} className="w-full bg-white rounded-lg px-3 py-2 text-black text-sm font-sans" />
              </div>
          </div>
        </div>

        {/* Right Column: Skills with side tabs */}
        <div className="flex">
            <div className="bg-[#C95649] rounded-l-2xl p-4 flex-grow space-y-2">
                {Object.values(skills).map((skillGroup, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <div className="py-2"></div>}
                        {skillGroup.map(skill => (
                            <div key={skill.name} className="flex items-center justify-between gap-3">
                                <span className="text-white text-xs">{skill.name}</span>
                                <CircleRating value={skill.value} max={5} onChange={(v) => updateField(skill.field, v)} />
                            </div>
                        ))}
                    </React.Fragment>
                ))}
                 <div className="py-2"></div>
                 <div className="flex items-center justify-between gap-3">
                    <input type="text" placeholder="EXTRA" className="bg-white rounded-md py-1 px-2 text-black font-sans text-sm w-28 placeholder:text-gray-400"/>
                    <CircleRating value={0} max={5} onChange={() => {}} />
                </div>
            </div>
            <div className="flex flex-col text-center text-white font-bold text-xs" style={{backgroundColor: '#B2483D', borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem'}}>
                <div className="px-1.5 flex-grow flex items-center justify-center"><span className="transform -rotate-90 block whitespace-nowrap tracking-wider">FIGHT</span></div>
                <div className="px-1.5 flex-grow flex items-center justify-center"><span className="transform -rotate-90 block whitespace-nowrap tracking-wider">SURVIVAL</span></div>
                <div className="px-1.5 flex-grow flex items-center justify-center"><span className="transform -rotate-90 block whitespace-nowrap tracking-wider">SOCIAL</span></div>
                <div className="px-1.5 flex-grow flex items-center justify-center"><span className="transform -rotate-90 block whitespace-nowrap tracking-wider">EXTRA</span></div>
            </div>
        </div>
      </div>

       {/* Social Attributes, Quick Reference, and other info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_3fr_2.5fr] gap-4">
        {/* Col 1: Social Attributes */}
        <div className="space-y-2">
            {socialAttributes.map(attr => (
            <div key={attr.name} className={`${socialAttributeColors[attr.name]} rounded-xl p-2 border-2 border-[#3A3A3A] flex items-center justify-between`}>
                <span className="text-[#3A3A3A] font-bold text-xs tracking-wider">{attr.name}</span>
                <CircleRating value={attr.value} max={5} onChange={(value) => updateField(attr.field, value)} />
            </div>
            ))}
        </div>

        {/* Col 2: Middle Section */}
        <div className="space-y-2 flex flex-col">
            <div className="bg-[#3A3A3A] rounded-xl p-2 space-y-2">
                <LabeledInput label="NATURE:" field="pokemonNature" value={pokemonData.pokemonNature} onChange={updateField} labelClassName="text-white" />
                <LabeledInput label="CONFIDENCE" field="confidence" value={pokemonData.confidence} onChange={updateField} labelClassName="text-white" />
            </div>
            <div className="flex flex-col gap-2">
                <div className="bg-[#2DB3B3] rounded-xl p-2 border-2 border-[#3A3A3A] space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-xs">HAPPINESS</label>
                        <CircleRating value={pokemonData.happiness} max={5} onChange={(v) => updateField('happiness', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-white text-xs">LOYALTY</label>
                        <CircleRating value={pokemonData.loyalty} max={5} onChange={(v) => updateField('loyalty', v)} />
                    </div>
                </div>
                <div className="bg-[#C95649] rounded-xl p-2 border-2 border-[#3A3A3A] grid grid-cols-2 gap-2">
                    <LabeledInput label="Nº OF BATTLES:" field="numberOfBattles" value={pokemonData.numberOfBattles} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="VICTORIES" field="victories" value={pokemonData.victories} onChange={updateField} labelClassName="text-white" />
                </div>
            </div>
            <div className="bg-[#3A3A3A] rounded-xl p-2 space-y-2 flex-grow flex flex-col">
                <LabeledInput label="ACCESSORY:" field="accessory" value={pokemonData.accessory} onChange={updateField} labelClassName="text-white" />
                <div className="grid grid-cols-4 gap-2 flex-grow">
                    <input className="bg-white rounded-lg text-black text-sm font-sans w-full aspect-square" aria-label="Accessory slot 1"/>
                    <input className="bg-white rounded-lg text-black text-sm font-sans w-full aspect-square" aria-label="Accessory slot 2"/>
                    <input className="bg-white rounded-lg text-black text-sm font-sans w-full aspect-square" aria-label="Accessory slot 3"/>
                    <input className="bg-white rounded-lg text-black text-sm font-sans w-full aspect-square" aria-label="Accessory slot 4"/>
                </div>
            </div>
        </div>
        
        {/* Col 3: Right Section */}
        <div className="md:col-span-2 lg:col-span-1 space-y-2 flex flex-col">
            <div className="bg-[#3A3A3A] rounded-xl p-2 grid grid-cols-2 gap-2">
                <LabeledInput label="HP" field="hp" value={pokemonData.hp} onChange={updateField} labelClassName="text-white" />
                <LabeledInput label="WILL" field="will" value={pokemonData.will} onChange={updateField} labelClassName="text-white" />
            </div>
            <div className="bg-[#3A3A3A] rounded-xl p-2 space-y-2 flex-grow">
                <h3 className="text-center text-red-400 text-xs">QUICK REFERENCES</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <LabeledInput label="ITEM:" field="item" value={pokemonData.item} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="STATUS:" field="status" value={pokemonData.status} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="INITIATIVE:" field="initiative" value={pokemonData.initiative} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="ACCURACY:" field="accuracy" value={pokemonData.accuracy} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="DAMAGE:" field="damage" value={pokemonData.damage} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="EVASION:" field="evasionValue" value={pokemonData.evasionValue} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="CLASH:" field="clashValue" value={pokemonData.clashValue} onChange={updateField} labelClassName="text-white" />
                    <LabeledInput label="DEF/S.DEF" field="defSDef" value={pokemonData.defSDef} onChange={updateField} labelClassName="text-white" />
                </div>
                 <div className="flex justify-end mt-2">
                    <div className="w-full sm:w-1/2">
                        <LabeledInput label="RANK" field="rank" value={pokemonData.rank} onChange={updateField} labelClassName="text-white" />
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <LabeledInput label="TYPE:" field="type" value={pokemonData.type} onChange={updateField} />
        <LabeledInput label="WEAKNESS:" field="weakness" value={pokemonData.weakness} onChange={updateField} />
      </div>


       {/* Moves Section */}
      <div className="mt-6 bg-[#2DB3B3] rounded-2xl p-4 border-4 border-[#3A3A3A]">
        <h2 className="text-center text-xl text-[#3A3A3A] font-bold mb-4 tracking-tighter">MOVES</h2>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-7 gap-x-2 px-2">
              <span className="col-span-3 text-[#3A3A3A] text-sm">NAME</span>
              <span className="col-span-2 text-[#3A3A3A] text-sm">POWER</span>
              <span className="col-span-1 text-[#3A3A3A] text-sm">POOL</span>
              <span className="col-span-1"></span>
          </div>
          {pokemonData.moves.map((move, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-7 gap-x-2 gap-y-2 items-center">
              <input aria-label="Move name" placeholder="Name" type="text" value={move.name} onChange={(e) => handleMoveChange(index, 'name', e.target.value)} className="col-span-full sm:col-span-3 bg-white rounded-lg px-3 py-2 text-black text-sm font-sans placeholder:text-gray-400" />
              <input aria-label="Move power" placeholder="Power" type="text" value={move.power} onChange={(e) => handleMoveChange(index, 'power', e.target.value)} className="col-span-full sm:col-span-2 bg-white rounded-lg px-3 py-2 text-black text-sm font-sans placeholder:text-gray-400" />
              <input aria-label="Move dice pool" placeholder="Pool" type="text" value={move.dicePool} onChange={(e) => handleMoveChange(index, 'dicePool', e.target.value)} className="col-span-full sm:col-span-1 bg-white rounded-lg px-3 py-2 text-black text-sm font-sans placeholder:text-gray-400" />
              <button onClick={() => openMoveModal(index)} className="col-span-full sm:col-span-1 bg-white/50 hover:bg-white/80 rounded-lg p-2 flex items-center justify-center" aria-label={`Add move to slot ${index + 1}`}>
                <PlusIcon className="w-6 h-6 text-[#3A3A3A]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;