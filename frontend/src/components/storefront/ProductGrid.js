import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const ProductGrid = ({ products }) => {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    const currentQuantity =
      cart.find((i) => i.productId === product.id)?.quantity || 0;
    if (currentQuantity >= product.stock) {
      return;
    }
    addToCart(product);
  };

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {products.map((product) => (
        <Col key={product.id}>
          <Card className="h-100 shadow-sm product-card d-flex flex-column">
            <Link
              to={`/products/${product.id}`}
              className="text-decoration-none flex-grow-1 d-flex flex-column"
            >
              <Card.Img
                variant="top"
                src={product.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.images?.[0]?.alt_text || product.name}
                style={{
                  height: "200px",
                  objectFit: "contain",
                  padding: "1rem",
                }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-dark">{product.name}</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  {product.description}
                </Card.Text>
              </Card.Body>
            </Link>
            <Card.Footer className="bg-transparent">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="h5 mb-0">{formatCurrency(product.price)}</span>
              </div>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(product);
                }}
                disabled={product.stock === 0}
                className="w-100"
              >
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
