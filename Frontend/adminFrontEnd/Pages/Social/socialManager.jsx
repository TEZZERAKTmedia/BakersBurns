import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios';
import './social_manager.css';
import LoadingPage from '../../Components/loading';

const SocialLinksManager = () => {
  // State variables for managing links and form data
  const [socialLinks, setSocialLinks] = useState([]);
  const [formData, setFormData] = useState({ platform: '', url: '' });
  // New state for phone-specific data
  const [phoneDetails, setPhoneDetails] = useState({ countryCode: '+1', number: '' });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  
  // Loading states for various asynchronous actions
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const commonPlatforms = ['Facebook', 'X', 'Instagram', 'LinkedIn', 'YouTube', 'Email', 'Phone'];

  // Fetch the social links
  const fetchSocialLinks = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.get('/admin-social/social-links');
      setSocialLinks(response.data);
    } catch (err) {
      console.error('Error fetching social links:', err);
      setError('Failed to fetch social links.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // When the platform changes, reset URL (and phone details if needed)
  const handlePlatformChange = (e) => {
    const selectedPlatform = e.target.value;
    setFormData({ platform: selectedPlatform, url: '' });
    setIsCustomPlatform(selectedPlatform === 'Custom');
    setError('');
    if (selectedPlatform === 'Phone') {
      setPhoneDetails({ countryCode: '+1', number: '' });
    }
  };

  // Determine input type (only Email changes; Phone is handled separately)
  const getInputType = () => {
    switch (formData.platform) {
      case 'Email':
        return 'email';
      default:
        return 'url';
    }
  };

  // Determine placeholder text
  const getInputPlaceholder = () => {
    switch (formData.platform) {
      case 'Email':
        return 'Enter an email (e.g., example@example.com)';
      default:
        return 'Enter a URL (e.g., https://example.com)';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  // Reset the form to its initial state
  const resetForm = () => {
    setFormData({ platform: '', url: '' });
    setPhoneDetails({ countryCode: '+1', number: '' });
    setImage(null);
    setEditingId(null);
    setIsCustomPlatform(false);
    setError('');
  };

  // Helper function to format a 10-digit phone number with parentheses around the area code.
  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '').slice(0, 10);
    const area = cleaned.slice(0, 3);
    const rest = cleaned.slice(3);
    if (!area) return '';
    if (rest) {
      return `(${area}) ${rest}`;
    }
    return `(${area})`;
  };

  // Combine country code and phone number for submission.
  const combinePhoneNumber = () => {
    return `${phoneDetails.countryCode} ${phoneDetails.number}`;
  };

  // Handle form submission for both adding and editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.platform === 'Phone') {
      if (phoneDetails.number.length !== 10) {
        setError("Phone number must be exactly 10 digits.");
        return;
      }
    } else {
      if (!formData.platform || !formData.url) {
        setError("All fields are required.");
        return;
      }
    }

    const payload = new FormData();
    payload.append("platform", formData.platform);
    if (formData.platform === 'Phone') {
      payload.append("url", combinePhoneNumber());
    } else {
      payload.append("url", formData.url);
    }
    if (image) payload.append("image", image);

    setIsSaving(true);
    try {
      if (editingId) {
        await adminApi.put(`/admin-social/social-links/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await adminApi.post("/admin-social/social-links", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await fetchSocialLinks();
      resetForm();
    } catch (err) {
      console.error("Error saving social link:", err);
      setError("Failed to save social link. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Populate form fields when editing an existing link
  const handleEdit = (link) => {
    setEditingId(link.id);
    setFormData({ platform: link.platform, url: link.url });
    setImage(null);
    setIsCustomPlatform(!commonPlatforms.includes(link.platform));
    setError('');

    if (link.platform === 'Phone') {
      // Assume phone is stored as "countryCode number"
      const parts = link.url.split(' ');
      if (parts.length >= 2) {
        const countryCode = parts[0];
        const number = parts.slice(1).join('').replace(/\D/g, '').slice(0, 10);
        setPhoneDetails({ countryCode, number });
      } else {
        setPhoneDetails({ countryCode: '+1', number: link.url.replace(/\D/g, '').slice(0, 10) });
      }
    } else {
      setPhoneDetails({ countryCode: '+1', number: '' });
    }
  };

  // Handle delete click (show confirmation)
  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  // Confirm deletion and update the list
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminApi.delete(`/admin-social/social-links/${deleteConfirm}`);
      await fetchSocialLinks();
    } catch (err) {
      console.error('Error deleting social link:', err);
      setError('Failed to delete social link. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Show a full-page loading screen if any asynchronous action is in progress.
  if (isLoading) {
    return <LoadingPage message="Loading social links..." />;
  }
  if (isSaving) {
    return <LoadingPage message="Saving..." />;
  }
  if (isDeleting) {
    return <LoadingPage message="Deleting..." />;
  }

  return (
    <div className="social-links-manager">
      <h2>Manage Social Links</h2>
      {error && <p className="error">{error}</p>}

      {/* Form for Adding a New Link */}
      {!editingId && (
        <div className="form-section">
          <h3>Add New Link</h3>
          <form onSubmit={handleSubmit}>
            <label>Platform</label>
            <select name="platform" value={formData.platform} onChange={handlePlatformChange} required>
              <option value="" disabled>Select Platform</option>
              {commonPlatforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
              <option value="Custom">Custom</option>
            </select>

            {isCustomPlatform && (
              <>
                <label>Custom Platform</label>
                <input type="text" name="platform" value={formData.platform} onChange={handleInputChange} required />
              </>
            )}

            {/* For Phone, show a country code selector and formatted phone input */}
            {formData.platform === 'Phone' ? (
              <>
                <label>Phone</label>
                <div className="phone-input-group">
                  <select
                    value={phoneDetails.countryCode}
                    onChange={(e) => setPhoneDetails({ ...phoneDetails, countryCode: e.target.value })}
                    required
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    {/* Add more country codes as needed */}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(123) 4567890"
                    value={formatPhoneNumber(phoneDetails.number)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      setPhoneDetails({ ...phoneDetails, number: rawValue.slice(0, 10) });
                    }}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <label>URL</label>
                <input
                  type={getInputType()}
                  name="url"
                  placeholder={getInputPlaceholder()}
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}

            <label>Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleImageChange} />

            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Link"}
            </button>
          </form>
        </div>
      )}

      {/* Grid of Existing Social Links */}
      <div className="social-links-grid">
        {socialLinks.map((link) => (
          <div key={link.id} className="social-link-card">
            {editingId === link.id ? (
              <form onSubmit={handleSubmit} className="edit-form">
                <label>Platform</label>
                <select name="platform" value={formData.platform} onChange={handlePlatformChange} required>
                  <option value="" disabled>Select Platform</option>
                  {commonPlatforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>

                {isCustomPlatform && (
                  <>
                    <label>Custom Platform</label>
                    <input type="text" name="platform" value={formData.platform} onChange={handleInputChange} required />
                  </>
                )}

                {formData.platform === 'Phone' ? (
                  <>
                    <label>Phone</label>
                    <div className="phone-input-group">
                      <select
                        value={phoneDetails.countryCode}
                        onChange={(e) => setPhoneDetails({ ...phoneDetails, countryCode: e.target.value })}
                        required
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+91">+91</option>
                        {/* Add more country codes as needed */}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="(123) 4567890"
                        value={formatPhoneNumber(phoneDetails.number)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          setPhoneDetails({ ...phoneDetails, number: rawValue.slice(0, 10) });
                        }}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label>URL</label>
                    <input
                      type={getInputType()}
                      name="url"
                      placeholder={getInputPlaceholder()}
                      value={formData.url}
                      onChange={handleInputChange}
                      required
                    />
                  </>
                )}

                <label>Image</label>
                <input type="file" name="image" accept="image/*" onChange={handleImageChange} />

                <div className="edit-actions">
                  <button type="submit" disabled={isSaving}>Save</button>
                  <button type="button" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p>
                  <strong>{link.platform}</strong>:{" "}
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                </p>
                {link.image && (
                  <img
                    className="social-link-image"
                    src={`${import.meta.env.VITE_BACKEND}/socialIcons/${link.image}`}
                    alt={link.platform}
                  />
                )}
                <div className="button-group">
                  <button className="edit-btn" onClick={() => handleEdit(link)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(link.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this social link?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={() => setDeleteConfirm(null)}>No</button>
        </div>
      )}
    </div>
  );
};

export default SocialLinksManager;
