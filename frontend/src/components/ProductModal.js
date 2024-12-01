import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Row, Col } from "react-bootstrap";
import axios from "axios";

const ProductModal = ({ show, product, onClose, onSubmit, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: [],
    images: [{
      url: '',
      alt_text: '',
      is_primary: true,
      display_order: 0
    }]
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories when modal opens
    if (show) {
      const fetchCategories = async () => {
        try {
          const response = await axios.get('/api/categories');
          setCategories(response.data);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchCategories();
    }
  }, [show]);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categories: product.categories ? product.categories.split(',').map(Number) : [],
        images: product.images || [{
          url: product.primary_image || '',
          alt_text: product.name || '',
          is_primary: true,
          display_order: 0
        }]
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categories: [],
        images: [{
          url: '',
          alt_text: '',
          is_primary: true,
          display_order: 0
        }]
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product ? 'Edit Product' : 'Add Product'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Categories</Form.Label>
            <div className="category-selector p-2 border rounded d-flex flex-wrap align-items-start">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={formData.categories.includes(category.id) ? "primary" : "outline-secondary"}
                  size="sm"
                  className="me-2 mb-2 category-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      categories: formData.categories.includes(category.id)
                        ? formData.categories.filter(id => id !== category.id)
                        : [...formData.categories, category.id]
                    });
                  }}
                >
                  {category.name}
                  {formData.categories.includes(category.id) && (
                    <i className="bi bi-check ms-2"></i>
                  )}
                </Button>
              ))}
            </div>
            <Form.Text className="text-muted">
              Click categories to select/deselect them
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Primary Image URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.images[0]?.url}
              onChange={(e) => setFormData({
                ...formData,
                images: [{
                  ...formData.images[0],
                  url: e.target.value,
                  alt_text: formData.name
                }]
              })}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {product && (
            <Button 
              variant="danger" 
              className="me-auto"
              onClick={() => onDelete(product.id)}
            >
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {product ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal; 