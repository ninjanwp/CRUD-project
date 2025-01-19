import React, { useState } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Nav,
  Modal as BootstrapModal,
} from "react-bootstrap";
import DataTable from "../../components/common/DataTable";
import EditUserModal from "../../components/admin/EditUserModal";
import useTableData from "../../hooks/useTableData";
import { formatDate } from "../../utils/formatters";
import api from "../../services/api";

const UsersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const columns = [
    { field: "username", label: "Username" },
    { field: "email", label: "Email" },
    { field: "role", label: "Role" },
    {
      field: "status",
      label: "Status",
      format: (value) => (value ? "Active" : "Inactive"),
    },
  ];

  const {
    data: users,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData,
  } = useTableData("users");

  const handleEdit = () => {
    setEditUser(selectedUser);
    setShowModal(true);
  };

  const handleSubmit = async (userData) => {
    try {
      console.log("Submitting user data:", userData); // Debug log

      if (editUser) {
        const updatedUser = await api.update(
          "/api/admin/users",
          editUser.id,
          userData
        );
        console.log("Update response:", updatedUser); // Debug log

        if (updatedUser) {
          setShowModal(false);
          setEditUser(null);
          // Update the selected user if it was the one being edited
          if (selectedUser?.id === editUser.id) {
            setSelectedUser(updatedUser);
          }
          await refreshData(); // Refresh the list
        }
      } else {
        const newUser = await api.create("/api/admin/users", userData);
        if (newUser) {
          setShowModal(false);
          setEditUser(null);
          await refreshData();
        }
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      // TODO: Add error notification
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedUser?.id) {
        console.error("No user selected for deletion");
        return;
      }

      console.log("Deleting user:", selectedUser.id);
      const response = await api.delete("users", selectedUser.id);

      if (response) {
        console.log("Delete response:", response);
        setShowDeleteModal(false);
        setSelectedUser(null);
        await refreshData();
        // Could add a success toast here
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete user";
      // Could add an error toast here

      // If user not found, refresh the list
      if (error.response?.status === 404) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        await refreshData();
      }
    }
  };

  return (
    <Row className="g-3">
      <Col md={4} className="border-end">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <i className="bi bi-people me-2"></i>
            Users
          </h5>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add User
          </Button>
        </div>

        <div className="user-list">
          {users.map((user) => (
            <div
              key={user.id}
              className={`user-list-item p-3 ${
                selectedUser?.id === user.id ? "selected" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{user.email}</div>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge bg-secondary">{user.role}</span>
                  <span
                    className={`badge ${
                      user.status === "active" ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <select
            className="form-select form-select-sm w-auto"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
          <div className="btn-group">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`btn btn-sm ${
                  currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </Col>

      <Col md={8}>
        {selectedUser ? (
          <div>
            <Nav variant="tabs" className="mb-0">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "details"}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "orders"}
                  onClick={() => setActiveTab("orders")}
                >
                  Orders
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "cart"}
                  onClick={() => setActiveTab("cart")}
                >
                  Cart
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {activeTab === "details" && (
              <div className="user-details">
                <div className="details-header d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-circle h3 mb-0 text-muted me-2"></i>
                    <h5 className="mb-0">{selectedUser.email}</h5>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleEdit}>
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Full Name</div>
                  <div className="col-8">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Email</div>
                  <div className="col-8">{selectedUser.email}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Role</div>
                  <div className="col-8 text-capitalize">
                    {selectedUser.role}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Status</div>
                  <div className="col-8">
                    <span
                      className={
                        selectedUser.status === "active"
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {selectedUser.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Created</div>
                  <div className="col-8">
                    {formatDate(selectedUser.created_at)}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4 text-muted">Last Login</div>
                  <div className="col-8">
                    {selectedUser.last_login
                      ? formatDate(selectedUser.last_login)
                      : "Never"}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="user-details">
                <h6 className="mb-3">Order History</h6>
                {/* Add order history table/list here */}
              </div>
            )}

            {activeTab === "cart" && (
              <div className="user-details">
                <h6 className="mb-3">Current Cart</h6>
                {/* Add cart contents here */}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bi bi-person-circle display-1 mb-3"></i>
            <h5>Select a user to view details</h5>
          </div>
        )}
      </Col>

      <EditUserModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditUser(null);
        }}
        user={editUser}
        onSubmit={handleSubmit}
      />

      <BootstrapModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Delete User</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          Are you sure you want to delete user{" "}
          <strong>{selectedUser?.email}</strong>? This action cannot be undone.
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </BootstrapModal.Footer>
      </BootstrapModal>

      <style>
        {`
          .user-list {
            border: 1px solid #dee2e6;
            border-radius: 0;
            overflow: hidden;
            height: calc(100vh - 200px);
            overflow-y: auto;
            background: white;
          }

          .user-list-item {
            border-bottom: 1px solid #dee2e6;
            background-color: white;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .user-list-item:hover {
            background-color: #f8f9fa;
          }

          .user-list-item.selected {
            background-color: #e7f1ff;
            border-left: 4px solid #0d6efd;
          }

          .user-list-item:last-child {
            border-bottom: none;
          }

          .badge {
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.35em 0.65em;
          }

          .gap-2 {
            gap: 0.5rem !important;
          }

          .nav-tabs {
            border-bottom: 1px solid #dee2e6;
            background: transparent;
          }

          .nav-tabs .nav-link {
            border-radius: 0.375rem 0.375rem 0 0;
            padding: 0.75rem 1.5rem;
            margin-bottom: -1px;
            border: 1px solid transparent;
          }

          .nav-tabs .nav-link:hover {
            border-color: #e9ecef #e9ecef #dee2e6;
            isolation: isolate;
          }

          .nav-tabs .nav-link.active {
            background-color: white;
            border-color: #dee2e6 #dee2e6 #fff;
          }

          .user-details {
            background: white;
            border: 1px solid #dee2e6;
            border-top: none;
            padding: 1.5rem;
            min-height: 300px;
          }

          .row {
            margin: 0;
            padding: 0.5rem 0;
          }

          .row:not(:last-child) {
            border-bottom: 1px solid #dee2e6;
          }

          .page-content {
            background: #f8f9fa;
          }
        `}
      </style>
    </Row>
  );
};

export default UsersPage;
