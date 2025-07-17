import React, { useState, useRef } from "react";
import "./ChatPane.css";

/**
 * PUBLIC_INTERFACE
 * ChatPane: Handles real-time voice and text chat, conversation simulation, emotion feedback, and playback controls.
 * Integrates user voice cloning for playback (uses mimicked voice if available). 
 * All backend voice integration points are indicated for extension.
 */
export default function ChatPane() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi there! I’m your Mimic.AI persona. How can I assist you today?", emotion: "🙂" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Store the enrolled user voice profile for mimicked playback
  // In a real implementation, integrate with global/app state, context, or persistent user profile from backend.
  const [userVoiceProfile, setUserVoiceProfile] = useState(null);
  const recognitionRef = useRef(null);

  // PUBLIC_INTERFACE
  const handleInputChange = (e) => setInput(e.target.value);

  // PUBLIC_INTERFACE
  const handleSend = () => {
    if (input.trim() === "") return;
    const userMsg = { role: "user", text: input.trim(), emotion: null };
    setMessages((prev) => [...prev, userMsg]);
    // Placeholder AI response: echo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `You said: "${input.trim()}" (AI response simulated)`,
          emotion: "🤖",
        },
      ]);
    }, 1000);
    setInput("");
  };

  // PUBLIC_INTERFACE
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // PUBLIC_INTERFACE
  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.start();
  };

  // PUBLIC_INTERFACE
  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  /**
   * PUBLIC_INTERFACE
   * Synthesizes and plays each message in chat history, preferring user-mimicked voice for "user" role when available.
   * In a real implementation, use a backend API or local voice model for voice cloning.
   */
  const playBackHistory = async () => {
    setIsPlaying(true);
    let idx = 0;

    async function speakNext() {
      if (idx >= messages.length) {
        setIsPlaying(false);
        return;
      }
      const msg = messages[idx];

      // Only synthesize if it's an AI or user message
      if (msg.role === "ai" || msg.role === "user") {
        await synthesizeVoice(msg);
        idx++;
        // small delay for demo, remove or tweak for UX as needed
        setTimeout(speakNext, 150);
      } else {
        idx++;
        speakNext();
      }
    }
    speakNext();
  };

  /**
   * PUBLIC_INTERFACE
   * Stops any ongoing playback.
   */
  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  /**
   * PUBLIC_INTERFACE
   * Synthesizes the given message using the appropriate voice.
   * - If user message & voice profile exists: use cloned voice (stub: call backend, stream, or download/wav).
   * - Else: use default TTS.
   * @param {Object} msg Chat message object { role, text, ... }
   */
  const synthesizeVoice = (msg) => {
    // EXTENSION POINT: Real voice cloning, integrate backend call here!
    // For now, stub logic: 
    // - If user voice profile exists and message is from user, simulate with audio sample if available.
    // - Otherwise, use system TTS.
    if (msg.role === "user" && userVoiceProfile && userVoiceProfile.audioURL) {
      // Simulate playing a cloned-voice audio segment (just loop the sample for each message for demo)
      return new Promise((resolve) => {
        const audio = new Audio(userVoiceProfile.audioURL);
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });
    } else {
      return new Promise((resolve) => {
        const utter = new window.SpeechSynthesisUtterance(msg.text);
        // Optionally: set utter.voice from backend voice list using userVoiceProfile.voiceId
        window.speechSynthesis.speak(utter);
        utter.onend = resolve;
        utter.onerror = resolve;
      });
    }
  };

  /**
   * PUBLIC_INTERFACE
   * Allows voice profile to be stored in chat panel for demo/testing.
   * In production, manage the userVoiceProfile in app-level state (context, redux, etc)
   */
  const handleVoiceProfileEnrolled = (profileObj) => {
    setUserVoiceProfile(profileObj);
  };

  return (
    <div className="chat-pane">
      <div className="chat-header">
        <h2>Conversation</h2>
        <div className="chat-actions">
          <button
            className="chat-act-btn"
            onClick={isListening ? stopListening : startListening}
            aria-label="Toggle voice input"
            disabled={isPlaying}
          >
            {isListening ? "🛑 Stop" : "🎙️ Voice"}
          </button>
          <button
            className="chat-act-btn"
            onClick={isPlaying ? stopPlayback : playBackHistory}
            aria-label="Playback conversation history"
          >
            {isPlaying ? "⏹️ Stop" : "▶️ Playback"}
          </button>
          {/* Demo: Show enroll/setup button if profile not set */}
          {!userVoiceProfile && (
            <button
              className="chat-act-btn"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("openVoiceSetup", { detail: { onEnroll: handleVoiceProfileEnrolled } })
                );
              }}
              style={{marginLeft: 10}}
            >
              🎤 Setup Voice
            </button>
          )}
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-msg chat-msg-${msg.role}`}
            aria-live="polite"
          >
            <span className="chat-avatar">
              {msg.role === "ai" ? "🤖" : "🧑"}
            </span>
            <span className="chat-msg-text">{msg.text}</span>
            {msg.emotion && (
              <span className="chat-msg-emotion">{msg.emotion}</span>
            )}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          value={input}
          placeholder="Type your message or use voice..."
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isPlaying}
          aria-label="Chat message input"
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={isPlaying || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
