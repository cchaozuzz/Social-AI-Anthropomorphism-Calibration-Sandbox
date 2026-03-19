import React from 'react';
import { CprConfig } from '../types';

interface ControlPanelProps {
  config: CprConfig;
  setConfig: React.Dispatch<React.SetStateAction<CprConfig>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const renderSlider = (
    label: string,
    name: keyof CprConfig,
    value: number,
    lowLabel: string,
    highLabel: string,
    description: string
  ) => (
    <div className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-100">
      <div className="flex justify-between items-end mb-1">
        <label htmlFor={name} className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[10px] font-mono text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">{value}%</span>
      </div>
      <p className="text-[10px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">{description}</p>
      <div className="relative pt-1 mt-auto">
        <input
          type="range"
          id={name}
          name={name}
          min="0"
          max="100"
          value={value}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-[9px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Calibration Controls</h2>
        <p className="text-xs text-gray-500">
          Adjust the sliders to modify the Cue-Perception-Relation (CPR) parameters and observe the real-time changes in the preview.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto content-start">
        {renderSlider(
          'Appearance Cues',
          'appearance',
          config.appearance,
          'Abstract',
          'Biotic',
          'Controls the visual representation of the agent, from geometric shapes to realistic human/animal features.'
        )}

        {renderSlider(
          'Behavior & Expression',
          'behavior',
          config.behavior,
          'Professional',
          'Empathetic',
          'Adjusts the tone of voice and emotional expressiveness of the agent\'s responses.'
        )}

        {renderSlider(
          'Identity Cues',
          'identity',
          config.identity,
          'Functional',
          'Social',
          'Modifies the agent\'s self-described role and how it relates to the user.'
        )}

        {renderSlider(
          'Overall Warmth',
          'warmth',
          config.warmth,
          'Cold/Logical',
          'Warm/Affectionate',
          'A macro-level adjustment that influences the overall "vibe" and animation intensity.'
        )}
      </div>
    </div>
  );
};
