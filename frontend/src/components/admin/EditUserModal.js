import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const EditUserModal = ({ show, onHide, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "customer",
    status: "active",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "customer",
        status: user.status || "active",
      });
    } else {
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        role: "customer",
        status: "active",
        password: "",
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      status: formData.status,
    };

    if (!user && formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Edit" : "Add"} User</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="px-4">
          <div className="mb-4">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {!user && (
            <div className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!user}
              />
            </div>
          )}

          <div className="mb-4">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="customer">Customer</option>
            </Form.Select>
          </div>

          <div className="mb-4">
            <div
              className="status-toggle"
              onClick={() =>
                setFormData({
                  ...formData,
                  status: formData.status === "active" ? "inactive" : "active",
                })
              }
            >
              <div
                className={`status-option ${
                  formData.status === "active" ? "active" : ""
                }`}
              >
                Active
              </div>
              <div
                className={`status-option ${
                  formData.status === "inactive" ? "active" : ""
                }`}
              >
                Inactive
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {user ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Form>

      <style>
        {`
          .status-toggle {
            display: flex;
            width: 100%;
            height: 38px;
            border-radius: 0.375rem;
            overflow: hidden;
            cursor: pointer;
            background: #e9ecef;
            user-select: none;
            position: relative;
            border: 1px solid #dee2e6;
          }

          .status-toggle::before {
            content: '';
            position: absolute;
            width: 50%;
            height: 100%;
            transition: all 0.3s ease;
            transform: translateX(${
              formData.status === "active" ? "0" : "100%"
            });
            background: ${
              formData.status === "active"
                ? "var(--bs-success)"
                : "var(--bs-danger)"
            };
            z-index: 1;
          }

          .status-option {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            font-size: 14px;
            color: #6c757d;
            position: relative;
            z-index: 2;
            transition: color 0.2s ease;
          }

          .status-option.active {
            color: white;
          }
        `}
      </style>
    </Modal>
  );
};

export default EditUserModal;
