import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Row, Col } from "react-bootstrap";
import '../styles/Modal.css';

const ProductModal = ({ show, product, onClose, onSubmit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    id: product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || ''
      });
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        price: '',
        stock: ''
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isEditMode = !!product;

  if (showDeleteConfirm) {
    return (
      <Modal show={true} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{formData.name}"?
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-between">
            <Button variant="danger" onClick={() => onDelete(product.id)}>
              <i className="bi bi-trash me-2"></i>
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi bi-${isEditMode ? 'pencil-square' : 'plus-lg'} me-2`}></i>
          {isEditMode ? 'Edit Product' : 'Add Product'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-tag me-2"></i>
              Name
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-card-text me-2"></i>
              Description
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-currency-dollar me-2"></i>
                  Price
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-clipboard-data me-2"></i>
                  Stock
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            {isEditMode && (
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                <i className="bi bi-trash me-2"></i>
                Delete
              </Button>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-check-lg me-2"></i>
              {isEditMode ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal; 