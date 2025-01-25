import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios';
import './social_manager.css'; // Import the CSS file for styling
import LoadingPage from '../../Components/loading'; // Import the loading page component

const SocialLinksManager = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [formData, setFormData] = useState({ platform: '', url: '' });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isSaving, setIsSaving] = useState(false); // Saving state

  const commonPlatforms = ['Facebook', 'X', 'Instagram', 'LinkedIn', 'YouTube', 'Email', 'Phone'];

  // Fetching social links from the API
  useEffect(() => {
    const fetchSocialLinks = async () => {
      setIsLoading(true); // Set loading to true while fetching data
      try {
        const response = await adminApi.get('/admin-social/social-links');
        setSocialLinks(response.data);
      } catch (err) {
        console.error('Error fetching social links:', err);
        setError('Failed to fetch social links.');
      } finally {
        setIsLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchSocialLinks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlatformChange = (e) => {
    const selectedPlatform = e.target.value;
    setFormData({ platform: selectedPlatform, url: '' });
    setIsCustomPlatform(selectedPlatform === 'Custom');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const resetForm = () => {
    setFormData({ platform: '', url: '' });
    setImage(null);
    setEditingId(null);
    setIsCustomPlatform(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.platform || !formData.url) {
      setError('All fields are required.');
      return;
    }

    const payload = new FormData();
    payload.append('platform', formData.platform);
    payload.append('url', formData.url);

    if (image) {
      payload.append('image', image);
    }

    setIsSaving(true); // Set saving to true while saving data
    try {
      if (editingId) {
        // Update existing link
        await adminApi.put(`/admin-social/social-links/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setSocialLinks((prev) =>
          prev.map((link) =>
            link.id === editingId
              ? { ...link, ...formData, image: image ? URL.createObjectURL(image) : link.image }
              : link
          )
        );
      } else {
        // Create new link
        const response = await adminApi.post('/admin-social/social-links', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setSocialLinks([...socialLinks, response.data.link]);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving social link:', err);
      setError('Failed to save social link. Please try again.');
    } finally {
      setIsSaving(false); // Set saving to false once data is saved
    }
  };

  const handleEdit = (link) => {
    setEditingId(link.id);
    setFormData({ platform: link.platform, url: link.url });
    setIsCustomPlatform(!commonPlatforms.includes(link.platform));
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.delete(`/admin-social/social-links/${id}`);
      setSocialLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (err) {
      console.error('Error deleting social link:', err);
      setError('Failed to delete social link. Please try again.');
    }
  };

  const getInputType = () => {
    switch (formData.platform) {
      case 'Email':
        return 'email';
      case 'Phone':
        return 'tel';
      default:
        return 'url';
    }
  };

  const getInputPlaceholder = () => {
    switch (formData.platform) {
      case 'Email':
        return 'Enter an email (e.g., example@example.com)';
      case 'Phone':
        return 'Enter a phone number (e.g., +1234567890)';
      default:
        return 'Enter a URL (e.g., https://example.com)';
    }
  };

  if (isLoading) {
    return <LoadingPage />; // Display Loading Page while data is being fetched
  }

  return (
    <div className="social-links-manager">
      <h2 style={{marginTop:'10%'}}></h2>
      {error && <p className="error">{error}</p>}

      {/* Add New Link Form */}
      {!editingId && (
        <div className="social-link-form">
          <form onSubmit={handleSubmit}>
            <label>
              Platform
              <select
                name="platform"
                value={formData.platform}
                onChange={handlePlatformChange}
                required
              >
                <option value="" disabled>
                  Select Platform
                </option>
                {commonPlatforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
            </label>
            {isCustomPlatform && (
              <label>
                Custom Platform
                <input
                  type="text"
                  name="platform"
                  placeholder="Enter a custom platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                />
              </label>
            )}
            <label>
              {formData.platform === 'Email'
                ? 'Email Address'
                : formData.platform === 'Phone'
                ? 'Phone Number'
                : 'URL'}
              <input
                type={getInputType()}
                name="url"
                placeholder={getInputPlaceholder()}
                value={formData.url}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Image
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            <button type="submit" disabled={isSaving}>Add Link</button>
          </form>
        </div>
      )}

      {/* Social Links Grid */}
      <div className="social-links-grid">
        {socialLinks.map((link) => (
          <div key={link.id} className="social-link-card">
            {editingId === link.id ? (
              <form onSubmit={handleSubmit} className="edit-form">
                <label>
                  Platform
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handlePlatformChange}
                    required
                  >
                    <option value="" disabled>
                      Select Platform
                    </option>
                    {commonPlatforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                    <option value="Custom">Custom</option>
                  </select>
                </label>
                {isCustomPlatform && (
                  <label>
                    Custom Platform
                    <input
                      type="text"
                      name="platform"
                      placeholder="Enter a custom platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                )}
                <label>
                  {formData.platform === 'Email'
                    ? 'Email Address'
                    : formData.platform === 'Phone'
                    ? 'Phone Number'
                    : 'URL'}
                  <input
                    type={getInputType()}
                    name="url"
                    placeholder={getInputPlaceholder()}
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Image
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <button type="submit" disabled={isSaving}>Save</button>
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p>
                  <strong>{link.platform}</strong>:{' '}
                  {link.platform === 'Phone' ? (
                    <a href={`tel:${link.url}`}>{link.url}</a>
                  ) : link.platform === 'Email' ? (
                    <a href={`mailto:${link.url}`}>{link.url}</a>
                  ) : (
                    <a  href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </a>
                  )}
                </p>
                {link.image && (
                  <img
                    style={{ width: '50px', height: '50px' }}
                    src={`${import.meta.env.VITE_BACKEND}/socialIcons/${link.image}`}
                    alt={link.platform}
                  />
                )}
                <div className="social-link-actions">
                  <button className="edit-btn" onClick={() => handleEdit(link)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(link.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksManager;
