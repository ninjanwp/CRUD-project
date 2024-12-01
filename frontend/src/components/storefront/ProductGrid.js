import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ProductGrid = ({ products }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

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
              <div className="mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="h5 mb-0">{formatCurrency(product.price)}</span>
                  <span className="text-muted">Stock: {product.stock}</span>
                </div>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    as={Link}
                    to={`/products/${product.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid; 