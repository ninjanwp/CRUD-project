import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Row, Col, Tabs, Tab, Card } from "react-bootstrap";
import axios from "axios";
import CategoryModal from './CategoryModal';
import ManufacturerModal from './ManufacturerModal';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProductModal = ({ show, product, onClose, onSubmit, onDelete }) => {
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    manufacturer_id: '',
    sku: '',
    barcode: '',
    is_digital: false,
    cost_price: '',
    compare_at_price: '',
    weight: '',
    width: '',
    height: '',
    length: '',
    low_stock_threshold: '',
    warranty_info: '',
    return_policy: '',
    tax_class: '',
    is_active: true,
    is_featured: false,
    categories: [],
    images: [{
      url: '',
      alt_text: '',
      is_primary: true,
      display_order: 0
    }],
    variantAttributes: [],
    variants: [{
      sku: '',
      price: '',
      stock: '',
      attributes: {}
    }]
  });

  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setIsLoading(true);
      Promise.all([
        api.list('manufacturers'),
        api.list('categories'), 
        api.list('attributes')
      ])
        .then(([mfrs, cats, attrs]) => {
          setManufacturers(mfrs || []);
          setCategories(cats || []);
          setAttributes(attrs || []);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
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
        }],
        variants: product.variants || [{
          sku: '',
          price: '',
          stock: '',
          attributes: {}
        }]
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        manufacturer_id: '',
        sku: '',
        barcode: '',
        is_digital: false,
        cost_price: '',
        compare_at_price: '',
        weight: '',
        width: '',
        height: '',
        length: '',
        low_stock_threshold: '',
        warranty_info: '',
        return_policy: '',
        tax_class: '',
        is_active: true,
        is_featured: false,
        categories: [],
        images: [{
          url: '',
          alt_text: '',
          is_primary: true,
          display_order: 0
        }],
        variantAttributes: [],
        variants: [{
          sku: '',
          price: '',
          stock: '',
          attributes: {}
        }]
      });
    }
  }, [product]);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantAttributeChange = (variantIndex, attributeId, value) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      attributes: {
        ...newVariants[variantIndex].attributes,
        [attributeId]: value
      }
    };
    setFormData({ ...formData, variants: newVariants });
  };

  const generateSKU = () => {
    if (!formData.manufacturer_id || !formData.categories.length || !formData.variants.length) {
      return '';
    }

    const manufacturer = manufacturers.find(m => m.id === formData.manufacturer_id);
    const category = categories.find(c => c.id === formData.categories[0]);
    
    // Get prefixes
    const mfrPrefix = manufacturer?.code?.slice(0, 3).toUpperCase() || 'MFR';
    const catPrefix = category?.code?.slice(0, 3).toUpperCase() || 'CAT';
    
    // For variants, add attribute values to SKU
    return formData.variants.map(variant => {
      const attrValues = Object.entries(variant.attributes)
        .map(([id, value]) => {
          const attr = attributes.find(a => a.id === parseInt(id));
          return attr?.code?.slice(0, 2).toUpperCase() + value.slice(0, 2).toUpperCase();
        })
        .join('-');

      return `${mfrPrefix}-${catPrefix}-${attrValues}-${Date.now().toString().slice(-4)}`;
    });
  };

  // Add variant with auto-generated SKU
  const addVariant = () => {
    const skus = generateSKU();
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { 
          sku: skus ? skus[formData.variants.length] : '',
          price: formData.price || '',
          stock: '',
          attributes: {}
        }
      ]
    });
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    }
  };

  const toggleVariantAttribute = (attributeId) => {
    setFormData(prev => {
      const currentAttributes = prev.variantAttributes || [];
      const newAttributes = currentAttributes.includes(attributeId)
        ? currentAttributes.filter(id => id !== attributeId)
        : [...currentAttributes, attributeId];
      
      return {
        ...prev,
        variantAttributes: newAttributes
      };
    });
  };

  const generateVariantCombinations = () => {
    const selectedAttrs = attributes.filter(attr => 
      formData.variantAttributes?.includes(attr.id)
    );

    // Get all possible combinations
    const combinations = selectedAttrs.reduce((acc, attr) => {
      const values = attr.options.split(',').map(opt => opt.trim());
      if (acc.length === 0) {
        return values.map(value => ({
          [attr.id]: value
        }));
      }
      
      return acc.flatMap(combo => 
        values.map(value => ({
          ...combo,
          [attr.id]: value
        }))
      );
    }, []);

    // Create variants from combinations
    const skus = generateSKU();
    const newVariants = combinations.map((combo, index) => ({
      sku: skus ? skus[index] : '',
      price: formData.price || '',
      stock: '',
      attributes: combo
    }));

    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) errors.stock = 'Valid stock is required';
    
    // Validate variants
    const variantErrors = [];
    formData.variants.forEach((variant, index) => {
      const error = {};
      if (variant.price && variant.price <= 0) error.price = 'Valid price is required';
      if (variant.stock && variant.stock < 0) error.stock = 'Valid stock is required';
      
      // Check if variant has at least one attribute set
      if (Object.keys(variant.attributes).length === 0) {
        error.attributes = 'At least one attribute must be set';
      }
      
      if (Object.keys(error).length > 0) {
        variantErrors[index] = error;
      }
    });
    
    if (variantErrors.length > 0) {
      errors.variants = variantErrors;
    }
    
    if (formData.compare_at_price && formData.compare_at_price <= formData.price) {
      errors.compare_at_price = 'Compare at price must be higher than regular price';
    }
    
    if (formData.low_stock_threshold && formData.low_stock_threshold < 0) {
      errors.low_stock_threshold = 'Low stock threshold must be positive';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Generate SKU if not provided
    const submissionData = {
      ...formData,
      sku: formData.sku || generateSKU(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : null,
      is_active: Boolean(formData.is_active),
      is_featured: Boolean(formData.is_featured)
    };
    
    onSubmit(submissionData);
  };

  const refreshManufacturers = async () => {
    const response = await fetch('/api/manufacturers');
    const data = await response.json();
    setManufacturers(data || []);
  };

  const refreshCategories = async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data || []);
  };

  const handleViewDetails = () => {
    navigate('/admin/inventory/details/' + product.id);
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={onClose}
        size="lg"
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>{product ? 'Edit' : 'Add'} Product</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
          <Form onSubmit={handleSubmit}>
            <Tabs defaultActiveKey="basic" id="product-tabs">
              <Tab eventKey="basic" title="Basic">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        isInvalid={!!validationErrors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Manufacturer</Form.Label>
                      <div className="category-selector p-2 border rounded">
                        {manufacturers.map(m => (
                          <Form.Check
                            key={m.id}
                            type="radio"
                            name="manufacturer"
                            label={m.name}
                            checked={formData.manufacturer_id === m.id}
                            onChange={() => setFormData({...formData, manufacturer_id: m.id})}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categories</Form.Label>
                      <div className="category-selector p-2 border rounded">
                        {categories.map(cat => (
                          <Form.Check
                            key={cat.id}
                            type="checkbox"
                            label={cat.name}
                            checked={formData.categories.includes(cat.id)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...formData.categories, cat.id]
                                : formData.categories.filter(id => id !== cat.id);
                              setFormData({...formData, categories: newCategories});
                            }}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      label="Active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      label="Featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    />
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="pricing" title="Pricing & Stock">
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        isInvalid={!!validationErrors.price}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Compare at Price</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.compare_at_price}
                        onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})}
                        isInvalid={!!validationErrors.compare_at_price}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cost Price</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        isInvalid={!!validationErrors.stock}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Low Stock Threshold</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="variants" title="Variants">
                <div className="mb-4">
                  <h6>Select Attributes for Variants</h6>
                  <div className="category-selector p-2 border rounded d-flex flex-wrap align-items-start">
                    {attributes.map(attr => (
                      <Button
                        key={attr.id}
                        variant={formData.variantAttributes?.includes(attr.id) ? "primary" : "outline-secondary"}
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => toggleVariantAttribute(attr.id)}
                      >
                        {attr.name}
                        {formData.variantAttributes?.includes(attr.id) && (
                          <i className="bi bi-check ms-2"></i>
                        )}
                      </Button>
                    ))}
                  </div>
                  {/* ... variant controls and list ... */}
                </div>
              </Tab>

              <Tab eventKey="shipping" title="Shipping">
                {/* Shipping fields */}
              </Tab>
            </Tabs>
          </Form>
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
          <Button variant="primary" onClick={handleSubmit}>
            {product ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={async (data) => {
          await api.create('admin/categories', data);
          setShowCategoryModal(false);
          refreshCategories();
        }}
      />

      <ManufacturerModal
        show={showManufacturerModal}
        onClose={() => setShowManufacturerModal(false)}
        onSubmit={async (data) => {
          await api.create('admin/manufacturers', data);
          setShowManufacturerModal(false);
          refreshManufacturers();
        }}
      />
    </>
  );
};

export default ProductModal; 