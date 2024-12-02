import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const ManufacturerModal = ({ show, manufacturer, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_info: ''
  });

  useEffect(() => {
    if (manufacturer) {
      setFormData(manufacturer);
    } else {
      setFormData({
        name: '',
        code: '',
        contact_info: ''
      });
    }
  }, [manufacturer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {manufacturer ? 'Edit' : 'Add'} Manufacturer
        </Modal.Title>
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
            <Form.Label>Code</Form.Label>
            <Form.Control
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Info</Form.Label>
            <Form.Control
              as="textarea"
              value={formData.contact_info}
              onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {manufacturer ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ManufacturerModal; 