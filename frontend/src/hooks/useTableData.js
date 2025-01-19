import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const useTableData = (endpoint) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    try {
      const response = await api.list(endpoint);
      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } else if (Array.isArray(response)) {
        setData(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } else {
        setData([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, currentPage, itemsPerPage, sortField, sortDirection, searchQuery]);

  return {
    data,
    error,
    isLoading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData: fetchData
  };
};

export default useTableData; 