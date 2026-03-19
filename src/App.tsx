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
    <div className="h-screen bg-[#FAF9F5] flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Social AI Anthropomorphism Calibration Sandbox</h1>
          <p className="text-sm text-gray-500 font-medium">Cue-Perception-Relation (CPR) Model Explorer</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Live Preview</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Preview */}
        <div className="flex-1 h-full bg-gray-50 flex items-end p-6 gap-6 overflow-x-auto shadow-inner">
          <div className="z-10 shrink-0">
            <RecommendationPanel config={config} />
          </div>
          <div className="flex-1 h-full flex items-center justify-center min-w-[340px]">
            <PreviewPanel config={config} />
          </div>
          {/* Spacer to perfectly center the phone on very large screens */}
          <div className="w-72 shrink-0 hidden 2xl:block pointer-events-none"></div>
        </div>

        {/* Right Side: Control Panel */}
        <div className="w-[600px] bg-white border-l border-gray-200 shadow-xl z-20 shrink-0 overflow-hidden">
          <ControlPanel config={config} setConfig={setConfig} />
        </div>
      </main>
    </div>
  );
}
