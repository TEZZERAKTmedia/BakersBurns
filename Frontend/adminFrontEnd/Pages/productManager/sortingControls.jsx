import React, { useState, useEffect } from 'react';
import { adminApi } from '../../config/axios'; // Import adminApi for API requests
import './sorting.css';

const SortingControls = ({ onSort, sortCriteria, sortOrder, onFilterByType }) => {
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
        setProductTypes(response.data); // Save the fetched product types
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
      onFilterByType(selectedType); // Filter products by selected type
    } else {
      onFilterByType(); // Reset the filter if no type is selected
    }
  };

  return (
    <div className="sc-container">
      {/* Button to toggle sorting options */}
      <button onClick={() => setIsOpen(!isOpen)} className="sc-sort-button">
        Sort By {isOpen ? '▲' : '▼'}
      </button>

      {/* Sorting options that open/close based on the `isOpen` state */}
      {isOpen && (
        <div className="sc-sorting-options">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortClick(option.value)}
              className={`sc-sort-option ${sortCriteria === option.value ? 'active-sort' : ''}`}
            >
              {option.label} ({sortCriteria === option.value && sortOrder === 'asc' ? 'Asc' : 'Desc'})
            </button>
          ))}
        </div>
      )}

      {/* Filter by type */}
      <div className="sc-type-filter">
        <label htmlFor="type">Filter by Type:</label>
        <select id="type" value={selectedType} onChange={handleTypeChange}>
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
