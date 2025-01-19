import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Inventory',
      icon: 'bi-box-seam',
      description: 'Manage products, inventory, and product settings.',
      path: '/admin/inventory',
      color: 'primary'
    },
    {
      title: 'Orders',
      icon: 'bi-bag-check',
      description: 'Track and manage customer orders efficiently.',
      path: '/admin/orders',
      color: 'primary'
    },
    {
      title: 'Users',
      icon: 'bi-people',
      description: 'Manage users and their permissions.',
      path: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Metrics',
      icon: 'bi-graph-up',
      description: 'View key metrics and analytics about your store.',
      path: '/admin/metrics',
      color: 'primary'
    }
  ];

  return (
    <Row className="text-center">
      <Col>
        <h1 className="display-4 fw-semibold">Admin Dashboard</h1>
        <p className="lead text-primary">Manage your store efficiently</p>
        <hr />
        <Row className="mt-4 flex-wrap justify-content-center gap-4">
          {modules.map((module, index) => (
            <Col md={4} key={index}>
              <Card 
                className="dashboard-card h-100 shadow-lg" 
                onClick={() => navigate(module.path)}
                style={{ cursor: 'pointer', transition: 'all .2s ease-in-out' }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className={`text-${module.color} mb-3`}>
                    <i className={`bi ${module.icon} display-4`}></i>
                  </div>
                  <Card.Title className="mt-3">{module.title}</Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
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