import React from "react";
import "../App.css";

/**
 * PUBLIC_INTERFACE
 * Sidebar navigation for the Mimic.AI-M1 dashboard.
 * 
 * @param {Object} props
 * @param {function} props.onVoiceSetup - Opens Voice Setup modal
 * @param {function} props.onUserProfile - Opens User Profile modal
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {function} props.toggleTheme - Handler to switch theme
 */
export default function Sidebar({ onVoiceSetup, onUserProfile, theme, toggleTheme }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-accent">⦿</span>
        <span className="logo-main">Mimic.AI</span>
      </div>
      <div className="sidebar-nav">
        <button className="sidebar-btn" onClick={onUserProfile} title="User Profile">
          <span role="img" aria-label="Profile">👤</span> Profile
        </button>
        <button className="sidebar-btn" onClick={onVoiceSetup} title="Voice Setup">
          <span role="img" aria-label="Voice Setup">🎤</span> Voice Setup
        </button>
        <a
          className="sidebar-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </a>
      </div>
      <div className="sidebar-actions">
        <button className="sidebar-theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
