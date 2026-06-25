"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTasks } from "@/context/TaskContext";
import { Mic, MicOff, Send, X, MessageSquare, Sparkles, Volume2 } from "lucide-react";

export default function VoiceAssistant() {
  const { runVoiceCommand } = useTasks();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("Press the microphone and speak naturally.");
  const [keyboardText, setKeyboardText] = useState("");
  const [processing, setProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setTranscript("");
          setStatusMessage("Listening... Speak now.");
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
          setStatusMessage(`Captured: "${resultText}"`);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            setStatusMessage("Microphone permission denied.");
          } else {
            setStatusMessage(`Error: ${event.error}. Try typing below!`);
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      recognitionRef.current.stop();
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const handleSubmitTranscript = async (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;
    setProcessing(true);
    setStatusMessage("Planora AI is analyzing your command...");
    try {
      const createdTask = await runVoiceCommand(textToSubmit);
      setStatusMessage(`✨ Task Created: "${createdTask.title}"!`);
      setTranscript("");
      setKeyboardText("");
      // Text-to-speech feedback (optional wow factor!)
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(`Created task: ${createdTask.title}`);
        speech.volume = 0.8;
        speech.rate = 1.0;
        window.speechSynthesis.speak(speech);
      }
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage("Press the microphone and speak naturally.");
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to process request. Try editing or re-submitting.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Assistant Card */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 rounded-2xl glass border border-border shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-bold text-sm text-foreground">AI Voice Companion</span>
            </div>
            <button
              onClick={() => {
                stopListening();
                setIsOpen(false);
              }}
              className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Assistant UI Core */}
          <div className="p-5 flex flex-col items-center justify-center text-center space-y-4">
            {/* Visual sound indicator / glowing circle */}
            <div className="relative flex items-center justify-center">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-primary/20 voice-recording-pulse w-16 h-16" />
              )}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={processing}
                className={`z-10 h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                } shadow-lg active:scale-95 disabled:opacity-50`}
              >
                {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
              {statusMessage}
            </p>

            {/* Transcript Preview */}
            {transcript && (
              <div className="w-full bg-secondary/60 rounded-xl p-3 text-sm text-left border border-border flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground">Captured Transcript:</p>
                <p className="text-foreground italic">"{transcript}"</p>
                {!processing && (
                  <button
                    onClick={() => handleSubmitTranscript(transcript)}
                    className="self-end flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all active:scale-95"
                  >
                    <Send className="h-3 w-3" />
                    <span>Confirm & Schedule</span>
                  </button>
                )}
              </div>
            )}

            {/* Natural language text input fallback */}
            <div className="w-full border-t border-border/60 pt-4 text-left">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                Or Type Natural Command
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitTranscript(keyboardText);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={keyboardText}
                  onChange={(e) => setKeyboardText(e.target.value)}
                  placeholder="e.g. Call client tomorrow at 2 PM"
                  disabled={processing}
                  className="flex-1 text-xs bg-secondary/80 rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary w-full text-foreground"
                />
                <button
                  type="submit"
                  disabled={processing || !keyboardText.trim()}
                  className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/95 disabled:opacity-40 transition-all active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main floating trigger circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 relative group active:scale-95"
        title="Open Planora Voice Assistant"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping group-hover:animate-none opacity-40" />
        <MessageSquare className="h-6 w-6 group-hover:hidden" />
        <Volume2 className="h-6 w-6 hidden group-hover:block" />
      </button>
    </div>
  );
}
