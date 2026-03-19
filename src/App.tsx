import React, { useState } from 'react';
import { PreviewPanel } from './components/PreviewPanel';
import { ControlPanel } from './components/ControlPanel';
import { RecommendationPanel } from './components/RecommendationPanel';
import { CprConfig } from './types';

export default function App() {
  const [config, setConfig] = useState<CprConfig>({
    appearance: 50,
    behavior: 50,
    identity: 50,
    warmth: 50,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Social AI Anthropomorphism Calibration Sandbox</h1>
          <p className="text-sm text-gray-500 font-medium">Cue-Perception-Relation (CPR) Model Explorer</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Live Preview</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Preview */}
        <div className="flex-1 lg:w-1/2 flex flex-col h-full bg-gray-50">
          <div className="flex-1 overflow-hidden relative shadow-inner">
            <PreviewPanel config={config} />
          </div>
          <div className="p-6 bg-white border-t border-gray-200 shadow-lg z-10">
            <RecommendationPanel config={config} />
          </div>
        </div>

        {/* Right Side: Control Panel */}
        <div className="w-full lg:w-[400px] xl:w-[480px] bg-white border-l border-gray-200 shadow-xl z-20">
          <ControlPanel config={config} setConfig={setConfig} />
        </div>
      </main>
    </div>
  );
}
