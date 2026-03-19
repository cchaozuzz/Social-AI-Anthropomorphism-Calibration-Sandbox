import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Send, Play, Pause, PhoneOff, Loader2 } from 'lucide-react';
import { CprConfig, Message } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import { sendMessage } from '../services/geminiService';
import { useLiveAudio } from '../hooks/useLiveAudio';

interface PreviewPanelProps {
  config: CprConfig;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    connect,
    disconnect,
    startRecording,
    stopRecording,
    isConnected,
    isConnecting,
    isRecording,
    isSpeaking,
    isUserSpeaking,
    transcript
  } = useLiveAudio(config);

  const isCallActive = isConnected || isConnecting;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, transcript]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      const response = await sendMessage(userMessage.content, config, history);
      
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getIdentityDetails = () => {
    const { identity, warmth } = config;
    let name = '';
    let role = '';

    if (identity < 20) {
      if (warmth < 33) { name = 'System'; role = 'Processor'; }
      else if (warmth < 66) { name = 'Unit-7'; role = 'Agent'; }
      else { name = 'Helper'; role = 'Guide'; }
    } else if (identity < 40) {
      if (warmth < 33) { name = 'Alden'; role = 'Assistant'; }
      else if (warmth < 66) { name = 'Veda'; role = 'Coordinator'; }
      else { name = 'Mora'; role = 'Supporter'; }
    } else if (identity < 60) {
      if (warmth < 33) { name = 'Atlas'; role = 'Analyst'; }
      else if (warmth < 66) { name = 'Sage'; role = 'Collaborator'; }
      else { name = 'Nova'; role = 'Advisor'; }
    } else if (identity < 80) {
      if (warmth < 33) { name = 'Elias'; role = 'Ally'; }
      else if (warmth < 66) { name = 'Beau'; role = 'Companion'; }
      else { name = 'Cleo'; role = 'Confidant'; }
    } else {
      if (warmth < 33) { name = 'Zane'; role = 'Acquaintance'; }
      else if (warmth < 66) { name = 'Zest'; role = 'Friend'; }
      else { name = 'Joy'; role = 'Bestie'; }
    }

    return { name, role };
  };

  const getAvatarEmoji = () => {
    const { appearance, warmth } = config;
    if (appearance < 20) {
      if (warmth < 33) return '🧊';
      if (warmth < 66) return '⚙️';
      return '🔮';
    } else if (appearance < 40) {
      if (warmth < 33) return '🖲️';
      if (warmth < 66) return '🤖';
      return '💡';
    } else if (appearance < 60) {
      if (warmth < 33) return '🌀';
      if (warmth < 66) return '🫧';
      return '🌸';
    } else if (appearance < 80) {
      if (warmth < 33) return '🦎';
      if (warmth < 66) return '🦊';
      return '🐶';
    } else {
      if (warmth < 33) return '😐';
      if (warmth < 66) return '🙂';
      return '😁';
    }
  };

  const { name, role } = getIdentityDetails();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4 overflow-y-auto">
      {/* Phone Mockup Container */}
      <div className="w-[380px] h-[800px] bg-[#fafafa] rounded-[3rem] shadow-2xl border-[12px] border-gray-900 overflow-hidden flex flex-col relative shrink-0">
        
        {/* Top Header Area */}
        <div className="flex items-center px-6 pt-12 pb-2 space-x-4 z-10">
          <div className="w-14 h-14 flex items-center justify-center text-3xl bg-white rounded-full shadow-sm border border-gray-100 transition-all duration-500">
            {getAvatarEmoji()}
          </div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-medium text-gray-800 tracking-tight">
              {name}
            </h2>
            <span className="px-2.5 py-1 bg-gray-200/80 text-gray-700 text-[11px] rounded-md font-medium">
              as your {role}
            </span>
          </div>
        </div>

        {/* Voice Visualizer Area */}
        <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
          <div className="z-10 scale-125">
            <AudioVisualizer config={config} isActive={isSpeaking || isUserSpeaking} />
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="px-6 pb-8 flex flex-col z-10">
          
          {/* Text Area (Chat & Input) */}
          <div className="h-56 flex flex-col mb-4">
            <div className="flex-1 overflow-y-auto flex flex-col space-y-3 mb-3 pr-1" style={{ scrollbarWidth: 'none' }}>
              {messages.length === 0 && !isCallActive && (
                <div className="text-center text-gray-400 text-sm mt-10">
                  <p>Start voice mode or type a message.</p>
                </div>
              )}
              {isCallActive && transcript.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 flex flex-col items-center space-y-2">
                  {isConnecting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <p>Connecting...</p>
                    </>
                  ) : (
                    <p>{isRecording ? 'Listening...' : (isSpeaking ? 'Speaking...' : 'Connected. Tap mic to speak.')}</p>
                  )}
                </div>
              )}
              {isCallActive && transcript.length > 0 && (
                <div className="flex flex-col space-y-3 mt-auto pt-4">
                  {transcript.slice(-3).map((line, idx, arr) => {
                    const isOldest = arr.length === 3 && idx === 0;
                    const isMiddle = (arr.length === 3 && idx === 1) || (arr.length === 2 && idx === 0);
                    
                    let textColor = 'text-gray-800';
                    if (isOldest) textColor = 'text-gray-300';
                    else if (isMiddle) textColor = 'text-gray-500';
                    
                    return (
                      <motion.div 
                        key={line.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm ${textColor} transition-colors duration-500`}
                      >
                        <span className="font-semibold">{line.role === 'user' ? 'You' : name}: </span>
                        {line.text}
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {!isCallActive && messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm shadow-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isProcessing && !isCallActive && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex space-x-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Field */}
            {!isCallActive && (
              <div className="relative mt-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-10 py-3 bg-white text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-full transition-all outline-none shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center items-center space-x-6 h-20">
            {!isCallActive ? (
              <button 
                onClick={connect}
                className="flex items-center space-x-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition-colors shadow-lg w-full justify-center"
              >
                <Play size={18} fill="currentColor" />
                <span>Start Voice Mode</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => isRecording ? stopRecording() : startRecording()}
                  disabled={isConnecting}
                  className={`p-5 rounded-full transition-all shadow-lg ${
                    isRecording ? 'bg-red-100 text-red-600 scale-105' : 'bg-white text-gray-800 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {isRecording ? <Pause size={24} fill="currentColor" /> : <Mic size={24} />}
                </button>
                <button 
                  onClick={disconnect}
                  className="p-5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                >
                  <PhoneOff size={24} />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

