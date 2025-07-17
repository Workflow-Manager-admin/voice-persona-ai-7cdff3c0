import React from "react";
import "./BehaviorSummary.css";

/**
 * PUBLIC_INTERFACE
 * BehaviorSummary: Displays behavior summary cards (e.g., most-used style, response times, persona settings).
 */
export default function BehaviorSummary() {
  // Simulated data for now - replace with API integration as needed
  const summaries = [
    {
      label: "Most-used Persona",
      value: "Professional",
      icon: "🧑‍💼",
      accent: "#2F80ED",
    },
    {
      label: "Avg Response Time",
      value: "1.2s",
      icon: "⏱️",
      accent: "#21E6C1",
    },
    {
      label: "Voice Clone Status",
      value: "Ready",
      icon: "🔗",
      accent: "#F9A826",
    },
    {
      label: "Total Conversations",
      value: "26",
      icon: "💬",
      accent: "#6C63FF",
    },
  ];

  return (
    <section className="behavior-summary">
      <h3>Behavior Summary</h3>
      <div className="behavior-cards-row">
        {summaries.map((el) => (
          <div className="behavior-card" key={el.label} style={{borderColor: el.accent}}>
            <span className="behavior-icon" style={{color: el.accent}}>{el.icon}</span>
            <div className="behavior-info">
              <span className="behavior-val">{el.value}</span>
              <span className="behavior-label">{el.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
