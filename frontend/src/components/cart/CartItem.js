import React from "react";
import { ListGroup, Button, Image } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatters";
import { Link } from "react-router-dom";

const CartItem = ({ item, compact = false }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <ListGroup.Item className="py-3">
      <div className="d-flex gap-3">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            style={{
              width: compact ? "50px" : "100px",
              height: compact ? "50px" : "100px",
              objectFit: "cover",
            }}
          />
        )}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Link
                to={`/products/${item.productId}`}
                className="text-decoration-none"
              >
                <h6 className="mb-1">{item.name}</h6>
              </Link>
              {!compact && (
                <p className="text-muted small mb-1">{item.description}</p>
              )}
            </div>
            {!compact && (
              <Button
                variant="link"
                className="text-danger p-0"
                onClick={() => removeFromCart(item.productId)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            )}
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="btn-group btn-group-sm">
              <Button
                variant="outline-secondary"
                onClick={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
                size="sm"
              >
                -
              </Button>
              <Button variant="outline-secondary" disabled>
                {item.quantity}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                size="sm"
                disabled={item.quantity >= item.stock}
              >
                +
              </Button>
            </div>
            <div className="text-end">
              <div className="fw-bold">
                {formatCurrency(item.price * item.quantity)}
              </div>
              <small className="text-muted">
                {item.quantity} × {formatCurrency(item.price)}
              </small>
            </div>
          </div>
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default CartItem;
