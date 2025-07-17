import React, { useState, useRef } from "react";
import "./ChatPane.css";

/**
 * PUBLIC_INTERFACE
 * ChatPane: Handles real-time voice and text chat, conversation simulation, emotion feedback, and playback controls.
 * Integrates user voice cloning for playback (uses mimicked voice if available). 
 * Updates live emotion analytics whenever user sends a new message. 
 * All backend voice integration points are stubbed for extension.
 * Accepts a 'onNewEmotionResult' prop callback to notify parent of new emotion analysis result.
 */
export default function ChatPane({ userVoiceProfile: propUserVoiceProfile, onNewEmotionResult }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi there! I’m your Mimic.AI persona. How can I assist you today?", emotion: "🙂" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Local user voice profile state is initialized from parent prop, so either works for demo or App state.
  const [userVoiceProfile, setUserVoiceProfile] = useState(propUserVoiceProfile || null);
  const recognitionRef = useRef(null);

  // Simulated current emotion state, updates when user sends message
  const [currentEmotion, setCurrentEmotion] = useState({
    emotions: [ // Default: happy & calm
      { label: "Happy", value: 0.85, color: "#21E6C1" },
      { label: "Calm", value: 0.72, color: "#2F80ED" },
      { label: "Excited", value: 0.44, color: "#F9A826" },
      { label: "Frustrated", value: 0.1, color: "#FF5454" },
    ],
    dominant: "Happy",
    emoji: "🙂",
    feedback: "😊 Positive mood detected! Conversation is adaptive.",
  });

  // Helper: Fake emotion analysis stub (returns mock result as if by "analyzing" input text/audio)
  // PUBLIC_INTERFACE
  function analyzeEmotion(inputTextOrAudio) {
    // EXTENSION POINT: Call backend AI to get emotion analysis, using audio/text as feature
    // This stub cycles through fake emotions based on hash of message for UI showcase
    if (!inputTextOrAudio || !inputTextOrAudio.length) {
      return {
        emotions: [
          { label: "Happy", value: 0.8, color: "#21E6C1" },
          { label: "Calm", value: 0.5, color: "#2F80ED" },
          { label: "Excited", value: 0.2, color: "#F9A826" },
          { label: "Frustrated", value: 0.1, color: "#FF5454" },
        ],
        dominant: "Happy",
        emoji: "🙂",
        feedback: "😊 Positive mood detected! Conversation is adaptive.",
      };
    }
    const base = inputTextOrAudio.length + inputTextOrAudio.charCodeAt(0) % 13;
    const choices = [
      { emotions: [
        { label: "Happy", value: 0.85, color: "#21E6C1" },
        { label: "Calm", value: 0.61, color: "#2F80ED" },
        { label: "Excited", value: 0.54, color: "#F9A826" },
        { label: "Frustrated", value: 0.11, color: "#FF5454" }
      ], dominant: "Happy", emoji: "🙂", feedback: "😊 Positive mood detected! Conversation is adaptive." },
      { emotions: [
        { label: "Happy", value: 0.36, color: "#21E6C1" },
        { label: "Calm", value: 0.80, color: "#2F80ED" },
        { label: "Excited", value: 0.22, color: "#F9A826" },
        { label: "Frustrated", value: 0.08, color: "#FF5454" }
      ], dominant: "Calm", emoji: "😌", feedback: "🌊 A calming vibe in the air!" },
      { emotions: [
        { label: "Happy", value: 0.13, color: "#21E6C1" },
        { label: "Calm", value: 0.27, color: "#2F80ED" },
        { label: "Excited", value: 0.77, color: "#F9A826" },
        { label: "Frustrated", value: 0.2, color: "#FF5454" }
      ], dominant: "Excited", emoji: "😃", feedback: "🔥 Energetic and engaged. Let's keep it rolling." },
      { emotions: [
        { label: "Happy", value: 0.22, color: "#21E6C1" },
        { label: "Calm", value: 0.45, color: "#2F80ED" },
        { label: "Excited", value: 0.13, color: "#F9A826" },
        { label: "Frustrated", value: 0.81, color: "#FF5454" }
      ], dominant: "Frustrated", emoji: "😠", feedback: "😕 Stress spikes detected! Try a short mindful breath." }
    ];
    // Pick simulated pattern for visual feedback cycling
    const which = base % choices.length;
    return choices[which];
  }

  // PUBLIC_INTERFACE
  const handleInputChange = (e) => setInput(e.target.value);

  // PUBLIC_INTERFACE
  const handleSend = () => {
    if (input.trim() === "") return;
    const userText = input.trim();
    // Simulate emotion analysis with stub
    const emotionResult = analyzeEmotion(userText);
    setCurrentEmotion(emotionResult);

    // Propagate emotion result to parent for global analytics
    if (onNewEmotionResult) onNewEmotionResult(emotionResult);

    // User message, now with live emotion
    const userMsg = {
      role: "user",
      text: userText,
      emotion: emotionResult.emoji,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Parrot response - AI mimics user almost identically with emotion result
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          // Parrot back the input almost identically
          text: userText,
          emotion: emotionResult.emoji,
          mimicked: true,
        },
      ]);
      // Optionally, you could also update emotion analytics again for parrot/AI output if desired
    }, 700);

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
      // Optionally: auto-send after voice input
      // handleSend();
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
   * - If user message & voice profile exists: use cloned voice sample (stub).
   * - Else: use system TTS.
   * @param {Object} msg Chat message object { role, text, ... }
   */
  const synthesizeVoice = (msg) => {
    // EXTENSION POINT: Real voice cloning, integrate backend call here!
    if (msg.role === "user" && userVoiceProfile && userVoiceProfile.audioURL) {
      // Simulate playing a cloned-voice audio segment (just loop the sample for each message for demo)
      return new Promise((resolve) => {
        const audio = new Audio(userVoiceProfile.audioURL);
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });
    } else if (msg.role === "ai" && userVoiceProfile && userVoiceProfile.audioURL) {
      // Mimic AI's voice as user's if voice profile exists (parrot mode)
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
