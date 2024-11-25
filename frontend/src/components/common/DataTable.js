import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Modal, Row, Col, Pagination } from "react-bootstrap";

const getSelectedProductNames = (data, selectedIds) => {
  return data
    .filter(item => selectedIds.includes(item.id))
    .map(item => item.name);
};

const DataTable = ({
  title,
  columns = [],
  data = [],
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  totalPages,
  onSort,
  sortOptions,
  onSearch,
  selectedProducts = [],
  setSelectedProducts,
  onEdit,
  onDeleteSelected,
  actionButton,
  sortField,
  sortOrder,
  onRowClick,
  selectable,
  selectedItems,
  onSelectionChange,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (setSelectedProducts) {
      // Default behavior: toggle selection
      setSelectedProducts((prev) => {
        if (prev.includes(item.id)) {
          return prev.filter((id) => id !== item.id);
        } else {
          return [...prev, item.id];
        }
      });
    }
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDelete = () => {
    onDeleteSelected();
    setShowDeleteConfirm(false);
  };

  // Create checkbox column if selectable is true
  const getColumns = (userColumns) => {
    if (!selectable) return userColumns;
    
    const checkboxColumn = {
      field: "select",
      label: (
        <div 
          className="d-flex align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            const newValue = !(data.length > 0 && selectedItems.length === data.length);
            if (newValue) {
              onSelectionChange(data.map((item) => item.id));
            } else {
              onSelectionChange([]);
            }
          }}
        >
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={data.length > 0 && selectedItems.length === data.length}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                onSelectionChange(data.map((item) => item.id));
              } else {
                onSelectionChange([]);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="ms-2">All</span>
        </div>
      ),
      className: "col-checkbox",
      sortable: false,
      format: (value, item) => (
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                onSelectionChange([...selectedItems, item.id]);
              } else {
                onSelectionChange(selectedItems.filter(id => id !== item.id));
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    };

    return [checkboxColumn, ...userColumns];
  };

  const finalColumns = getColumns(columns);

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <h4 className="mb-0">{title}</h4>
          </div>
          <div className="d-flex gap-2">
            {selectedProducts?.length > 0 && (
              <Button 
                variant="outline-danger" 
                className="d-inline-flex align-items-center"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="bi bi-trash me-2"></i>
                Delete Selected ({selectedProducts.length})
              </Button>
            )}
            {actionButton}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Select 
            className="w-auto"
            onChange={(e) => {
              console.log('Sort value:', e.target.value);
              onSort(e.target.value);
            }}
          >
            <option value="">Sort by...</option>
            {sortOptions.map((option) => (
              <option 
                key={`${option.field}-${option.direction}`} 
                value={`${option.field}-${option.direction}`}
              >
                {option.label}
              </option>
            ))}
          </Form.Select>

          <div className="position-relative">
            <Form.Control
              type="search"
              placeholder="Search"
              className="w-auto pe-4 ps-5"
              onChange={(e) => onSearch(e.target.value)}
            />
            <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
          </div>
        </div>

        <div className="table-responsive">
          <Table 
            hover 
            responsive
            className="table-fixed"
          >
            <thead>
              <tr>
                {finalColumns.map((column, index) => (
                  <th 
                    key={index}
                    className={column.className}
                    onClick={() => column.sortable !== false && onSort && onSort(`${column.field}-${sortOrder === 'asc' ? 'desc' : 'asc'}`)}
                    style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
                  >
                    {column.label}
                    {column.sortable !== false && sortField === column.field && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className={selectedProducts.includes(item.id) ? 'selected' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  {finalColumns.map((column, index) => (
                    <td 
                      key={index}
                      className={column.className}
                    >
                      {column.format
                        ? column.format(item[column.field], item)
                        : item[column.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Form.Select
              className="w-auto me-2 mb-3"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {[5, 10, 20, 40, 80].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <span className="text-muted mb-3">entries</span>
          </div>

          <Pagination>
            <Pagination.First 
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={currentPage === index + 1}
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>

          <div style={{ width: '150px' }}></div>
        </div>

        {showDeleteConfirm && (
          <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} animation={true} className="fade">
            <Modal.Header closeButton className="border-0 pb-0">
            </Modal.Header>
            <Modal.Body className="text-center pt-0">
              <div className="display-1 text-danger mb-4">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <h4 className="mb-4">Confirm Delete</h4>
              <p>Are you sure you want to delete the following items?</p>
              <div className="selected-items-list">
                {data
                  .filter(item => selectedProducts.includes(item.id))
                  .map(item => (
                    <div key={item.id} className="selected-item">
                      <span className="text-muted">{item.id}</span>
                      <span className="mx-2">-</span>
                      <span>{item.name}</span>
                    </div>
                  ))
                }
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="w-100 d-flex justify-content-between">
                <Button variant="danger" onClick={handleConfirmedDelete}>
                  <i className="bi bi-trash me-2"></i>
                  Delete
                </Button>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        )}
      </Card.Body>
    </Card>
  );
};

export default DataTable;