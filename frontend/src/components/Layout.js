import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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
        variant="dark"
        expand="lg" 
        fixed="top" 
        className="shadow navbar-custom"
      >
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/dashboard">Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="collapse">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard" className="me-2">
                <i className="bi bi-house-door me-2"></i>
                Dashboard
              </Nav.Link>
              <div className="nav-divider"></div>
              <Nav.Link as={Link} to="/products" className="me-2">
                <i className="bi bi-box-seam me-2"></i>
                Products
              </Nav.Link>
              <div className="nav-divider"></div>
              <Nav.Link as={Link} to="/orders" className="me-2">
                <i className="bi bi-bag-check me-2"></i>
                Orders
              </Nav.Link>
              <div className="nav-divider"></div>
              <Nav.Link as={Link} to="/metrics" className="me-2">
                <i className="bi bi-graph-up me-2"></i>
                Metrics
              </Nav.Link>
            </Nav>
            <Nav>
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark">
                  {user?.email}
                </Dropdown.Toggle>
                <Dropdown.Menu className="fade">
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