import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import DataTable from "../../components/common/DataTable";
import useTableData from "../../hooks/useTableData";
import CategoryModal from "../../components/CategoryModal";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const CategoriesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: categories,
    error,
    isLoading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData,
  } = useTableData("/api/admin/categories");

  const columns = [
    { field: "name", label: "Name" },
    { field: "description", label: "Description" },
    { field: "display_order", label: "Display Order" },
    {
      field: "products_count",
      label: "Products",
      format: (value) => value || 0,
    },
  ];

  const sortOptions = [
    { field: "name", direction: "asc", label: "Name (A-Z)" },
    { field: "name", direction: "desc", label: "Name (Z-A)" },
    {
      field: "display_order",
      direction: "asc",
      label: "Display Order (Low-High)",
    },
    {
      field: "display_order",
      direction: "desc",
      label: "Display Order (High-Low)",
    },
    { field: "products_count", direction: "desc", label: "Most Products" },
    { field: "products_count", direction: "asc", label: "Least Products" },
  ];

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editItem) {
        await api.update("/api/admin/categories", editItem.id, formData);
        toast.success("Category updated successfully");
      } else {
        await api.create("/api/admin/categories", formData);
        toast.success("Category created successfully");
      }
      setShowModal(false);
      setEditItem(null);
      refreshData();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (isSubmitting) return;

    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.delete("/api/admin/categories", id);
      toast.success("Category deleted successfully");
      setShowModal(false);
      setEditItem(null);
      refreshData();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="page-content">
        <div className="alert alert-danger">
          Failed to load categories. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <DataTable
        title={
          <>
            <i className="bi bi-tags me-2"></i>
            Categories
          </>
        }
        columns={columns}
        data={categories}
        isLoading={isLoading}
        actionButton={
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="d-inline-flex align-items-center"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Category
          </Button>
        }
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onSort={handleSort}
        onSearch={handleSearch}
        onRowClick={handleEdit}
        sortOptions={sortOptions}
      />

      {showModal && (
        <CategoryModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          category={editItem}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
