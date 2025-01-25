import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
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
    <Row xs={1} md={2} lg={3} className="g-5 justify-content-center">
      {products.map((product) => (
        <Col key={product.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-100 shadow-lg product-card d-flex flex-column p-3">
            <Link
              to={`/products/${product.id}`}
              className="text-decoration-none flex-grow-1 d-flex flex-column"
            >
              {product.images?.length > 0 && product.images[0]?.url ? (
                <Card.Img
                  variant="top"
                  src={`http://localhost:8000${product.images[0].url}`}
                  alt={product.images[0]?.alt_text || product.name}
                  style={{
                    height: "300px",
                    width: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: "200px" }}
                >
                  <i
                    className="bi bi-image text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-dark">{product.name}</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  {product.description}
                </Card.Text>
              </Card.Body>
            </Link>
            <Card.Footer className="bg-transparent">
              <div className="d-flex gap-2 align-items-center mb-2">
                <span className="h5 mb-0 text-primary">{formatCurrency(product.price)}</span>
                <span className="text-decoration-line-through text-muted">
                  {formatCurrency(product.compare_at_price)}
                </span>
              </div>
              <Button
                variant="outline-dark"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(product);
                }}
                disabled={product.stock === 0}
                className="w-100"
              >
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                <i className="bi bi-cart ms-2"></i>
              </Button>
            </Card.Footer>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
