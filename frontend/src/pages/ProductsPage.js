import React, { useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import DataTable from '../components/common/DataTable';
import AddProduct from '../components/AddProduct';
import useTableData from '../hooks/useTableData';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const ProductsPage = () => {
  const {
    data,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleSort,
    handleSearch,
    refreshData,
  } = useTableData('products');

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'description', label: 'Description' },
    { 
      field: 'price', 
      label: 'Price', 
      format: value => `$${Number(value).toFixed(2)}` 
    },
    { field: 'stock', label: 'Stock' }
  ];

  const sortOptions = [
    { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
    { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
    { field: 'price', direction: 'asc', label: 'Price (Low-High)' },
    { field: 'price', direction: 'desc', label: 'Price (High-Low)' }
  ];

  const handleAdd = () => {
    setEditProduct(null);
    setShowAddModal(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteSelected = async () => {
    try {
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  };

  return (
    <>
      <DataTable
        title={
          <>
            <i className="bi bi-box-seam me-2"></i>
            Products
          </>
        }
        actionButton={
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={handleAdd}>
              <i className="bi bi-plus-lg me-2"></i>
              Add Product
            </Button>
            {selectedProducts.length > 0 && (
              <Button variant="danger" onClick={handleDeleteSelected}>
                <i className="bi bi-trash me-2"></i>
                Delete Selected
              </Button>
            )}
          </div>
        }
        columns={columns}
        data={data}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onSort={handleSort}
        sortOptions={sortOptions}
        onSearch={handleSearch}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        onEdit={handleEdit}
        onDeleteSelected={handleDeleteSelected}
      />

      {showAddModal && (
        <AddProduct
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setEditProduct(null);
          }}
          product={editProduct}
          onSuccess={() => {
            setShowAddModal(false);
            setEditProduct(null);
            refreshData();
          }}
        />
      )}
    </>
  );
};

export default ProductsPage; 