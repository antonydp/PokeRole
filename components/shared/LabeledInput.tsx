import React from 'react';

export const LabeledInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  id: string;
  containerClassName?: string;
}> = ({ label, id, value, onChange, isReadOnly = false, containerClassName = "" }) => (
    <div className={`relative w-full bg-white rounded-xl px-2 py-1.5 border-2 border-[#3A3A3A] flex justify-between items-center ${containerClassName}`}>
        <label htmlFor={id} className="font-pixel text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold">
            {label}
        </label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => !isReadOnly && onChange(e.target.value)}
            readOnly={isReadOnly}
            className={`bg-transparent text-black font-sans text-sm text-right focus:outline-none w-1/2 p-0 ${isReadOnly ? 'cursor-default' : ''}`}
        />
    </div>
);