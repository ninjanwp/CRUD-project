import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import AdminLayout from '../../components/layouts/AdminLayout';
import { formatDate, formatCurrency } from '../../utils/formatters';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/admin/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <AdminLayout>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Orders</h1>
        </div>

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user_email}</td>
                <td>{order.items_count}</td>
                <td>{formatCurrency(order.total_amount)}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>
                  <Badge bg={
                    order.status === 'completed' ? 'success' :
                    order.status === 'pending' ? 'warning' :
                    order.status === 'cancelled' ? 'danger' : 'secondary'
                  }>
                    {order.status}
                  </Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2">
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-success"
                    disabled={order.status !== 'pending'}
                  >
                    Complete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </AdminLayout>
  );
};

export default OrdersPage; 