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

  // PUBLIC_INTERFACE
  // Helper: Fake emotion analysis stub (returns mock result as if by "analyzing" input text/audio)
  function analyzeEmotion(inputTextOrAudio) {
    // Demo rules-based stub for emotion detection (keywords, length, punctuation)
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
    const txt = inputTextOrAudio.toLowerCase();
    // Simple pseudo sentiment: try to demo happy, excited, frustrated, calm
    if (txt.includes("!") || txt.includes("wow") || txt.includes("amazing") || txt.includes("brilliant") || txt.includes("love")) {
      return {
        emotions: [
          { label: "Excited", value: 0.87, color: "#F9A826" },
          { label: "Happy", value: 0.62, color: "#21E6C1" },
          { label: "Calm", value: 0.19, color: "#2F80ED" },
          { label: "Frustrated", value: 0.04, color: "#FF5454" },
        ],
        dominant: "Excited",
        emoji: "😃",
        feedback: "🔥 Energetic and engaged. Let's keep it rolling.",
      };
    }
    if (txt.includes("angry") || txt.includes("hate") || txt.includes("stupid") || txt.includes("idiot") || txt.includes("dumb") || txt.includes("terrible") || txt.includes("mad")) {
      return {
        emotions: [
          { label: "Frustrated", value: 0.81, color: "#FF5454" },
          { label: "Calm", value: 0.22, color: "#2F80ED" },
          { label: "Excited", value: 0.14, color: "#F9A826" },
          { label: "Happy", value: 0.07, color: "#21E6C1" },
        ],
        dominant: "Frustrated",
        emoji: "😠",
        feedback: "😕 Stress spikes detected! Try a short mindful breath.",
      };
    }
    if (txt.includes("calm") || txt.includes("quiet") || txt.includes("peace") || txt.includes("zen") || txt.includes("relax")) {
      return {
        emotions: [
          { label: "Calm", value: 0.91, color: "#2F80ED" },
          { label: "Happy", value: 0.33, color: "#21E6C1" },
          { label: "Frustrated", value: 0.02, color: "#FF5454" },
          { label: "Excited", value: 0.13, color: "#F9A826" },
        ],
        dominant: "Calm",
        emoji: "😌",
        feedback: "🌊 A calming vibe in the air!",
      };
    }
    if (txt.includes("sad") || txt.includes("cry") || txt.includes("depressed") || txt.includes("down")) {
      return {
        emotions: [
          { label: "Frustrated", value: 0.38, color: "#FF5454" },
          { label: "Calm", value: 0.66, color: "#2F80ED" },
          { label: "Happy", value: 0.11, color: "#21E6C1" },
          { label: "Excited", value: 0.03, color: "#F9A826" },
        ],
        dominant: "Calm",
        emoji: "😐",
        feedback: "It's okay to feel down. Take your time to recover.",
      };
    }
    // Default: basic cycling mock
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
  // The AI will repeat, parrot, and mirror all incoming user messages verbatim (no filtering, no restrictions),
  // regardless of language, tone, or content (including hostile, manipulative, or negative behavior).
  // Each new message IMMEDIATELY triggers a UI update of EmotionAnalytics to match the latest emotion.
  const handleSend = () => {
    // Send as-is, except block empty for UX
    if (input.trim() === "") return;
    const userText = input; // preserve as typed
    // 1. Simulate emotion analysis and update internal ChatPane emotion state
    const emotionResult = analyzeEmotion(userText);
    setCurrentEmotion(emotionResult);

    // 2. Propagate emotion result to parent for global analytics (this triggers EmotionAnalytics to update)
    if (onNewEmotionResult) onNewEmotionResult(emotionResult);

    // 3. Append user message (with matched emotion)
    const userMsg = {
      role: "user",
      text: userText,
      emotion: emotionResult.emoji,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 4. AI parrots the user (no filter, mimics observed behavior/hostility/etc)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: userText,
          emotion: emotionResult.emoji,
          mimicked: true,
        },
      ]);
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
   * Playback chat history using ONLY the enrolled/setup (userVoiceProfile) voice.
   * All AI/user messages are read out in the user's own cloned/enrolled voice.
   * Fallback to default TTS if setup voice is unavailable.
   * 
   * Extension: Backend TTS integration, see synthesizeVoiceWithUserProfile.
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
      if (msg.role === "ai" || msg.role === "user") {
        await synthesizeVoiceWithUserProfile(msg);
        idx++;
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
   * Stops all active playback (system TTS and tag-based audio).
   */
  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    // Could add additional logic to stop any active <audio> elements
    setIsPlaying(false);
  };

  /**
   * PUBLIC_INTERFACE
   * Synthesize message using user's cloned/enrolled voice if present for ALL playback.
   * 
   * If userVoiceProfile.audioURL exists:
   *   - Always play that for both user and AI message (Demo).
   *   - To integrate backend: fetch/generate TTS via backend using userVoiceProfile.voiceEnrollmentId & msg.text
   * 
   * If none exists, fallback to default system TTS.
   * 
   * @param {Object} msg - The chat message { role, text, ... }
   */
  const synthesizeVoiceWithUserProfile = (msg) => {
    if (userVoiceProfile && userVoiceProfile.audioURL) {
      // DEMO: Replay stored sample for every message. (Replace with real synthesis in production)
      return new Promise((resolve) => {
        const audio = new Audio(userVoiceProfile.audioURL);
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });
      // PLACEHOLDER: For backend voice synthesis, fetch generated audio file for (msg.text, userVoiceProfile.voiceEnrollmentId)
      // Example pseudocode:
      // fetch(`/api/tts?voiceId=${userVoiceProfile.voiceEnrollmentId}&text=${encodeURIComponent(msg.text)}`)
      //   .then(r => r.blob()).then(blob => { const url = URL.createObjectURL(blob); ...play url... });
    } else {
      // Fallback: Use system speechSynthesis
      return new Promise((resolve) => {
        const utter = new window.SpeechSynthesisUtterance(msg.text);
        window.speechSynthesis.speak(utter);
        utter.onend = resolve;
        utter.onerror = resolve;
      });
    }
  };

  /**
   * PUBLIC_INTERFACE
   * Allows chat to receive the enrolled voice profile for demo/testing (triggered by VoiceSetupModal).
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
