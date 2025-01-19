import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

const ManufacturerModal = ({ show, manufacturer, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    if (manufacturer) {
      setFormData(manufacturer);
    } else {
      setFormData({
        name: '',
        code: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        is_active: true,
        notes: ''
      });
    }
  }, [manufacturer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error('Name and Code are required');
      return;
    }

    try {
      await onSubmit(formData);
      toast.success(`Manufacturer ${manufacturer ? 'updated' : 'created'} successfully`);
      onClose();
    } catch (error) {
      console.error('Manufacturer save failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save manufacturer');
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      dialogClassName="modal-wide"
    >
      <Modal.Header closeButton>
        <Modal.Title>{manufacturer ? 'Edit' : 'Add'} Manufacturer</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tabs defaultActiveKey="basic" className="mb-4">
            <Tab eventKey="basic" title="Basic Info">
              <Row className="gx-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Name*</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Code*</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                    />
                    <Form.Text className="text-muted">
                      Unique ID
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <div
                  className="status-toggle"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      is_active: !formData.is_active
                    })
                  }
                  style={{
                    '--toggle-position': formData.is_active ? '0' : '100%',
                    '--toggle-color': formData.is_active ? 'var(--bs-success)' : 'var(--bs-danger)'
                  }}
                >
                  <div className={`status-option ${formData.is_active ? 'active' : ''}`}>
                    Active
                  </div>
                  <div className={`status-option ${!formData.is_active ? 'active' : ''}`}>
                    Inactive
                  </div>
                </div>
                <Form.Text className="text-muted">
                  Hidden from product forms when inactive
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Internal only
                </Form.Text>
              </Form.Group>
            </Tab>

            <Tab eventKey="contact" title="Contact Details">
              <Row className="gx-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Contact Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="gx-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </Form.Group>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">
            {manufacturer ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ManufacturerModal; 