import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import ProductGrid from '../components/storefront/ProductGrid';

const StorefrontPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/storefront/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-vh-100 mb-5">
      <Col
        data-aos="fade"
        className="text-center py-5">
        <h1 className="display-1 fw-semibold"><i className="bi bi-shop"></i> Storefront</h1>
        <p className="lead text-primary">Shop with us</p>
        <hr />
      </Col>
      <div className="bg-primary text-white py-5 mb-4">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <div className="input-group storefront-search">
                <span className="input-group-text">
                  <i className="bi bi-search p-2"></i>
                </span>
                <Form.Control
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </Container>
    </div>
  );
};

export default StorefrontPage; 