import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { formatCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Layout from "../components/Layout";
import { toast } from "react-hot-toast";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/storefront/products/${id}`
        );
        const data = await response.json();
        if (!data) {
          throw new Error("Product not found");
        }
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
        navigate("/"); // Redirect to home if product not found
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    const currentQuantity =
      cart.find((i) => i.productId === product.id)?.quantity || 0;
    if (currentQuantity >= product.stock) {
      return;
    }
    addToCart(product);
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      <Container className="py-5">
        <Row>
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Img
                variant="top"
                src={product.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.images?.[0]?.alt_text || product.name}
                className="img-fluid"
                style={{
                  maxHeight: "600px",
                  width: "100%",
                  objectFit: "contain",
                  padding: "2rem",
                }}
              />
            </Card>
          </Col>
          <Col md={6}>
            <div className="sticky-md-top" style={{ top: "2rem" }}>
              <h1 className="mb-3">{product.name}</h1>
              <div className="mb-4">
                <h2 className="h3 text-primary mb-2">
                  {formatCurrency(product.price)}
                </h2>
                {product.compare_at_price && (
                  <p className="text-muted text-decoration-line-through mb-2">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                )}
                <p className="text-muted mb-3">
                  Stock:{" "}
                  {product.stock > 0
                    ? `${product.stock} units`
                    : "Out of stock"}
                  {product.low_stock_threshold &&
                    product.stock <= product.low_stock_threshold && (
                      <Badge bg="warning" className="ms-2">
                        Low Stock
                      </Badge>
                    )}
                </p>
                {product.sku && (
                  <p className="text-muted small mb-2">SKU: {product.sku}</p>
                )}
                {product.weight && (
                  <p className="text-muted small mb-2">
                    Weight: {product.weight}g
                  </p>
                )}
                {product.dimensions && (
                  <p className="text-muted small mb-2">
                    Dimensions: {product.dimensions}
                  </p>
                )}
                {product.category_names && (
                  <div className="mb-3">
                    {product.category_names
                      .split(",")
                      .map((category, index) => (
                        <Badge bg="secondary" className="me-2" key={index}>
                          {category.trim()}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h3 className="h5 mb-3">Description</h3>
                <p className="text-muted">{product.description}</p>
              </div>
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default ProductDetailsPage;
