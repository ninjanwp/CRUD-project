import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const MainNav = () => {
  const { user, logout } = useAuth();
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
      className={`shadow ${isAdminSection ? 'navbar-custom' : 'bg-white'}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-shop me-2"></i>
          {isAdminSection ? 'Store Management' : 'Storefront'}
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {isAdminSection ? (
              // Admin Navigation Items
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/products">Products</Nav.Link>
                <Nav.Link as={Link} to="/admin/orders">Orders</Nav.Link>
                <Nav.Link as={Link} to="/admin/metrics">Metrics</Nav.Link>
              </>
            ) : (
              // Client Navigation Items
              <>
                <Nav.Link as={Link} to="/products">Products</Nav.Link>
                <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            {user && (
              <Nav.Link as={Link} to="/cart" className="cart-link me-2">
                <i className="bi bi-cart3 cart-icon"></i>
                {user?.cart?.length > 0 && (
                  <span className="badge rounded-pill bg-danger cart-badge">
                    {user.cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Nav.Link>
            )}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant={isAdminSection ? "dark" : "light"} className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2"></i>
                  {user.email}
                  {user.role === 'admin' && <span className="ms-1 badge bg-primary">Admin</span>}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {user.role === 'admin' && (
                    <>
                      <Dropdown.Item as={Link} to={isAdminSection ? "/" : "/admin/dashboard"}>
                        {isAdminSection ? 'View Store' : 'Admin Dashboard'}
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/settings">Settings</Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/cart">Cart ({user.cart?.length || 0})</Dropdown.Item>
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