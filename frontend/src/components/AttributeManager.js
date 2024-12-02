import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const AttributeModal = ({ show, attribute, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'text',
    options: [],
    is_variant: false
  });

  // ... rest of the modal implementation
};

export default AttributeModal; 