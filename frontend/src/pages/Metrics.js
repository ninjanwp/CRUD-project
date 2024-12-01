import React from 'react';
import { Row, Col, Card, Image } from 'react-bootstrap';
import useTableData from '../hooks/useTableData';
import { formatCurrency } from '../utils/formatters';

const Metrics = () => {
  const { data: products } = useTableData('products');
  const { data: orders } = useTableData('orders');

  // Calculate metrics
  const totalInventoryValue = products.reduce((sum, product) => 
    sum + (product.price * product.stock), 0
  );
  const lowStockItems = products.filter(product => product.stock < 10);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-graph-up me-2"></i>
        Metrics & Analytics
      </h2>

      {/* Overview Section */}
      <h4 className="mb-3">Overview</h4>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title style={{ color: '#4f46e5' }}>Total Revenue</Card.Title>
              <h3>{formatCurrency(totalRevenue)}</h3>
              <small className="text-muted">Lifetime revenue</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="text-success">Total Orders</Card.Title>
              <h3>{totalOrders}</h3>
              <small className="text-muted">Processed orders</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="text-info">Average Order</Card.Title>
              <h3>{formatCurrency(averageOrderValue)}</h3>
              <small className="text-muted">Per order value</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="text-warning">Active Products</Card.Title>
              <h3>{products.length}</h3>
              <small className="text-muted">Total products</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Inventory Section */}
      <h4 className="mb-3">Inventory Status</h4>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Inventory Value</Card.Title>
              <h3>{formatCurrency(totalInventoryValue)}</h3>
              <small className="text-muted">Total stock value</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Low Stock Alert</Card.Title>
              <h3>{lowStockItems.length}</h3>
              <small className="text-muted">Items below threshold</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Average Stock Level</Card.Title>
              <h3>{Math.round(products.reduce((sum, p) => sum + p.stock, 0) / products.length || 0)}</h3>
              <small className="text-muted">Units per product</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Items Section */}
      <h4 className="mb-3">Low Stock Items</h4>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Current Stock</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map(item => (
                      <tr key={item.id}>
                        <td style={{ width: '80px' }}>
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.stock}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.price * item.stock)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Metrics; 