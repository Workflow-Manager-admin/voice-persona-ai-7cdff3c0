import React, { useState } from "react";
import "./UserProfile.css";

/**
 * PUBLIC_INTERFACE
 * UserProfile: Modal for showing and editing user profile information.
 * 
 * @param {Object} props
 * @param {function} props.onClose - Closes the modal window
 */
export default function UserProfile({ onClose }) {
  // Simulated user profile data
  const [profile, setProfile] = useState({
    username: "alex01",
    displayName: "Alex",
    persona: "Professional",
    email: "alex@email.com",
  });
  const [editMode, setEditMode] = useState(false);

  // PUBLIC_INTERFACE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // PUBLIC_INTERFACE
  const saveProfile = () => setEditMode(false);

  // PUBLIC_INTERFACE
  const toggleEdit = () => setEditMode((m) => !m);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose} title="Close">×</button>
        <h2>User Profile</h2>
        <div className="profile-fields">
          <div className="profile-row">
            <label>Username:</label>
            <input
              type="text"
              value={profile.username}
              name="username"
              readOnly
              disabled
              className="modal-input"
            />
          </div>
          <div className="profile-row">
            <label>Name:</label>
            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              disabled={!editMode}
              className="modal-input"
              onChange={handleChange}
            />
          </div>
          <div className="profile-row">
            <label>Persona:</label>
            <input
              type="text"
              name="persona"
              value={profile.persona}
              disabled={!editMode}
              className="modal-input"
              onChange={handleChange}
            />
          </div>
          <div className="profile-row">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled={!editMode}
              className="modal-input"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="profile-actions">
          <button className="modal-action-btn" onClick={toggleEdit}>
            {editMode ? "Cancel" : "Edit"}
          </button>
          {editMode && (
            <button className="modal-action-btn" onClick={saveProfile}>Save</button>
          )}
        </div>
      </div>
    </div>
  );
}
