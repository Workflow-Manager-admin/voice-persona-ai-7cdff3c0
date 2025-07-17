import React, { useState, useRef } from "react";
import "./ChatPane.css";

/**
 * PUBLIC_INTERFACE
 * ChatPane: Handles real-time voice and text chat, conversation simulation, emotion feedback, and playback controls.
 */
export default function ChatPane() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi there! I’m your Mimic.AI persona. How can I assist you today?", emotion: "🙂" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // PUBLIC_INTERFACE
  const playBackHistory = () => {
    setIsPlaying(true);
    let idx = 0;
    function speakNext() {
      if (idx >= messages.length) {
        setIsPlaying(false);
        return;
      }
      const msg = messages[idx];
      if (msg.role === "ai" || msg.role === "user") {
        const utter = new window.SpeechSynthesisUtterance(msg.text);
        // Minimal voice cloning simulation (real implementation uses cloned voice)
        window.speechSynthesis.speak(utter);
        utter.onend = () => {
          idx++;
          speakNext();
        };
      } else {
        idx++;
        speakNext();
      }
    }
    speakNext();
  };

  // PUBLIC_INTERFACE
  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
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
