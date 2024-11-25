import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useSettings } from '../context/SettingsContext';

const SettingsPage = () => {
  const { darkMode, toggleDarkMode, settings, updateSettings } = useSettings();

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-gear me-2"></i>
        Settings
      </h2>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Appearance</h5>
              
              <Form.Check 
                type="switch"
                id="dark-mode-switch"
                label="Dark Mode"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="mb-3"
              />

              <Form.Check 
                type="switch"
                id="compact-mode-switch"
                label="Compact Mode"
                checked={settings.compactMode}
                onChange={(e) => updateSettings({ compactMode: e.target.checked })}
                className="mb-3"
              />

              <hr className="my-4" />

              <h5 className="mb-4">Preferences</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Select 
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </Form.Select>
              </Form.Group>

              <Form.Check 
                type="switch"
                id="notifications-switch"
                label="Enable Notifications"
                checked={settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
                className="mb-3"
              />
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h5 className="mb-4">Data & Privacy</h5>
              <p className="text-muted mb-4">Manage your data and privacy preferences</p>
              
              <Form.Check 
                type="switch"
                id="analytics-switch"
                label="Share Analytics"
                checked={settings.shareAnalytics}
                onChange={(e) => updateSettings({ shareAnalytics: e.target.checked })}
                className="mb-3"
              />

              <button className="btn btn-outline-danger">
                <i className="bi bi-trash me-2"></i>
                Clear All Data
              </button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">About</h5>
              <p className="text-muted mb-1">Version: 1.0.0</p>
              <p className="text-muted mb-0">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage; 