import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Tabs, Tab } from "react-bootstrap";

const CategoryModal = ({ show, category, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    image_url: '',
    is_active: true,
    display_order: 0,
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        image_url: '',
        is_active: true,
        display_order: 0,
        meta_title: '',
        meta_description: ''
      });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{category ? 'Edit' : 'Add'} Category</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tabs defaultActiveKey="basic" className="mb-4">
            <Tab eventKey="basic" title="Basic Info">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                    />
                    <Form.Text className="text-muted">
                      Lower numbers appear first
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Detailed description shown to customers
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Parent Category</Form.Label>
                <Form.Select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                >
                  <option value="">None (Top Level)</option>
                  {/* Parent categories populated here */}
                </Form.Select>
                <Form.Text className="text-muted">
                  Creates nested category hierarchies
                </Form.Text>
              </Form.Group>

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
                  Hidden from navigation when inactive
                </Form.Text>
              </Form.Group>
            </Tab>

            <Tab eventKey="seo" title="SEO & Media">
              <Form.Group className="mb-3">
                <Form.Label>Slug*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                />
                <Form.Text className="text-muted">
                  URL-friendly version of the name
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Direct link to category image (800x600px)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Meta Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Custom page title for SEO (leave blank to use category name)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Meta Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Brief description for search results (150-160 chars)
                </Form.Text>
              </Form.Group>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {category ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
