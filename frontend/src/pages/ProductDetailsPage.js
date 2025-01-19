import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { formatCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Layout from "../components/Layout";
import { toast } from "react-hot-toast";
import { easeInOut, motion } from "framer-motion";
import Spinner from "../components/Spinner";
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
        navigate("/"); // Redirect to home if product not found
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
        <div className="text-center py-5">
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      <Container>
        <Row>
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-none">
              {product.images?.length > 0 && product.images[0]?.url ? (
                <motion.img
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1,
                    delay: 0.1,
                    type: "spring",
                    bounce: 0.7,
                  }}
                  variant="top"
                  src={`http://localhost:8000${product.images[0].url}`}
                  alt={product.images[0]?.alt_text || product.name}
                  className="img-fluid"
                  style={{
                    maxHeight: "600px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{ height: "600px" }}
                >
                  <i
                    className="bi bi-image text-muted"
                    style={{ fontSize: "5rem" }}
                  ></i>
                </div>
              )}
            </Card>
          </Col>
          <Col md={6} className="d-flex flex-colum">
            <div className="sticky-md-top" style={{ top: "2rem" }}>
              <h1 className="mb-3">{product.name}</h1>
              <div className="mb-4">
                <h2 className="h3 text-primary mb-2">
                  {formatCurrency(product.price)}
                </h2>
                {product.compare_at_price > 0 && (
                  <p className="text-muted text-decoration-line-through mb-2">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-danger mb-3">Out of stock</p>
                )}
                {product.sku && (
                  <p className="text-muted small mb-2">SKU: {product.sku}</p>
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
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <i className="bi bi-cart me-2"></i>
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  variant="outline-dark"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-arrow-return-left me-2"></i>Continue
                  Shopping
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
