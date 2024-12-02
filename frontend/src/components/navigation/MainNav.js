import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import CartPreview from '../cart/CartPreview';
import { useCart } from '../../context/CartContext';

const MainNav = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});
  const isAdminSection = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleAuthChange = () => forceUpdate({});
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    logout();
    if (location.pathname === '/') {
      navigate(0);
    } else {
      navigate('/');
    }
  };

  return (
    <Navbar
      variant={isAdminSection ? "dark" : "light"}
      expand="lg"
      fixed="top"
      className={`shadow ${isAdminSection ? "navbar-custom" : "bg-white"}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-shop me-2"></i>
          {isAdminSection ? "Store Management" : "Storefront"}
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {isAdminSection ? (
              <>
                <Nav.Link as={Link} to="/admin">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/inventory">
                  Inventory
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/orders">
                  Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users">
                  Users
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/metrics">
                  Metrics
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/products">
                  Products
                </Nav.Link>
                <Nav.Link as={Link} to="/categories">
                  Categories
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center gap-3">
            <Nav.Link as={Link} to="/cart" className="cart-link">
              <i className="bi bi-cart3 cart-icon"></i>
              {cart.length > 0 && (
                <span className="badge rounded-pill bg-primary cart-badge">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
              <CartPreview />
            </Nav.Link>
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant={isAdminSection ? "dark" : "light"}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-person-circle user-icon"></i>
                  <span className="ms-2">
                    {user.email}
                    {user.role === "admin" && (
                      <span className="badge bg-primary admin-badge">
                        Admin
                      </span>
                    )}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {user.role === "admin" && (
                    <>
                      <Dropdown.Item
                        as={Link}
                        to={isAdminSection ? "/" : "/admin"}
                      >
                        {isAdminSection ? "View Store" : "Admin Dashboard"}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  <Dropdown.Item as={Link} to="/profile">
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button as={Link} to="/login" variant="primary">
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNav; 