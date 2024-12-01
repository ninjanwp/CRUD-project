import React from 'react';
import { Container, Card, ListGroup, Button, Row, Col, Image } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { Toaster, toast } from 'react-hot-toast';

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
                  <div className="d-flex gap-3">
                    <Link to={`/products/${item.productId}`}>
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                      />
                    </Link>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <Link to={`/products/${item.productId}`} className="text-decoration-none">
                            <h5 className="mb-1">{item.name}</h5>
                          </Link>
                          <p className="text-muted mb-2 small">{item.description}</p>
                        </div>
                        <div className="text-end">
                          <div className="h5 mb-0">{formatCurrency(item.price * item.quantity)}</div>
                          <small className="text-muted">
                            {item.quantity} × {formatCurrency(item.price)}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-end">
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
                            onClick={() => {
                              if (item.quantity >= item.stock) {
                                return;
                              }
                              updateQuantity(item.productId, item.quantity + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline-danger"
                          className="d-flex align-items-center justify-content-center"
                          onClick={() => removeFromCart(item.productId)}
                          style={{ 
                            width: '31px', 
                            height: '31px',
                            padding: 0
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
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
                <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
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