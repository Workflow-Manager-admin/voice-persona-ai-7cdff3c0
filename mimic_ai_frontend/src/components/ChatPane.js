import React, { useState, useRef } from "react";
import "./ChatPane.css";

/**
 * PUBLIC_INTERFACE
 * ChatPane: Handles real-time voice and text chat, conversation simulation, emotion feedback, and playback controls.
 * Integrates user voice cloning for playback (uses mimicked voice if available). 
 * Updates live emotion analytics whenever user sends a new message. 
 * All backend voice integration points are stubbed for extension.
 * Accepts a 'onNewEmotionResult' prop callback to notify parent of new emotion analysis result.
 * 
 * Now: ALL AI responses are generated using both user persona *and* the latest detected emotion.
 * All responses are spoken using the enrolled/setup voice.
 * Backend LLM extension stubs are clearly marked for future rich persona+emotion adaptation.
 */
export default function ChatPane({ userVoiceProfile: propUserVoiceProfile, onNewEmotionResult }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi there! I’m your Mimic.AI persona. How can I assist you today?", emotion: "🙂" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Local user voice profile state (from prop, e.g. from VoiceSetup flow)
  const [userVoiceProfile, setUserVoiceProfile] = useState(propUserVoiceProfile || null);
  const recognitionRef = useRef(null);

  // Current emotion state (default: happy/calm)
  const [currentEmotion, setCurrentEmotion] = useState({
    emotions: [
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
    // Default: simple cycling mock
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
    const which = base % choices.length;
    return choices[which];
  }

  // PUBLIC_INTERFACE
  const handleInputChange = (e) => setInput(e.target.value);

  /**
   * PUBLIC_INTERFACE
   * Generates an AI reply that mimics the user's personality and ADAPTS tone in real-time
   * to the latest detected emotion. The output is a novel statement, not a paraphrase,
   * with tone and word choice influenced by both persona and emotion.
   * 
   * === EXTENSION POINT for rich backend-driven persona + emotion-aware responses ===
   * 
   * To extend: Replace this function with a backend call providing:
   *   - Dialog history,
   *   - User’s persona/profile (from voice enrollment/profile storage),
   *   - Most recent detected emotion (from emotionResult),
   * and return a fully backend-generated, context- and emotion-aware response.
   *
   * @param {string} userText - The user's input message
   * @param {Object} emotionResult - The emotion result associated with the user input
   * @param {Object} personaProfile - Typically from userVoiceProfile, may contain persona/style info
   * @returns {string} - An AI response adapted for both persona and emotion
   */
  function generatePersonalityAndEmotionReply(userText, emotionResult, personaProfile) {
    // === Persona + Emotion Adaptation Stub ===
    // In a full implementation, all three data points (persona, emotion, input) would be sent to an LLM.
    // This stub demonstrates in-prototype synthesis for BOTH persona and emotion.

    // Simulated persona styles (could be dynamic from personaProfile)
    const personaStyles = [
      {
        name: 'Friendly & Supportive',
        opening: [
          "Absolutely! Here's a thought:",
          "I hear you loud and clear –",
          "Let's explore this together:",
          "That made me think:",
        ],
        followup: [
          "Do you want to talk more about it?",
          "What would you do differently next time?",
          "That's just my perspective – what's yours?",
          "How does that make you feel?",
          "I'm always here to listen!",
        ],
        baseTone: "friendly"
      },
      {
        name: 'Analytical & Calm',
        opening: [
          "Interesting point. Statistically speaking,",
          "If we break it down,",
          "Taking a step back,",
          "It appears that ",
        ],
        followup: [
          "Would you agree with that assessment?",
          "That's worth further investigation.",
          "Let's consider possible alternatives.",
          "What do you think are the next steps?",
          "Is there a specific aspect you want to focus on?",
        ],
        baseTone: "analytical"
      },
      {
        name: 'Playful & Witty',
        opening: [
          "You know, that totally sparks my circuits!",
          "Haha, love that energy!",
          "Let me toss an idea your way:",
          "Off the top of my virtual head:",
        ],
        followup: [
          "Care to challenge my robotic wisdom?",
          "I double-click on that notion!",
          "Ping me with your wildest thoughts.",
          "That's my story and I'm sticking to it. How about you?",
        ],
        baseTone: "playful"
      },
    ];

    // Pick persona (using enrolled userVoiceProfile's name, or fallback hash)
    const personaIndex =
      (personaProfile && personaProfile.name)
        ? (personaProfile.name.charCodeAt(0) % personaStyles.length)
        : (userText && userText.length
          ? userText.charCodeAt(0) % personaStyles.length
          : 0);
    const persona = personaStyles[personaIndex];

    // Emotion logic: tone/word modifiers based on dominant detected emotion
    let emotionCue = "";
    let emotionOpeningMod = "";
    let emotionFollowupMod = "";
    const dominant = (emotionResult && emotionResult.dominant) ? emotionResult.dominant : "";
    const emoji = (emotionResult && emotionResult.emoji) ? emotionResult.emoji : "";

    switch (dominant) {
      case "Excited":
        emotionCue = "There's such energetic vibes!";
        emotionOpeningMod = "brimming with enthusiasm, ";
        emotionFollowupMod = "Let's seize this moment.";
        break;
      case "Frustrated":
        emotionCue = "I sense some frustration. It's totally okay.";
        emotionOpeningMod = "gentle and understanding, ";
        emotionFollowupMod = "We'll work through any challenge.";
        break;
      case "Calm":
        emotionCue = "The conversation feels calm and thoughtful.";
        emotionOpeningMod = "with a peaceful tone, ";
        emotionFollowupMod = "Let's consider this calmly.";
        break;
      case "Happy":
        emotionCue = "The positive energy is contagious!";
        emotionOpeningMod = "with an upbeat note, ";
        emotionFollowupMod = "Glad for this great mood!";
        break;
      default:
        break;
    }

    // Use parts of user message only for theme hints
    const words = userText.match(/\b\w{4,}\b/g) || [];
    const keyword = words.length > 0 ? words[Math.floor(Math.random() * words.length)] : "";
    const themeHint = keyword ? `Something about "${keyword.toLowerCase()}" is intriguing.` : "";

    // Compose message using persona+emotion stubs
    const opening = persona.opening[Math.floor(Math.random() * persona.opening.length)];
    const followup = persona.followup[Math.floor(Math.random() * persona.followup.length)];

    // Terse input/empty
    if (!userText.trim() || userText.trim().length < 3) {
      return `${opening} ${
        emotionOpeningMod ? "(" + emotionOpeningMod + ")" : ""
      } I'm here whenever you're ready to chat. ${emoji} ${emotionFollowupMod ? emotionFollowupMod : followup}`;
    }
    // Question
    if (userText.trim().endsWith("?")) {
      return `${opening} ${
        emotionOpeningMod ? "(" + emotionOpeningMod + ")" : ""
      } That's a thoughtful question. ${themeHint} ${
        emotionCue
      } Here's my take: staying curious matters! ${emoji} ${emotionFollowupMod ? emotionFollowupMod : followup}`;
    }
    if (dominant === "Excited") {
      return `${opening} (excited tone) ${emotionCue} Let's ride that energy forward. ${emoji} ${emotionFollowupMod ? emotionFollowupMod : followup}`;
    }
    if (dominant === "Frustrated") {
      return `${opening} (soothing tone) ${emotionCue} It might be tough, but we grow from these moments. ${emoji} ${emotionFollowupMod ? emotionFollowupMod : followup}`;
    }
    if (dominant === "Calm") {
      return `${opening} (calm style) ${emotionCue} Maybe it's time for a new idea? ${emoji} ${emotionFollowupMod ? emotionFollowupMod : followup}`;
    }
    if (dominant === "Happy") {
      return `${opening} (happy vibe) ${emotionCue} ${themeHint} ${emoji} ${emotionFollowupMod ? emotionFollowupMod : followup}`;
    }

    // Default
    return `${opening} ${themeHint} ${emotionCue} Let me know your thoughts. ${emoji} ${followup}`;
  }

  // PUBLIC_INTERFACE
  // Now: AI mimics, paraphrases, and varies the reply, matching observed style and real-time emotion.
  const handleSend = async () => {
    if (input.trim() === "") return;
    const userText = input;
    // 1. Analyze emotion based on userText
    const emotionResult = analyzeEmotion(userText);
    setCurrentEmotion(emotionResult);

    // 2. Propagate emotion result to parent for emotion analytics update
    if (onNewEmotionResult) onNewEmotionResult(emotionResult);

    // 3. Append user message (with emotion)
    const userMsg = {
      role: "user",
      text: userText,
      emotion: emotionResult.emoji,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 4. Generate AI response using persona+emotion (stubbed for backend), then playback via enrolled voice
    setTimeout(async () => {
      const aiText = generatePersonalityAndEmotionReply(userText, emotionResult, userVoiceProfile);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: aiText,
          emotion: emotionResult.emoji,
          mimicked: true,
        },
      ]);
      // Playback AI reply using setup/enrolled voice
      await synthesizeVoiceWithUserProfile({
        role: "ai",
        text: aiText,
        emotion: emotionResult.emoji,
      });
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
      // DEMO: Always replay stored sample for every message. (Replace for true TTS in prod)
      return new Promise((resolve) => {
        const audio = new Audio(userVoiceProfile.audioURL);
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });
      // BACKEND EXTENSION: fetch `/api/tts?voiceId=...&text=...`
    } else {
      // System TTS fallback
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
