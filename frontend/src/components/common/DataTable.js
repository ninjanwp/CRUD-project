import React from 'react';
import { Card, Table, Form, InputGroup, Pagination, Button } from 'react-bootstrap';

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
  actionButton,
  sortField,
  sortOrder,
  onRowClick,
  className
}) => {
  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  const showTitle = !className?.includes('product-table');

  return (
    <Card className={className}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            {showTitle && <h5 className="mb-0">{title}</h5>}
            {actionButton}
          </div>
          <div className="d-flex gap-2">
            <Form.Select 
              style={{ width: 'auto' }}
              onChange={(e) => onSort(e.target.value)}
            >
              <option value="">Sort by...</option>
              {sortOptions?.map((option, index) => (
                <option 
                  key={index} 
                  value={`${option.field}-${option.direction}`}
                >
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <InputGroup style={{ width: 'auto' }}>
              <Form.Control
                placeholder="Search..."
                onChange={(e) => onSearch(e.target.value)}
              />
            </InputGroup>
          </div>
        </div>

        <div className="table-responsive">
          <Table hover responsive className="table-fixed">
            <thead>
              <tr>
                {columns.map((column, index) => (
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
                  style={{ cursor: 'pointer' }}
                >
                  {columns.map((column, index) => (
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

        <div className="d-flex justify-content-between align-items-center mt-3">
          <Form.Select
            style={{ width: 'auto' }}
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </Form.Select>

          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            <Pagination.Item active>{currentPage}</Pagination.Item>
            <Pagination.Next
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DataTable;