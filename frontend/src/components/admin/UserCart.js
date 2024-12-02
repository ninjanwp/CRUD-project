import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatters';

const UserCart = ({ userId }) => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`/api/admin/users/${userId}/cart`);
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, [userId]);

  if (!cart) return <p>No active cart</p>;

  return (
    <Card>
      <Card.Body>
        <h5>Current Cart ({cart.items?.length || 0} items)</h5>
        <Table responsive>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.items?.map(item => (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default UserCart; 