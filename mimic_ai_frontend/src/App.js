import React, { useState, useRef } from "react";
import "./App.css";
import "./index.css";
import Sidebar from "./components/Sidebar";
import ChatPane from "./components/ChatPane";
import EmotionAnalytics from "./components/EmotionAnalytics";
import BehaviorSummary from "./components/BehaviorSummary";
import VoiceSetupModal from "./components/VoiceSetupModal";
import UserProfile from "./components/UserProfile";

/**
 * PUBLIC_INTERFACE
 * Main App component for Mimic.AI-M1 dashboard.
 *
 * Provides the modern minimal dashboard layout, navigation sidebar, chat pane, analytics, and user interaction modals.
 */
function App() {
  // theme state (light/dark, with persistent effect)
  const [theme, setTheme] = useState("light");
  const [voiceSetupOpen, setVoiceSetupOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  // App-level voice profile state (for user voice cloning)
  const [userVoiceProfile, setUserVoiceProfile] = useState(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Listen for event-based requests to open voice setup modal from elsewhere
  React.useEffect(() => {
    const handler = (e) => {
      // Optionally, allow event.detail.onEnroll to update voice profile directly
      setVoiceSetupOpen(true);
      if (e.detail && typeof e.detail.onEnroll === "function") {
        // special: parent wiring for manual tests, unused in default app flow
        // we'll call setUserVoiceProfile after enrollment modal closes
      }
    };
    window.addEventListener("openVoiceSetup", handler);
    return () => window.removeEventListener("openVoiceSetup", handler);
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // PUBLIC_INTERFACE
  const openVoiceSetup = () => setVoiceSetupOpen(true);

  // PUBLIC_INTERFACE
  const closeVoiceSetup = () => setVoiceSetupOpen(false);

  // PUBLIC_INTERFACE
  const openUserProfile = () => setUserProfileOpen(true);

  // PUBLIC_INTERFACE
  const closeUserProfile = () => setUserProfileOpen(false);

  // Called when user completes voice enrollment
  const handleVoiceProfileEnrolled = (profileObj) => {
    setUserVoiceProfile(profileObj);
    setVoiceSetupOpen(false);
  };

  return (
    <div className="main-dashboard">
      {/* Navigation Sidebar */}
      <Sidebar
        onVoiceSetup={openVoiceSetup}
        onUserProfile={openUserProfile}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Central Content Panel */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="app-title">Mimic.AI-M1</h1>
        </div>
        <div className="dashboard-main">
          {/* Left: Chat and conversation */}
          <div className="dashboard-chat-pane">
            <ChatPane userVoiceProfile={userVoiceProfile} />
          </div>

          {/* Right: Analytics and emotion/behavior panels */}
          <div className="dashboard-panels">
            <EmotionAnalytics />
            <BehaviorSummary />
          </div>
        </div>
      </div>

      {/* Modals */}
      {voiceSetupOpen && (
        <VoiceSetupModal
          onClose={closeVoiceSetup}
          onVoiceProfileEnrolled={handleVoiceProfileEnrolled}
        />
      )}
      {userProfileOpen && (
        <UserProfile onClose={closeUserProfile} />
      )}
    </div>
  );
}

export default App;
