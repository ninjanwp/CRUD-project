import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <ListGroup.Item>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0">{item.name}</h6>
          <small className="text-muted">${item.price}</small>
        </div>
        <div className="d-flex align-items-center">
          <Button 
            size="sm" 
            variant="outline-secondary"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          >
            -
          </Button>
          <span className="mx-2">{item.quantity}</span>
          <Button 
            size="sm" 
            variant="outline-secondary"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          >
            +
          </Button>
          <Button 
            size="sm" 
            variant="outline-danger" 
            className="ms-2"
            onClick={() => removeFromCart(item.productId)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default CartItem; 