import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Product Management',
      icon: 'bi-box-seam',
      description: 'Add, edit, and manage your product inventory with ease.',
      path: '/admin/products',
      color: 'primary'
    },
    {
      title: 'Category Management',
      icon: 'bi-tags',
      description: 'Manage product categories and organization.',
      path: '/admin/categories',
      color: 'warning'
    },
    {
      title: 'Order Management',
      icon: 'bi-bag-check',
      description: 'Track and manage customer orders efficiently.',
      path: '/admin/orders',
      color: 'success'
    },
    {
      title: 'Metrics',
      icon: 'bi-graph-up',
      description: 'View key metrics and analytics about your store.',
      path: '/admin/metrics',
      color: 'info'
    }
    // Add more modules here as needed
  ];

  return (
    <Row className="text-center">
      <Col>
        <h1 className="display-4 fw-semibold">Welcome to Store Management</h1>
        <p className="lead text-muted">Manage your store efficiently</p>
        <hr />
        <Row className="mt-4">
          {modules.map((module, index) => (
            <Col md={4} key={index}>
              <Card 
                className="dashboard-card mb-4 h-100 shadow-sm fade show" 
                onClick={() => navigate(module.path)}
                style={{ cursor: 'pointer', transition: 'all .2s ease-in-out' }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className={`text-${module.color} mb-3`}>
                    <i className={`bi ${module.icon} display-4`}></i>
                  </div>
                  <Card.Title className="mt-3">{module.title}</Card.Title>
                  <Card.Text className=" text-muted flex-grow-1">
                    {module.description}
                  </Card.Text>
                  <div className={`text-${module.color} mt-3`}>
                    <small>Click to manage <i className="bi bi-arrow-right"></i></small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
};

export default Home; 