import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/'); // Redirect to home if product not found
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    const currentQuantity = user?.cart?.find(i => i.productId === product.id)?.quantity || 0;
    if (currentQuantity >= product.stock) {
      return; // Simply return if trying to add more than stock
    }
    addToCart(product);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!product) return null;

  return (
    <Container className="py-5">
      <Row>
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Img
              variant="top"
              src={product.primary_image}
              alt={product.name}
              className="img-fluid"
              style={{ 
                maxHeight: '600px',
                width: '100%',
                objectFit: 'contain',
                padding: '2rem'
              }}
            />
          </Card>
        </Col>
        <Col md={6}>
          <div className="sticky-md-top" style={{ top: '2rem' }}>
            <h1 className="mb-3">{product.name}</h1>
            <div className="mb-4">
              <h2 className="h3 text-primary mb-3">
                {formatCurrency(product.price)}
              </h2>
              <p className="text-muted mb-3">
                Stock: {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
              </p>
              {product.category_names && (
                <div className="mb-3">
                  {product.category_names.split(',').map((category, index) => (
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
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailsPage; 