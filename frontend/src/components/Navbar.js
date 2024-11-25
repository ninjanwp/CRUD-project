import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <Navbar 
      variant="dark"
      expand="lg" 
      fixed="top" 
      className="shadow navbar-custom"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-shop me-2"></i>
          Store Management
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              <i className="bi bi-house-door me-2"></i>Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/products">
              <i className="bi bi-box me-2"></i>Products
            </Nav.Link>
            <Nav.Link as={NavLink} to="/orders">
              <i className="bi bi-cart me-2"></i>Orders
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard">
              <i className="bi bi-graph-up me-2"></i>Dashboard
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 