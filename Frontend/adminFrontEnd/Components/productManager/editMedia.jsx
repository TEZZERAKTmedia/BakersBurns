import React, { useState } from "react";

const EditMediaModal = ({ media, onClose, onSave }) => {
  const [newFile, setNewFile] = useState(null);

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("media", newFile);

    try {
      await onSave(media.id, formData); // API call to update media
      onClose();
    } catch (error) {
      console.error("Error updating media:", error);
      alert("Failed to update media. Please try again.");
    }
  };

  return (
    <div className="edit-media-modal">
      <h3>Edit Media</h3>
      <p>Current Media:</p>
      {media.type === "image" ? (
        <img src={media.url} alt="Current Media" className="current-media" />
      ) : (
        <video src={media.url} controls className="current-media"></video>
      )}
      <label>
        Upload New Media:
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
      </label>
      <div className="modal-actions">
        <button onClick={handleSave} disabled={!newFile}>
          Save
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditMediaModal;
