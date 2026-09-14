import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ExperimentPage from './pages/ExperimentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practical/:id" element={<ExperimentPage />} />
          <Route path="/postlab/:id" element={<ExperimentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
