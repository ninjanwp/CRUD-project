import React, { useState, useEffect } from "react";
import { Card, Table, Button, Form, Modal, Row, Col, Pagination } from "react-bootstrap";

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

  const handleDeleteConfirmation = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{title}</h4>
          {actionButton && (
            <div className="d-flex gap-2">
              {actionButton}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Select 
            className="w-auto"
            onChange={(e) => onSort(e.target.value)}
          >
            <option value="">Sort by...</option>
            {sortOptions.map((option) => (
              <option key={`${option.field}-${option.direction}`} value={`${option.field}-${option.direction}`}>
                {option.label}
              </option>
            ))}
          </Form.Select>

          {selectedProducts.length > 0 && (
            <Button 
              variant="outline-danger" 
              className="d-inline-flex align-items-center"
              onClick={onDeleteSelected}
            >
              <i className="bi bi-trash me-2"></i>
              Delete Selected ({selectedProducts.length})
            </Button>
          )}

          <Form.Control
            type="search"
            placeholder="Search..."
            className="w-auto"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

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
              className="w-auto me-2"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
            <span className="text-muted">
              entries
            </span>
          </div>
          <Pagination>
            {/* ... pagination code ... */}
          </Pagination>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DataTable;