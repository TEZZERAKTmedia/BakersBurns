import React from 'react';

const SortingControls = ({ onSort, sortCriteria, sortOrder }) => {
  const sortOptions = [
    { label: 'Most Recent', value: 'createdAt' },
    { label: 'Name', value: 'name' },
    { label: 'Type', value: 'type' },
    { label: 'Price', value: 'price' },
  ];

  return (
    <div className="sorting-controls">
      <p>Sort By:</p>
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSort(option.value)}
          className={sortCriteria === option.value ? 'active-sort' : ''}
        >
          {option.label} ({sortCriteria === option.value && sortOrder === 'asc' ? 'Asc' : 'Desc'})
        </button>
      ))}
    </div>
  );
};

export default SortingControls;
