import { Spinner as BootstrapSpinner } from "react-bootstrap";

const Spinner = () => {
  return (
    <BootstrapSpinner animation="border" role="status" className="text-primary" style={{ width: '3rem', height: '3rem', borderWidth: '0.5rem' }}>
      <span className="visually-hidden">Loading...</span>
    </BootstrapSpinner>
  );
};

export default Spinner;