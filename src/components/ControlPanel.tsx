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
    <div className="mb-8">
      <div className="flex justify-between items-end mb-2">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-800 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{value}%</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      <div className="relative pt-1">
        <input
          type="range"
          id={name}
          name={name}
          min="0"
          max="100"
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-white h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Calibration Controls</h2>
      <p className="text-sm text-gray-500 mb-8">
        Adjust the sliders to modify the Cue-Perception-Relation (CPR) parameters and observe the real-time changes in the preview.
      </p>

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

      <div className="my-8 border-t border-gray-200" />

      {renderSlider(
        'Overall Anthropomorphic Warmth',
        'warmth',
        config.warmth,
        'Cold/Logical',
        'Warm/Affectionate',
        'A macro-level adjustment that influences the overall "vibe" and animation intensity.'
      )}
    </div>
  );
};
