import React, { useState } from 'react';
import DataTable from '../components/common/DataTable';
import useTableData from '../hooks/useTableData';
import { formatCurrency, formatDate } from '../utils/formatters';

const OrdersPage = () => {
  const {
    data,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleSort,
    refreshData,
  } = useTableData('orders');

  const columns = [
    { field: 'id', label: 'Order ID' },
    { field: 'customer_name', label: 'Customer' },
    { 
      field: 'total', 
      label: 'Total',
      className: 'text-end',
      format: formatCurrency
    },
    { 
      field: 'created_at', 
      label: 'Date',
      format: formatDate
    },
  ];

  const sortOptions = [
    { field: 'created_at', direction: 'desc', label: 'Newest First', icon: 'bi-sort-down' },
    { field: 'created_at', direction: 'asc', label: 'Oldest First', icon: 'bi-sort-up' },
    { field: 'total', direction: 'desc', label: 'Highest Total', icon: 'bi-sort-numeric-down' },
    { field: 'total', direction: 'asc', label: 'Lowest Total', icon: 'bi-sort-numeric-up' },
  ];

  return (
    <DataTable
      title={
        <>
          <i className="bi bi-bag-check me-2"></i>
          Orders
        </>
      }
      data={data}
      columns={columns}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
      onSort={handleSort}
      sortOptions={sortOptions}
    />
  );
};

export default OrdersPage; 