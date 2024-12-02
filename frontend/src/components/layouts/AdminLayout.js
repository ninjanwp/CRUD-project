import React from 'react';
import { Container } from 'react-bootstrap';

const AdminLayout = ({ children }) => {
  const navItems = [
    { path: '/admin/products', icon: 'bi-box-seam', label: 'Products' },
    { path: '/admin/product-dashboard', icon: 'bi-gear', label: 'Product Settings' },
    { path: '/admin/orders', icon: 'bi-bag-check', label: 'Orders' },
    { path: '/admin/users', icon: 'bi-people', label: 'Users' },
    { path: '/admin/metrics', icon: 'bi-graph-up', label: 'Metrics' }
  ];

  return (
    <Container fluid className="py-4">
      {children}
    </Container>
  );
};

export default AdminLayout; 