import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Modal,
  Row,
  Col,
  Tabs,
  Tab,
  Card,
} from "react-bootstrap";
import axios from "axios";
import CategoryModal from "./CategoryModal";
import ManufacturerModal from "./ManufacturerModal";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-hot-toast";

const ProductModal = ({ show, onClose, product, onSubmit, onDelete }) => {
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
    is_active: true,
    is_featured: false,
    cost_price: "",
    compare_at_price: "",
    weight: "",
    width: "",
    height: "",
    length: "",
    low_stock_threshold: "",
    meta_title: "",
    meta_description: "",
    manufacturer_id: null,
    categories: [],
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, manufacturersRes] = await Promise.all([
          api.list("/api/admin/categories"),
          api.list("/api/admin/manufacturers"),
        ]);
        setCategories(categoriesRes.data || []);
        setManufacturers(manufacturersRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories or manufacturers");
        setCategories([]);
        setManufacturers([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        cost_price: product.cost_price?.toString() || "",
        compare_at_price: product.compare_at_price?.toString() || "",
        weight: product.weight?.toString() || "",
        width: product.width?.toString() || "",
        height: product.height?.toString() || "",
        length: product.length?.toString() || "",
        low_stock_threshold: product.low_stock_threshold?.toString() || "",
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
        manufacturer_id: product.manufacturer_id || null,
        categories: product.category_ids || [],
        images: product.images || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        sku: "",
        is_active: true,
        is_featured: false,
        cost_price: "",
        compare_at_price: "",
        weight: "",
        width: "",
        height: "",
        length: "",
        low_stock_threshold: "",
        meta_title: "",
        meta_description: "",
        manufacturer_id: null,
        categories: [],
        images: [],
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        compare_at_price: parseFloat(formData.compare_at_price) || 0,
        weight: parseFloat(formData.weight) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        length: parseFloat(formData.length) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 0,
      };

      if (product) {
        await api.update("/api/admin/products", product.id, data);
      } else {
        await api.create("/api/admin/products", data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/admin/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...response.data],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product ? "Edit Product" : "Add Product"}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}
      >
        <Form id="productForm" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

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

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Manufacturer</Form.Label>
                <Form.Select
                  value={formData.manufacturer_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manufacturer_id: e.target.value || null,
                    })
                  }
                >
                  <option value="">Select Manufacturer</option>
                  {(manufacturers || []).map((manufacturer) => (
                    <option key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Categories</Form.Label>
                <Form.Select
                  multiple
                  value={formData.categories || []}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setFormData({ ...formData, categories: selected });
                  }}
                >
                  {(categories || []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cost Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Compare at Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compare_at_price: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Low Stock Threshold</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      low_stock_threshold: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Width (cm)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({ ...formData, width: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Length (cm)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.length}
                  onChange={(e) =>
                    setFormData({ ...formData, length: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Active</Form.Label>
                <Form.Check
                  type="switch"
                  id="is-active-switch"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Featured</Form.Label>
                <Form.Check
                  type="switch"
                  id="is-featured-switch"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Meta Title</Form.Label>
            <Form.Control
              type="text"
              value={formData.meta_title}
              onChange={(e) =>
                setFormData({ ...formData, meta_title: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meta Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.meta_description}
              onChange={(e) =>
                setFormData({ ...formData, meta_description: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Images</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <div className="mt-2">Uploading...</div>}
            <div className="d-flex flex-wrap gap-2 mt-2">
              {formData.images.map((image, index) => (
                <div key={index} className="position-relative">
                  <img
                    src={image.url}
                    alt={image.alt_text || `Product ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="productForm">
          Save
        </Button>
        {product && (
          <Button
            variant="danger"
            className="me-auto"
            onClick={() => onDelete(product.id)}
          >
            Delete
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
