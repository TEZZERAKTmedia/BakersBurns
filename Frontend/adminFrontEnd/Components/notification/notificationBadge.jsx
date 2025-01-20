import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {adminApi} from '../../config/axios';

const NotificationBadge = ({ apiEndpoint, customFilter, color, label }) => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await adminApi.get(apiEndpoint);
        const fetchedData = response.data;
        console.log(response.data);

        // Ensure the data is an array before applying customFilter
        if (Array.isArray(fetchedData)) {
          const filteredData = customFilter
            ? customFilter(fetchedData)
            : fetchedData;
          setData(fetchedData);
          setCount(filteredData.length);
        } else {
          throw new Error('Unexpected data format. Expected an array.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint, customFilter]);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={{ ...styles.badge, backgroundColor: color }}>
      {label}: {count}
    </div>
  );
};

NotificationBadge.propTypes = {
  apiEndpoint: PropTypes.string.isRequired, // API URL to fetch data
  customFilter: PropTypes.func, // Custom filter function for data
  color: PropTypes.string, // Background color for the badge
  label: PropTypes.string.isRequired, // Label for the notification type
};

NotificationBadge.defaultProps = {
  customFilter: null,
  color: 'gray',
};

const styles = {
  badge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.5rem',
    textAlign: 'center',
    minWidth: '50px',
  },
  loading: {
    fontSize: '0.8rem',
    color: 'gray',
  },
  error: {
    fontSize: '0.8rem',
    color: 'red',
  },
};

export default NotificationBadge;
