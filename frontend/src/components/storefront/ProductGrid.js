import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const ProductGrid = ({ products }) => {
  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {products.map(product => (
        <Col key={product.id}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Text className="text-muted">
                {product.description}
              </Card.Text>
              <div className="d-flex justify-content-between align-items-center">
                <span className="h5 mb-0">{formatCurrency(product.price)}</span>
                <Link 
                  to={`/products/${product.id}`} 
                  className="btn btn-outline-primary"
                >
                  View Details
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid; 