import React from "react";
import "./EmotionAnalytics.css";

/**
 * PUBLIC_INTERFACE
 * EmotionAnalytics: Visualizes recent emotion analysis and AI emotion feedback for the session.
 * Accepts live emotion data (emotions and feedback) via props.
 * 
 * @param {Object} props
 * @param {Array} [props.emotions] - Array of {label, value, color}
 * @param {string} [props.feedback] - Feedback string
 */
export default function EmotionAnalytics({ emotions, feedback }) {
  // Fallback demo values if not passed props
  const demoEmotions = [
    { label: "Happy", value: 0.85, color: "#21E6C1" },
    { label: "Calm", value: 0.72, color: "#2F80ED" },
    { label: "Excited", value: 0.44, color: "#F9A826" },
    { label: "Frustrated", value: 0.1, color: "#FF5454" },
  ];
  const usedEmotions = emotions && Array.isArray(emotions) ? emotions : demoEmotions;
  const usedFeedback = typeof feedback === "string"
    ? feedback
    : (usedEmotions[0] && usedEmotions[0].value > 0.7
      ? "😊 Positive mood detected! Conversation is adaptive."
      : "💡 Try to relax and let your persona flow naturally.");

  return (
    <section className="emotion-analytics card">
      <h3>Emotion Analysis</h3>
      <div className="emotion-bars">
        {usedEmotions.map((emo) => (
          <div key={emo.label} className="emotion-bar-row">
            <span className="emotion-label">{emo.label}</span>
            <div className="emotion-bar-outer">
              <div
                className="emotion-bar-inner"
                style={{
                  width: `${Math.round(emo.value * 100)}%`,
                  background: emo.color,
                }}
              />
            </div>
            <span className="emotion-val">{Math.round(emo.value * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="emotion-feedback">
        <span className="emotion-tip">
          {usedFeedback}
        </span>
      </div>
    </section>
  );
}
