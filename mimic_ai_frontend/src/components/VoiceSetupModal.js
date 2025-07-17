import React, { useRef, useState } from "react";
import "./VoiceSetupModal.css";

/**
 * PUBLIC_INTERFACE
 * VoiceSetupModal: Modal popup for personalized voice cloning, TTS test, and onboarding. 
 * Handles collection and enrollment of a user's voice sample for later voice cloning.
 * Optionally accepts an onVoiceProfileEnrolled callback prop for integration with parent/app state.
 *
 * @param {Object} props
 * @param {function} props.onClose - Handle closing the modal
 * @param {function} [props.onVoiceProfileEnrolled] - Called with enrollment object (stub for backend integration)
 */
export default function VoiceSetupModal({ onClose, onVoiceProfileEnrolled }) {
  const [name, setName] = useState("");
  const [cloned, setCloned] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);  // stub for backend voice id
  const testText = useRef("Hello, this is your synthetic Mimic.AI voice.");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // PUBLIC_INTERFACE
  const onChangeName = (e) => setName(e.target.value);

  /**
   * PUBLIC_INTERFACE
   * Starts microphone recording of user's voice (enrollment sample).
   * When stopped, stores locally & triggers stub backend enrollment.
   */
  const startRecording = async () => {
    setIsRecording(true);
    setErrorMsg("");
    recordedChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        setIsRecording(false);
        // Simulate upload & enrollment (stub: replace with backend API call)
        fakeVoiceEnrollment(blob, name);
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      setErrorMsg("Could not access microphone. Please check browser permissions.");
      setIsRecording(false);
    }
  };

  // PUBLIC_INTERFACE
  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  /**
   * PUBLIC_INTERFACE
   * Simulate TTS using a generic/default voice (before enrollment or for test).
   */
  const playTest = () => {
    const utter = new window.SpeechSynthesisUtterance(testText.current);
    // Not using cloned voice here, just system default
    window.speechSynthesis.speak(utter);
  };

  /**
   * PUBLIC_INTERFACE
   * Play back the user's currently enrolled voice sample (not synthetic).
   */
  const playBack = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  /**
   * Stub: Mimics backend voice enrollment API, returns enrollment id async
   * Replace this function with actual backend API call for production
   */
  const fakeVoiceEnrollment = async (audioBlob, profileName) => {
    setUploading(true);
    setErrorMsg("");
    setTimeout(() => {
      // Simulate success+voice id
      const generatedId = "user_voice_" + Math.floor(Math.random() * 100000);
      setEnrollmentId(generatedId);
      setCloned(true);
      setUploading(false);
      // Placeholder: extend with API call and propagate enrollment for persistence in app
      if (onVoiceProfileEnrolled) {
        onVoiceProfileEnrolled({
          name: profileName,
          voiceEnrollmentId: generatedId,
          audioURL: audioURL,
        });
      }
    }, 1200);
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
            disabled={cloned || uploading}
          />
        </label>
        <div className="voice-record-row">
          <button
            className="voice-rec-btn"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={cloned || uploading}
          >
            {isRecording ? "🛑 Stop Recording" : "🎤 Record Voice"}
          </button>
          <button className="voice-test-btn" onClick={playTest} disabled={isRecording || uploading}>
            Test Standard Voice
          </button>
        </div>
        {errorMsg && <div className="voice-clone-feedback" style={{ color: 'var(--danger)' }}>{errorMsg}</div>}
        {uploading && (
          <div className="voice-clone-feedback" style={{ color: 'var(--secondary)' }}>
            Uploading & enrolling voice sample...
          </div>
        )}
        {cloned && audioURL && (
          <div className="voice-clone-feedback">
            <div>
              <button className="voice-play-btn" onClick={playBack}>
                ▶️ Play Voice Sample
              </button>
              <span className="voice-uploaded-msg">
                Voice enrolled! <br />Voice playback will use your voice for TTS where available.
              </span>
            </div>
            <audio src={audioURL} controls style={{ width: "100%" }}/>
            <div style={{ fontSize: "0.9em", marginTop: 7 }}>
              Enrollment ID: <span style={{fontFamily:'monospace'}}>{enrollmentId}</span>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <span className="modal-tip">
            Your voice sample enables personalized playback in chat. Voice cloning is securely processed.
          </span>
        </div>
      </div>
    </div>
  );
}
