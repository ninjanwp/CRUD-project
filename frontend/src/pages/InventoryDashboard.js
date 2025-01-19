import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import DataTable from '../components/common/DataTable';
import useTableData from '../hooks/useTableData';
import CategoryModal from '../components/CategoryModal';
import ManufacturerModal from '../components/ManufacturerModal';
import AttributeManager from '../components/AttributeManager';
import api from '../services/api';

const ProductDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const sections = {
    categories: {
      title: 'Categories',
      singularTitle: 'Category',
      icon: 'bi-tags',
      color: 'warning',
      endpoint: 'category',
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'description', label: 'Description' },
        { field: 'display_order', label: 'Display Order' }
      ],
      modal: CategoryModal,
      addButtonText: 'Add Category',
      sortOptions: [
        { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
        { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
        { field: 'display_order', direction: 'asc', label: 'Display Order (Low-High)' },
        { field: 'display_order', direction: 'desc', label: 'Display Order (High-Low)' }
      ]
    },
    manufacturers: {
      title: 'Manufacturers',
      singularTitle: 'Manufacturer',
      icon: 'bi-building',
      color: 'info',
      endpoint: 'manufacturer',
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'code', label: 'Code' },
        { field: 'contact_info', label: 'Contact Info' }
      ],
      modal: ManufacturerModal,
      addButtonText: 'Add Manufacturer',
      sortOptions: [
        { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
        { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
        { field: 'code', direction: 'asc', label: 'Code (A-Z)' },
        { field: 'code', direction: 'desc', label: 'Code (Z-A)' }
      ]
    },
    attributes: {
      title: 'Product Attributes',
      singularTitle: 'Product Attribute',
      icon: 'bi-list-check',
      color: 'success',
      endpoint: 'attributes',
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'code', label: 'Code' },
        { field: 'type', label: 'Type' },
        { field: 'is_variant', label: 'Variant', format: value => value ? 'Yes' : 'No' }
      ],
      modal: AttributeManager,
      sortOptions: [
        { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
        { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
        { field: 'type', direction: 'asc', label: 'Type (A-Z)' },
        { field: 'type', direction: 'desc', label: 'Type (Z-A)' }
      ]
    }
  };

  const {
    data,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    handleSort,
    handleSearch,
    refreshData
  } = useTableData(activeSection ? sections[activeSection].endpoint : null);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editItem) {
        await api.update(sections[activeSection].endpoint, editItem.id, formData);
      } else {
        await api.create(sections[activeSection].endpoint, formData);
      }
      setShowModal(false);
      setEditItem(null);
      refreshData();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const ModalComponent = activeSection ? sections[activeSection].modal : null;

  return (
    <>
      {!activeSection ? (
        <Row className="mt-4">
          {Object.entries(sections).map(([key, section]) => (
            <Col md={4} key={key}>
              <Card 
                className="dashboard-card mb-4 h-100 shadow-sm fade show" 
                onClick={() => setActiveSection(key)}
                style={{ cursor: 'pointer', transition: 'all .2s ease-in-out' }}
              >
                <Card.Body className="d-flex flex-column">
                  <div className={`text-${section.color} mb-3`}>
                    <i className={`bi ${section.icon} display-4`}></i>
                  </div>
                  <Card.Title className="mt-3">{section.title}</Card.Title>
                  <div className={`text-${section.color} mt-3`}>
                    <small>Click to manage <i className="bi bi-arrow-right"></i></small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button 
              variant="link" 
              className="me-3 p-0" 
              onClick={() => setActiveSection(null)}
            >
              <i className="bi bi-arrow-left h4 mb-0"></i>
            </Button>
            <h2 className="mb-0">{sections[activeSection].title}</h2>
          </div>

          <DataTable
            title={<><i className={`bi ${sections[activeSection].icon} me-2`}></i>{sections[activeSection].title}</>}
            columns={sections[activeSection].columns}
            data={data || []}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onSort={handleSort}
            sortOptions={sections[activeSection].sortOptions}
            onSearch={handleSearch}
            actionButton={
              <Button 
                variant="primary" 
                onClick={() => setShowModal(true)}
                className="d-inline-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add {sections[activeSection].singularTitle}
              </Button>
            }
          />

          {showModal && ModalComponent && (
            <ModalComponent
              show={showModal}
              onClose={() => {
                setShowModal(false);
                setEditItem(null);
              }}
              onSubmit={handleSubmit}
              item={editItem}
            />
          )}
        </>
      )}
    </>
  );
};

export default ProductDashboard; 