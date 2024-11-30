import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type) => {
    const demoCredentials = {
      admin: {
        identifier: 'admin@example.com',
        password: 'admin123'
      },
      customer: {
        identifier: 'user@example.com',
        password: 'user123'
      }
    };

    setCredentials(demoCredentials[type]);
    try {
      await login(demoCredentials[type]);
      if (type === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="identifier"
                  value={credentials.identifier}
                  onChange={(e) => setCredentials(prev => ({...prev, identifier: e.target.value}))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
            <div className="text-center mt-4">
              <p className="text-muted">Demo Accounts</p>
              <Row className="g-2">
                <Col>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="w-100"
                    onClick={() => handleDemoLogin('admin')}
                  >
                    Try Admin
                  </Button>
                </Col>
                <Col>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    className="w-100"
                    onClick={() => handleDemoLogin('customer')}
                  >
                    Try Customer
                  </Button>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage; 