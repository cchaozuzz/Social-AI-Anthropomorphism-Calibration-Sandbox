import React from 'react';
import { Lightbulb, Info } from 'lucide-react';
import { CprConfig } from '../types';

interface RecommendationPanelProps {
  config: CprConfig;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ config }) => {
  const getRecommendation = () => {
    const { appearance, behavior, identity, warmth } = config;

    const avg = (appearance + behavior + identity + warmth) / 4;

    if (avg < 33) {
      return {
        title: 'Functional Utility Agent',
        description: 'This low-intensity design is ideal for task-oriented agents like banking assistants or technical support bots.',
        principle: 'Function-Persona Alignment: Users expect efficiency and accuracy over emotional connection. Abstract cues prevent the "uncanny valley" effect and set appropriate expectations for a purely functional tool.',
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        iconColor: 'text-blue-500'
      };
    } else if (avg < 66) {
      return {
        title: 'Relational Guide',
        description: 'This balanced design works well for educational tutors, fitness coaches, or customer service representatives.',
        principle: 'Calibrated Anthropomorphism: By blending iconic appearance with friendly behavior, the agent fosters engagement without overpromising human-level empathy. It maintains a professional yet approachable boundary.',
        color: 'bg-purple-50 border-purple-200 text-purple-800',
        iconColor: 'text-purple-500'
      };
    } else {
      return {
        title: 'Social Companion',
        description: 'This high-intensity/high-warmth design is ideal for Mental Health Support agents or elderly care companions.',
        principle: 'Empathetic Resonance: High biotic cues and warm behavior foster deep trust and emotional connection. However, this requires clear boundary statements to ensure users understand they are interacting with an AI.',
        color: 'bg-pink-50 border-pink-200 text-pink-800',
        iconColor: 'text-pink-500'
      };
    }
  };

  const rec = getRecommendation();

  return (
    <div className={`w-72 h-auto min-h-[320px] p-5 rounded-2xl border shadow-lg flex flex-col ${rec.color} transition-colors duration-500`}>
      <div className="flex items-center space-x-3 mb-4 shrink-0">
        <div className={`p-2 bg-white rounded-full shadow-sm ${rec.iconColor}`}>
          <Lightbulb size={20} />
        </div>
        <h3 className="text-base font-bold leading-tight">{rec.title}</h3>
      </div>
      <p className="text-sm mb-4 leading-relaxed">{rec.description}</p>
      <div className="flex items-start space-x-2 bg-white/50 p-3 rounded-lg mt-auto shrink-0">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p className="text-xs font-medium leading-snug">{rec.principle}</p>
      </div>
    </div>
  );
};
