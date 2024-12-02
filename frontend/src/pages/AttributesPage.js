const AttributesPage = () => {
  const [activeType, setActiveType] = useState('category');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
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
  } = useTableData(`attributes/${activeType}`);

  const attributeTypes = {
    category: {
      name: 'Categories',
      fields: ['name', 'code', 'description', 'display_order'],
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'code', label: 'Code' },
        { field: 'description', label: 'Description' },
        { field: 'display_order', label: 'Order' }
      ]
    },
    manufacturer: {
      name: 'Manufacturers',
      fields: ['name', 'code', 'contact_info'],
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'code', label: 'Code' },
        { field: 'contact_info', label: 'Contact Info' }
      ]
    },
    product_attribute: {
      name: 'Product Attributes',
      fields: ['name', 'code', 'type', 'options'],
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'code', label: 'Code' },
        { field: 'type', label: 'Type' },
        { field: 'options', label: 'Options' }
      ]
    }
  };

  const handleAdd = () => {
    setEditItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editItem) {
        await api.updateAttribute(activeType, editItem.id, formData);
      } else {
        await api.createAttribute(activeType, formData);
      }
      setShowModal(false);
      refreshData();
    } catch (error) {
      console.error('Failed to save attribute:', error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Attributes Management</h1>
        <div className="d-flex gap-2">
          <ButtonGroup>
            {Object.entries(attributeTypes).map(([key, type]) => (
              <Button
                key={key}
                variant={activeType === key ? "primary" : "outline-primary"}
                onClick={() => setActiveType(key)}
              >
                {type.name}
              </Button>
            ))}
          </ButtonGroup>
          <Button variant="primary" onClick={handleAdd}>
            Add {attributeTypes[activeType].name.slice(0, -1)}
          </Button>
        </div>
      </div>

      <DataTable
        columns={[
          ...attributeTypes[activeType].columns,
          {
            field: "actions",
            label: "",
            className: "text-center",
            format: (_, item) => (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEdit(item)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
            ),
          },
        ]}
        data={data}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalPages={totalPages}
        handleSort={handleSort}
        handleSearch={handleSearch}
      />

      <AttributeModal
        show={showModal}
        attribute={editItem}
        type={activeType}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 