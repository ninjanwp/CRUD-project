import React from 'react';
import { Container, Card, ListGroup, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  if (!cart?.length) {
    return (
      <Container className="py-5">
        <Card className="text-center p-5">
          <Card.Body>
            <i className="bi bi-cart3 display-1 text-muted mb-4"></i>
            <h2 className="mb-3">Your cart is empty</h2>
            <p className="text-muted mb-4">Start shopping to add items to your cart</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Shopping Cart</h2>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <ListGroup variant="flush">
              {cart.map(item => (
                <ListGroup.Item key={item.productId} className="py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{item.name}</h5>
                      <p className="text-muted mb-0">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="btn-group">
                        <Button 
                          size="sm" 
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Button variant="outline-secondary" disabled>
                          {item.quantity}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button 
                        variant="link" 
                        className="text-danger"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="position-sticky" style={{ top: '1rem' }}>
            <Card.Body>
              <h5 className="mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Button variant="primary" className="w-100">
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage; 