import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

const AttributeModal = ({ show, attribute, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'text',
    options: [],
    is_variant: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (attribute) {
      setFormData(attribute);
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'text',
        options: [],
        is_variant: false
      });
    }
    setErrors({});
  }, [attribute]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
    }
    if (formData.type === 'select' && (!formData.options.length || formData.options.some(opt => !opt.trim()))) {
      newErrors.options = 'At least one valid option is required for dropdown attributes';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Clean up options array - remove empty strings and trim values
      const cleanedFormData = {
        ...formData,
        options: formData.type === 'select' 
          ? formData.options.map(opt => opt.trim()).filter(Boolean)
          : []
      };
      
      await onSubmit(cleanedFormData);
      onClose();
    } catch (error) {
      console.error('Failed to save attribute:', error);
      setErrors({ submit: error.message || 'Failed to save attribute' });
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{attribute ? 'Edit' : 'Add'} Attribute</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.submit && (
            <Alert variant="danger">{errors.submit}</Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Name*</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              isInvalid={!!errors.name}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Code*</Form.Label>
            <Form.Control
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
            <Form.Text className="text-muted">
              Unique identifier used in system operations (e.g., 'COLOR', 'SIZE')
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type*</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="boolean">Yes/No</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Determines how this attribute will be displayed and validated
            </Form.Text>
          </Form.Group>

          {formData.type === 'select' && (
            <Form.Group className="mb-3">
              <Form.Label>Options</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.options.join(',')}
                onChange={(e) => setFormData({...formData, options: e.target.value.split(',')})}
                placeholder="Enter options separated by commas"
              />
              <Form.Text className="text-muted">
                For dropdown attributes, enter possible values separated by commas (e.g., "Small,Medium,Large")
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Variant Status</Form.Label>
            <div
              className="status-toggle"
              onClick={() =>
                setFormData({
                  ...formData,
                  is_variant: !formData.is_variant
                })
              }
              style={{
                '--toggle-position': formData.is_variant ? '0' : '100%',
                '--toggle-color': formData.is_variant ? 'var(--bs-success)' : 'var(--bs-danger)'
              }}
            >
              <div className={`status-option ${formData.is_variant ? 'active' : ''}`}>
                Enabled
              </div>
              <div className={`status-option ${!formData.is_variant ? 'active' : ''}`}>
                Disabled
              </div>
            </div>
            <Form.Text className="text-muted">
              Creates product variations (e.g., sizes)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">
            {attribute ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AttributeModal; 