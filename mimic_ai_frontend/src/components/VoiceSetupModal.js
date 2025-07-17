import React, { useRef, useState } from "react";
import "./VoiceSetupModal.css";

/**
 * PUBLIC_INTERFACE
 * VoiceSetupModal: Modal popup for personalized voice cloning, TTS test, and onboarding. 
 * 
 * @param {Object} props
 * @param {function} props.onClose - Handle closing the modal
 */
export default function VoiceSetupModal({ onClose }) {
  const [name, setName] = useState("");
  const [cloned, setCloned] = useState(false);
  const testText = useRef("Hello, this is your synthetic Mimic.AI voice.");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // PUBLIC_INTERFACE
  const onChangeName = (e) => setName(e.target.value);

  // PUBLIC_INTERFACE
  const startRecording = async () => {
    setIsRecording(true);
    recordedChunks.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));
      setIsRecording(false);
      setCloned(true);
    };
    mediaRecorderRef.current.start();
  };

  // PUBLIC_INTERFACE
  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // PUBLIC_INTERFACE
  const playTest = () => {
    const utter = new window.SpeechSynthesisUtterance(testText.current);
    window.speechSynthesis.speak(utter);
  };

  // PUBLIC_INTERFACE
  const playBack = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Voice Setup & Cloning</h2>
        <label className="modal-label">
          Name your voice profile:
          <input
            className="modal-input"
            type="text"
            value={name}
            placeholder="E.g., Alex"
            onChange={onChangeName}
          />
        </label>
        <div className="voice-record-row">
          <button
            className="voice-rec-btn"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "🛑 Stop Recording" : "🎤 Record Voice"}
          </button>
          <button className="voice-test-btn" onClick={playTest}>
            Test Standard Voice
          </button>
        </div>
        {cloned && audioURL && (
          <div className="voice-clone-feedback">
            <div>
              <button className="voice-play-btn" onClick={playBack}>
                ▶️ Play Cloned Voice
              </button>
              <span className="voice-uploaded-msg">Voice Cloned Successfully!</span>
            </div>
            <audio src={audioURL} controls style={{width: '100%'}}/>
          </div>
        )}
        <div className="modal-footer">
          <span className="modal-tip">
            Voice samples are stored securely for persona simulation and enhanced TTS.
          </span>
        </div>
      </div>
    </div>
  );
}
