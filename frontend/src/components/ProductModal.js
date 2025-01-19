import React, { useState, useEffect } from "react";
import { Form, Button, Modal, Row, Col, Tabs, Tab, Card } from "react-bootstrap";
import axios from "axios";
import CategoryModal from './CategoryModal';
import ManufacturerModal from './ManufacturerModal';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ProductModal = ({ show, product, onClose, onSubmit, onDelete }) => {
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [tabsWithErrors, setTabsWithErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    manufacturer_id: '',
    sku: '',
    is_active: true,
    is_featured: false,
    cost_price: '',
    compare_at_price: '',
    weight: '',
    width: '',
    height: '',
    length: '',
    low_stock_threshold: '',
    meta_title: '',
    meta_description: '',
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
        api.list('api/admin/manufacturers'),
        api.list('api/admin/categories'), 
        api.list('api/admin/attributes')
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
        is_active: true,
        is_featured: false,
        cost_price: '',
        compare_at_price: '',
        weight: '',
        width: '',
        height: '',
        length: '',
        low_stock_threshold: '',
        meta_title: '',
        meta_description: '',
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

  useEffect(() => {
    if (formData.manufacturer_id && formData.categories.length > 0) {
      const skus = generateSKU();
      setFormData(prev => ({
        ...prev,
        sku: skus ? skus[0] : ''
      }));
    }
  }, [formData.manufacturer_id, formData.categories]);

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
    
    // Basic tab
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.stock) errors.stock = 'Stock is required';
    if (!formData.sku) errors.sku = 'SKU is required';
    
    // Determine which tabs have errors
    const newTabsWithErrors = {
      basic: ['name', 'price', 'stock', 'sku'].some(field => errors[field]),
      inventory: false,
      variants: formData.variantAttributes?.length > 0 && 
        formData.variants.some(v => !v.price || !v.stock)
    };

    setTabsWithErrors(newTabsWithErrors);
    return { errors, tabsWithErrors: newTabsWithErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation errors object
    const errors = {};
    
    // Required field validation
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.stock) errors.stock = 'Stock is required';
    if (!formData.sku?.trim()) errors.sku = 'SKU is required';
    
    // Numeric field validation
    if (formData.price && isNaN(parseFloat(formData.price))) {
      errors.price = 'Price must be a valid number';
    }
    if (formData.stock && isNaN(parseInt(formData.stock))) {
      errors.stock = 'Stock must be a valid number';
    }
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    // Format data before submission
    const formattedData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku?.trim() || '',
      is_active: Boolean(formData.is_active),
      is_featured: Boolean(formData.is_featured),
      cost_price: parseFloat(formData.cost_price) || 0,
      compare_at_price: parseFloat(formData.compare_at_price) || 0,
      weight: parseFloat(formData.weight) || 0,
      width: parseFloat(formData.width) || 0,
      height: parseFloat(formData.height) || 0,
      length: parseFloat(formData.length) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 0,
      meta_title: formData.meta_title?.trim() || '',
      meta_description: formData.meta_description?.trim() || '',
      manufacturer_id: parseInt(formData.manufacturer_id) || null,
      categories: formData.categories || [],
      images: formData.images || [],
      variants: formData.variants || []
    };

    onSubmit(formattedData);
  };

  const refreshManufacturers = async () => {
    try {
      const data = await api.list('api/admin/manufacturers');
      setManufacturers(data || []);
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
      toast.error('Failed to load manufacturers');
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await api.list('api/admin/categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
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
            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => setActiveTab(k)} 
              id="product-tabs"
            >
              <Tab 
                eventKey="basic" 
                title={
                  <span>
                    Basic
                    {tabsWithErrors?.basic && 
                      <i className="bi bi-exclamation-circle text-danger ms-2"></i>
                    }
                  </span>
                }
              >
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        isInvalid={!!validationErrors.name}
                        required
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
                        Storefront visibility
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Featured Status</Form.Label>
                      <div
                        className="status-toggle"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            is_featured: !formData.is_featured
                          })
                        }
                        style={{
                          '--toggle-position': formData.is_featured ? '0' : '100%',
                          '--toggle-color': formData.is_featured ? 'var(--bs-success)' : 'var(--bs-danger)'
                        }}
                      >
                        <div className={`status-option ${formData.is_featured ? 'active' : ''}`}>
                          Featured
                        </div>
                        <div className={`status-option ${!formData.is_featured ? 'active' : ''}`}>
                          Not Featured
                        </div>
                      </div>
                      <Form.Text className="text-muted">
                        Shows in featured sections
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              <Tab 
                eventKey="inventory" 
                title={
                  <span>
                    Inventory
                    {tabsWithErrors?.inventory && 
                      <i className="bi bi-exclamation-circle text-danger ms-2"></i>
                    }
                  </span>
                }
              >
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        isInvalid={!!validationErrors.price}
                        required
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
                      <Form.Text className="text-muted">
                        Original price for showing discounts (displayed as strikethrough)
                      </Form.Text>
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
                      <Form.Text className="text-muted">
                        Product cost for internal margin calculations (not visible to customers)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        isInvalid={!!validationErrors.stock}
                        required
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
                      <Form.Text className="text-muted">
                        Inventory level that triggers low stock notifications
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>SKU</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.sku}
                        readOnly
                        placeholder="Auto-generated when manufacturer and category are selected"
                      />
                      <Form.Text className="text-muted">
                        Automatically generated based on manufacturer code and category
                      </Form.Text>
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
          try {
            const response = await api.create('api/admin/categories', data);
            toast.success('Category created successfully');
            setShowCategoryModal(false);
            const cats = await api.list('api/admin/categories');
            setCategories(cats || []);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create category');
          }
        }}
      />

      <ManufacturerModal
        show={showManufacturerModal}
        onClose={() => setShowManufacturerModal(false)}
        onSubmit={async (data) => {
          try {
            await api.create('api/admin/manufacturers', data);
            toast.success('Manufacturer created successfully');
            setShowManufacturerModal(false);
            const mfrs = await api.list('api/admin/manufacturers');
            setManufacturers(mfrs || []);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create manufacturer');
          }
        }}
      />
    </>
  );
};

export default ProductModal; 