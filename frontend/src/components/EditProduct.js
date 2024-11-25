import React, { useState } from "react";
import { Form, Button, Modal, Row, Col } from "react-bootstrap";
import api from "../services/api";
import '../styles/Modal.css';

const EditProduct = ({ product, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateProduct(product.id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteProduct(product.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <>
      {/* Edit Modal */}
      <Modal show={!showDeleteConfirm} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
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
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
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
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-box me-2"></i>
                    Stock
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="modal-footer-with-delete">
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteConfirm(true)}
              className="delete-btn"
            >
              <i className="bi bi-trash me-2"></i>
              Delete
            </Button>
            <div className="action-buttons">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton className="border-0">
          <div className="w-100 text-center position-relative">
            <i className="bi bi-exclamation-triangle-fill text-danger display-4"></i>
          </div>
        </Modal.Header>
        <Modal.Body className="text-center pb-4">
          <h4 className="mb-3">Delete Product</h4>
          <p className="mb-1">Are you sure you want to delete <strong>{formData.name}</strong>?</p>
          <p className="text-danger mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4"
          >
            <i className="bi bi-x-lg me-2"></i>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="px-4"
          >
            <i className="bi bi-trash me-2"></i>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditProduct;
