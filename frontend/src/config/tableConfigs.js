export const sortOptionConfigs = {
  orders: [
    { field: 'created_at', direction: 'desc', label: 'Newest First', icon: 'bi-sort-down' },
    { field: 'created_at', direction: 'asc', label: 'Oldest First', icon: 'bi-sort-up' },
    { field: 'total', direction: 'desc', label: 'Highest Total', icon: 'bi-sort-numeric-down' },
    { field: 'total', direction: 'asc', label: 'Lowest Total', icon: 'bi-sort-numeric-up' }
  ],
  products: [
    { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
    { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
    { field: 'price', direction: 'desc', label: 'Price (High-Low)' },
    { field: 'price', direction: 'asc', label: 'Price (Low-High)' },
    { field: 'stock', direction: 'desc', label: 'Stock (High-Low)' },
    { field: 'stock', direction: 'asc', label: 'Stock (Low-High)' }
  ]
};

export const columnConfigs = {
  products: [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'description', label: 'Description' },
    { field: 'categories', label: 'Categories' },
    {
      field: 'price',
      label: 'Price',
      format: 'currency',
      className: 'text-end'
    },
    {
      field: 'stock',
      label: 'Stock',
      className: 'text-end'
    },
    {
      field: 'is_active',
      label: 'Status',
      format: (value) => value ? 'Active' : 'Inactive'
    },
    {
      field: 'manufacturer_name',
      label: 'Manufacturer',
      className: 'text-center'
    }
  ],
  orders: [
    { field: 'id', label: 'Order ID' },
    { field: 'user_email', label: 'Customer' },
    { field: 'status', label: 'Status' },
    { 
      field: 'total_amount', 
      label: 'Total',
      className: 'text-end',
      format: 'currency'
    },
    { 
      field: 'created_at', 
      label: 'Date',
      format: 'date'
    }
  ]
}; 