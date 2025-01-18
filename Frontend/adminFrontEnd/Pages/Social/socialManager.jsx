import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios';
import './social_manager.css';

const SocialLinksManager = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [formData, setFormData] = useState({ platform: '', url: '' });
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);

  const commonPlatforms = ['Facebook', 'X', 'Instagram', 'LinkedIn', 'YouTube'];

  // Fetch existing social links
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await adminApi.get('/admin-social/social-links');
        console.log(response.data)
        setSocialLinks(response.data);
      } catch (err) {
        console.error('Error fetching social links:', err);
        setError('Failed to fetch social links.');
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
    if (selectedPlatform === 'Custom') {
      setIsCustomPlatform(true);
      setFormData({ ...formData, platform: '' });
    } else {
      setIsCustomPlatform(false);
      setFormData({ ...formData, platform: selectedPlatform });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      setImage(file);
    }
  };

  const resetForm = () => {
    setFormData({ platform: '', url: '' });
    setImage(null);
    setIsCustomPlatform(false);
    setIsEditing(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.platform || !formData.url || !image) {
      setError('All fields, including the image, are required.');
      return;
    }

    const payload = new FormData();
    payload.append('platform', formData.platform);
    payload.append('url', formData.url);
    payload.append('image', image);

    console.log('Payload before API request:');
    for (let [key, value] of payload.entries()) {
      if (key === 'image') {
        console.log(key, value.name);
      } else {
        console.log(key, value);
      }
    }

    try {
      const response = await adminApi.post('/admin-social/social-links', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSocialLinks([...socialLinks, response.data.link]);
      resetForm();
    } catch (err) {
      console.error('Error saving social link:', err);
      setError('Failed to save social link. Please try again.');
    }
  };

  const handleEdit = (link) => {
    setIsEditing(true);
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

  return (
    <div className="social-links-manager">
      <h2>Manage Social Links</h2>
      {error && <p className="error">{error}</p>}
      <div className="social-link-form">
        <form onSubmit={handleSubmit}>
          <label>
            Platform
            <select
              name="platform"
              value={isCustomPlatform ? 'Custom' : formData.platform}
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
                placeholder="Custom Platform"
                value={formData.platform}
                onChange={handleInputChange}
                required
              />
            </label>
          )}
          <label>
            URL
            <input
              type="url"
              name="url"
              placeholder="URL (e.g., https://example.com)"
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
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit">
              {isEditing ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
      <div className="social-links-grid">
        {socialLinks.map((link) => (
          <div key={link.id} className="social-link-card">
            <p>
              <strong>{link.platform}</strong>:{' '}
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </p>
            {link.image && <img style={{width:'50px', height:'50px'}} src={`${import.meta.env.VITE_BACKEND}/socialIcons/${link.image}`} alt={link.platform} />}
            <div className="social-link-actions">
              <button className="edit-btn" onClick={() => handleEdit(link)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(link.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksManager;
