import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';

const Cart = () => {
  const { cart, total } = useCart();

  return (
    <Card>
      <Card.Header>Shopping Cart</Card.Header>
      <ListGroup variant="flush">
        {cart.length === 0 ? (
          <ListGroup.Item>Your cart is empty</ListGroup.Item>
        ) : (
          <>
            {cart.map(item => (
              <CartItem key={item.productId} item={item} />
            ))}
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
              <strong>Total:</strong>
              <span>${total.toFixed(2)}</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <Button variant="primary" className="w-100">
                Checkout
              </Button>
            </ListGroup.Item>
          </>
        )}
      </ListGroup>
    </Card>
  );
};

export default Cart; 