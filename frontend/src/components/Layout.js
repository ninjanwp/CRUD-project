import { useSettings } from '../context/SettingsContext';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { darkMode } = useSettings();
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith('/admin');

  return (
    <div className={`${darkMode ? 'dark-mode' : ''} min-vh-100`}>
      <div className={`content-wrapper ${isAdminSection ? 'admin-content' : 'store-content'}`}>
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 