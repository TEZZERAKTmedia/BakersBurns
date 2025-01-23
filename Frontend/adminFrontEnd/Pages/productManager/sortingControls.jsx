import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios'; // Import adminApi for API requests

const SortingControls = ({
  onSort,
  sortCriteria,
  sortOrder,
  onFilterByType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  const sortOptions = [
    { label: 'Most Recent', value: 'createdAt' },
    { label: 'Name', value: 'name' },
    { label: 'Type', value: 'type' },
    { label: 'Price', value: 'price' },
  ];

  // Fetch product types from the backend using adminApi
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await adminApi.get('/products/types');
        setProductTypes(response.data);  // Save the fetched product types
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  const handleSortClick = (value) => {
    onSort(value);
    setIsOpen(false);
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setSelectedType(selectedType);
    if (selectedType) {
      onFilterByType(selectedType);  // Filter products by selected type
    } else {
      onFilterByType();  // Reset the filter if no type is selected
    }
  };

  return (
    <div className="form-section">
      {/* Button to toggle sorting options */}
      <button onClick={() => setIsOpen(!isOpen)} style={{ marginBottom: '10px' }}>
        Sort By {isOpen ? '▲' : '▼'} {/* Arrow icon to indicate whether options are open or closed */}
      </button>

      {/* Sorting options that open/close based on the `isOpen` state */}
      {isOpen && (
        <div className="sorting-options">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortClick(option.value)}
              className={sortCriteria === option.value ? 'active-sort' : ''}
              style={{ margin: '5px' }}
            >
              {option.label} ({sortCriteria === option.value && sortOrder === 'asc' ? 'Asc' : 'Desc'})
            </button>
          ))}
          {/* Add sorting by most/least recent */}
          {sortCriteria === 'createdAt' && (
            <div className="recency-sort">
              <button
                onClick={() => onSort('createdAt')}
                style={{ margin: '5px' }}
              >
                Most Recent
              </button>
              <button
                onClick={() => onSort('createdAt')}
                style={{ margin: '5px' }}
              >
                Least Recent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter by type */}
      <div className="type-filter">
        <label htmlFor="type">Filter by Type:</label>
        <select
          id="type"
          value={selectedType}
          onChange={handleTypeChange}
          style={{ margin: '5px' }}
        >
          <option value="">All Types</option>
          {productTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortingControls;
