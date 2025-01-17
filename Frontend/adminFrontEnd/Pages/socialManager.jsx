import React, { useState, useEffect } from 'react';
import { adminApi } from '../config/axios';
import '../Pagecss/social_manager.css';

const SocialLinksManager = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [formData, setFormData] = useState({ platform: '', url: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);

  const commonPlatforms = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube'];

  // Fetch existing social links on load
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await adminApi.get('/admin-social/social-links');
        setSocialLinks(response.data);
      } catch (err) {
        console.error('Error fetching social links:', err);
        setError('Failed to fetch social links.');
      }
    };

    fetchSocialLinks();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle platform selection
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

  // Add or update a social link
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update existing link
        await adminApi.put(`/admin-social/social-links/${editingId}`, formData);
        setSocialLinks((prev) =>
          prev.map((link) =>
            link.id === editingId ? { ...link, ...formData } : link
          )
        );
        setIsEditing(false);
        setEditingId(null);
      } else {
        // Add new link
        const response = await adminApi.post('/admin-social/social-links', formData);
        setSocialLinks([...socialLinks, response.data.link]);
      }
      setFormData({ platform: '', url: '' });
      setIsCustomPlatform(false);
      setError('');
    } catch (err) {
      console.error('Error saving social link:', err);
      setError('Failed to save social link. Please try again.');
    }
  };

  // Edit a link
  const handleEdit = (link) => {
    setIsEditing(true);
    setEditingId(link.id);
    setFormData({ platform: link.platform, url: link.url });
    setIsCustomPlatform(!commonPlatforms.includes(link.platform));
  };

  // Delete a link
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
    <div className='form-section' style={styles.container}>
      <h2>Manage Social Links</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <select
          name="platform"
          value={isCustomPlatform ? 'Custom' : formData.platform}
          onChange={handlePlatformChange}
          style={styles.select}
          required
        >
          <option value="" disabled>Select Platform</option>
          {commonPlatforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
          <option value="Custom">Custom</option>
        </select>
        {isCustomPlatform && (
          <input
            type="text"
            name="platform"
            placeholder="Custom Platform"
            value={formData.platform}
            onChange={handleInputChange}
            style={styles.input}
            required
          />
        )}
        <input
          type="url"
          name="url"
          placeholder="URL (e.g., https://example.com)"
          value={formData.url}
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          {isEditing ? 'Update Link' : 'Add Link'}
        </button>
      </form>

      <div style={styles.list}>
        {socialLinks.map((link) => (
          <div  className='form-section' key={link.id} style={styles.linkItem}>
            <span style={styles.linkText}>
              {link.platform}: <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
            </span>
            <button onClick={() => handleEdit(link)} style={styles.editButton}>Edit</button>
            <button onClick={() => handleDelete(link.id)} style={styles.deleteButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline styles for simplicity
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  list: {
    marginTop: '20px',
  },
  linkItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  linkText: {
    flex: 1,
    marginRight: '10px',
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SocialLinksManager;
