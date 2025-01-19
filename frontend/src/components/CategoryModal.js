import React, { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";

const CategoryModal = ({ show, onClose, category, onSubmit, onDelete }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: "0",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        display_order: category.display_order?.toString() || "0",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        display_order: "0",
      });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      display_order: parseInt(formData.display_order) || 0,
    });
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{category ? "Edit Category" : "Add Category"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="categoryForm" onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Display Order</Form.Label>
            <Form.Control
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({ ...formData, display_order: e.target.value })
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="categoryForm">
          Save
        </Button>
        {category && (
          <Button
            variant="danger"
            className="me-auto"
            onClick={() => onDelete(category.id)}
          >
            Delete
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CategoryModal;
