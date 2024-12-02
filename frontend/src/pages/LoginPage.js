import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    console.log('Login attempt starting...');

    try {
      await login({
        email: credentials.identifier,
        password: credentials.password
      });
      console.log('Login successful');
      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
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
            <div className="text-center mt-3">
              <p className="mb-0">
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage; 