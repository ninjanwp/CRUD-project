import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';
import ProductGrid from '../components/storefront/ProductGrid';
import { easeInOut, motion } from "framer-motion";

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
      <Col className="text-center py-5">
        <div className="d-flex gap-2 align-items-center justify-content-center">
          <motion.i
            layout
            initial={{ opacity: 0, scale: 2, x: 200 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 1,
              delay: 0,
              type: "spring",
              bounce: 0.5,
            }}
            className="bi bi-shop display-1 text-dark"
          ></motion.i>
          <div className="d-flex flex-column overflow-hidden">
            <motion.h1
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{
                duration: 1,
                delay: 0.1,
                type: "spring",
                bounce: 0.1,
              }}
              className="display-1 fw-semibold text-dark"
            >
              Storefront
            </motion.h1>
          </div>
        </div>
        <motion.i
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-primary display-6 fw-semibold"
        >
          E-commerce framework
        </motion.i>
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