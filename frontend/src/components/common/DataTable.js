import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Modal } from "react-bootstrap";

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

  const handleRowClick = (item, index, event) => {
    if (event.target.closest("td:last-child")) {
      return;
    }

    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rowsToSelect = data.slice(start, end + 1).map((item) => item.id);

      const existingSelections = selectedProducts.filter(
        (id) => !data.slice(start, end + 1).find((item) => item.id === id)
      );

      setSelectedProducts([
        ...new Set([...existingSelections, ...rowsToSelect]),
      ]);
    } else {
      const newSelectedProducts = selectedProducts.includes(item.id)
        ? selectedProducts.filter((id) => id !== item.id)
        : [...selectedProducts, item.id];
      setSelectedProducts(newSelectedProducts);
      setLastSelectedIndex(index);
    }
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">{title}</div>
        <div className="d-flex gap-3 align-items-center">
          <Form.Control
            type="search"
            placeholder="Search..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {sortOptions && (
            <Form.Select
              className="sort-select"
              onChange={(e) => {
                const [field, direction] = e.target.value.split(":");
                onSort(field, direction);
              }}
            >
              <option value="">Sort by...</option>
              {sortOptions.map((option, index) => (
                <option
                  key={index}
                  value={`${option.field}:${option.direction}`}
                >
                  {option.label}
                </option>
              ))}
            </Form.Select>
          )}
          {actionButton}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className={column.className}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={
                    selectedProducts.includes(item.id) ? "selected" : ""
                  }
                  onClick={(e) => handleRowClick(item, index, e)}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={column.className}>
                      {column.format
                        ? column.format(item[column.field])
                        : item[column.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        {/* Add Pagination Controls */}
        <div className="pagination-controls mt-3">
          <Form.Select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{ width: '100px' }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </Form.Select>
          
          <Button
            variant="outline-secondary"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          
          <Button
            variant="outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </Card.Body>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedProducts.length} selected
          items?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDeleteSelected();
              setShowDeleteConfirm(false);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default DataTable;