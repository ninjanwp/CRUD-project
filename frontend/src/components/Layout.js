import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useSettings();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <Navbar 
        bg="dark" 
        variant="dark"
        expand="lg" fixed="top" className="shadow"
      >
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/dashboard">Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard" className="nav-link-animated me-2">
                <i className="bi bi-house-door me-2"></i>
                Dashboard
              </Nav.Link>
              <div className="nav-divider"></div>
              <Nav.Link as={Link} to="/products" className="nav-link-animated me-2">
                <i className="bi bi-box-seam me-2"></i>
                Products
              </Nav.Link>
              <div className="nav-divider"></div>
              <Nav.Link as={Link} to="/orders" className="nav-link-animated me-2">
                <i className="bi bi-bag-check me-2"></i>
                Orders
              </Nav.Link>
              <div className="nav-divider"></div>
              <Nav.Link as={Link} to="/metrics" className="nav-link-animated me-2">
                <i className="bi bi-graph-up me-2"></i>
                Metrics
              </Nav.Link>
            </Nav>
            <Nav>
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark">
                  {user?.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ paddingTop: '76px' }}>
        <Container fluid className="px-4">
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout; 