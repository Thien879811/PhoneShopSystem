import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import InventoryPage from './inventory/pages/InventoryPage';

function App() {
  return (
    <PrimeReactProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
