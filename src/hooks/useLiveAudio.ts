import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { CprConfig } from '../types';
import { getSystemInstruction } from '../services/geminiService';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function useLiveAudio(config: CprConfig) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ id: string, role: string, text: string, finished: boolean }[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const userSpeakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to keep track of current transcription state without depending on state closures in onmessage
  const currentTranscriptRef = useRef<{ id: string, role: string, text: string, finished: boolean }[]>([]);

  const updateTranscript = useCallback((role: string, textChunk: string, finished: boolean) => {
    setTranscript(prev => {
      const newTranscript = [...prev];
      const lastIdx = newTranscript.length - 1;
      
      if (lastIdx >= 0 && newTranscript[lastIdx].role === role && !newTranscript[lastIdx].finished) {
        newTranscript[lastIdx] = {
          ...newTranscript[lastIdx],
          text: newTranscript[lastIdx].text + textChunk,
          finished: finished
        };
      } else {
        newTranscript.push({
          id: Date.now().toString() + Math.random().toString(),
          role,
          text: textChunk,
          finished
        });
      }
      
      // Keep only the last 10 to avoid memory leaks
      const trimmed = newTranscript.slice(-10);
      currentTranscriptRef.current = trimmed;
      return trimmed;
    });
  }, []);

  // Helper to convert Float32Array to base64 PCM16
  const floatTo16BitPCM = (input: Float32Array) => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper to convert base64 PCM16 to Float32Array
  const base64ToFloat32Array = (base64: string) => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const view = new DataView(bytes.buffer);
    const floatArray = new Float32Array(len / 2);
    for (let i = 0; i < len / 2; i++) {
      floatArray[i] = view.getInt16(i * 2, true) / 0x8000;
    }
    return floatArray;
  };

  const playNextAudio = useCallback(() => {
    if (!audioContextRef.current || playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const audioData = playbackQueueRef.current.shift()!;
    
    // The model returns 24000Hz audio
    const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 24000);
    audioBuffer.getChannelData(0).set(audioData);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    const currentTime = audioContextRef.current.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;

    source.onended = () => {
      if (playbackQueueRef.current.length === 0) {
        isPlayingRef.current = false;
        setIsSpeaking(false);
      } else {
        playNextAudio();
      }
    };
  }, []);

  const getVoiceName = () => {
    if (config.warmth < 33) return 'Charon'; // Indifferent/professional
    if (config.warmth < 66) return 'Kore';   // Fair/neutral
    return 'Aoede';                          // Warm/cheerful
  };

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Live API Message:", message);
            
            if (message.serverContent?.modelTurn?.parts) {
              const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
              if (textPart) {
                console.log("Live API Text:", textPart.text);
              }
            }

            // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
              const { text, finished } = message.serverContent.inputTranscription;
              if (text || finished) {
                updateTranscript('user', text || '', !!finished);
              }
            }
            if (message.serverContent?.outputTranscription) {
              const { text, finished } = message.serverContent.outputTranscription;
              if (text || finished) {
                updateTranscript('assistant', text || '', !!finished);
              }
            }

            // Handle audio output
            const audioPart = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData);
            const base64Audio = audioPart?.inlineData?.data;
            if (base64Audio) {
              const binary = atob(base64Audio);
              const len = binary.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              const view = new DataView(bytes.buffer);
              const floatArray = new Float32Array(len / 2);
              for (let i = 0; i < len / 2; i++) {
                floatArray[i] = view.getInt16(i * 2, true) / 0x8000;
              }
              
              playbackQueueRef.current.push(floatArray);
              if (!isPlayingRef.current) {
                nextPlayTimeRef.current = audioContextRef.current?.currentTime || 0;
                playNextAudio();
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              console.log("Live API Interrupted");
              playbackQueueRef.current = [];
              nextPlayTimeRef.current = 0;
              setIsSpeaking(false);
              isPlayingRef.current = false;
            }
          },
          onclose: () => {
            setIsConnected(false);
            setIsRecording(false);
            setIsSpeaking(false);
            setIsUserSpeaking(false);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnected(false);
            setIsRecording(false);
            setIsSpeaking(false);
            setIsUserSpeaking(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: getVoiceName() } },
          },
          systemInstruction: getSystemInstruction(config),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to connect:", err);
      setIsConnecting(false);
    }
  }, [config, isConnected, isConnecting, playNextAudio]);

  const startRecording = useCallback(async () => {
    if (!isConnected || !sessionRef.current || !audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000,
      } });
      mediaStreamRef.current = stream;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const buffer = new ArrayBuffer(inputData.length * 2);
        const view = new DataView(buffer);
        
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
          sum += inputData[i] * inputData[i];
        }
        
        const rms = Math.sqrt(sum / inputData.length);
        if (rms > 0.01) {
          setIsUserSpeaking(true);
          if (userSpeakingTimeoutRef.current) clearTimeout(userSpeakingTimeoutRef.current);
          userSpeakingTimeoutRef.current = setTimeout(() => setIsUserSpeaking(false), 300);
        }
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        
        sessionRef.current.then((session: any) => {
          try {
            session.sendRealtimeInput({
              audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            });
          } catch (err) {
            console.error("Failed to send audio data:", err);
          }
        });
      };

      const dummyGain = audioContextRef.current.createGain();
      dummyGain.gain.value = 0;

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(dummyGain);
      dummyGain.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [isConnected]);

  const stopRecording = useCallback(() => {
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setIsUserSpeaking(false);
  }, []);

  const disconnect = useCallback(() => {
    stopRecording();
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    playbackQueueRef.current = [];
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
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
  };
}
