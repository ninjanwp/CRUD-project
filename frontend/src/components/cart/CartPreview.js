import React from "react";
import { Card, ListGroup, Button, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatters";

const CartPreview = () => {
  const { cart, total } = useCart();

  if (!cart.length) {
    return (
      <Card className="d-flex flex-column justify-content-center align-items-center cart-preview shadow mt-3">
        <Card.Body className="text-center p-4">
          <i className="bi bi-cart3 display-6 text-muted"></i>
          <p className="text-muted mt-2 mb-0">Your cart is empty</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="cart-preview shadow">
      <Card.Header className="bg-white">
        <h6 className="mb-0">
          Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)
        </h6>
      </Card.Header>
      <ListGroup
        variant="flush"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        {cart.slice(0, 3).map((item) => (
          <ListGroup.Item key={item.productId} className="py-2">
            <Link
              to={`/products/${item.productId}`}
              className="text-decoration-none d-flex gap-2 text-primary"
            >
              <Image
                src={item.image}
                alt={item.name}
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "contain",
                }}
              />
              <div className="flex-grow-1">
                <div className="small fw-medium text-truncate">{item.name}</div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <small className="text-muted">
                    {item.quantity} × {formatCurrency(item.price)}
                  </small>
                  <span className="small fw-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </Link>
          </ListGroup.Item>
        ))}
        {cart.length > 3 && (
          <ListGroup.Item className="text-center py-2">
            <small className="text-muted">+{cart.length - 3} more items</small>
          </ListGroup.Item>
        )}
      </ListGroup>
      <Card.Footer className="bg-white">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>Total</span>
          <span className="fw-bold">{formatCurrency(total)}</span>
        </div>
        <div className="d-grid gap-2">
          <Link to="/cart" className="btn btn-primary">
            View Cart
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default CartPreview;
