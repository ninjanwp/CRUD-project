import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useTableData = (endpoint, defaultItemsPerPage = 10) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const method = `get${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`;
      const response = await api[method]();
      console.log('API Response:', response); // Debug log
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredData(data);
    } else {
      const searchResults = data.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredData(searchResults);
    }
    setCurrentPage(1);
  }, [data]);

  const handleSort = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (typeof aValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
    
    setFilteredData(sortedData);
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    data: paginatedData,
    isLoading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData,
    sortField,
    sortDirection,
    searchTerm
  };
};

export default useTableData; 