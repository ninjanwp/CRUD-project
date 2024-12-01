import React, { useState } from "react";
import { Button } from "react-bootstrap";
import DataTable from "../components/common/DataTable";
import useTableData from "../hooks/useTableData";
import api from "../services/api";
import CategoryModal from "../components/CategoryModal";

const CategoriesPage = () => {
  const {
    data,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData,
    sortField,
    sortOrder,
  } = useTableData("categories");

  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const columns = [
    { field: "id", label: "ID" },
    { field: "name", label: "Name" },
    { field: "description", label: "Description" },
    { field: "display_order", label: "Display Order" },
    {
      field: "actions",
      label: "",
      className: "text-center",
      format: (_, item) => (
        <Button
          variant="outline-primary"
          size="sm"
          className="btn-edit"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          <i className="bi bi-pencil"></i>
        </Button>
      ),
    },
  ];

  const sortOptions = [
    { field: "name", direction: "asc", label: "Name (A-Z)" },
    { field: "name", direction: "desc", label: "Name (Z-A)" },
    { field: "display_order", direction: "asc", label: "Display Order (Low-High)" },
    { field: "display_order", direction: "desc", label: "Display Order (High-Low)" }
  ];

  const handleEdit = (category) => {
    setEditCategory(category);
    setShowModal(true);
  };

  const handleSubmit = async (categoryData) => {
    try {
      console.log('Submitting category data:', categoryData);
      if (editCategory) {
        await api.updateCategory(editCategory.id, categoryData);
      } else {
        await api.createCategory(categoryData);
      }
      setShowModal(false);
      setEditCategory(null);
      refreshData();
    } catch (error) {
      console.error('Failed to save category:', error.response?.data || error);
    }
  };

  return (
    <>
      <DataTable
        title={<><i className="bi bi-tags me-2"></i>Categories</>}
        columns={columns}
        data={data}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onSort={handleSort}
        sortOptions={sortOptions}
        onSearch={handleSearch}
        sortField={sortField}
        sortOrder={sortOrder}
        actionButton={
          <Button 
            variant="outline-primary" 
            onClick={() => setShowModal(true)}
            className="d-inline-flex align-items-center"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Category
          </Button>
        }
      />

      <CategoryModal
        show={showModal}
        category={editCategory}
        onClose={() => {
          setShowModal(false);
          setEditCategory(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default CategoriesPage;
