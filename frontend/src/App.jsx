import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './features/home/Dashboard';
import Vocabulary from './features/vocabulary/Vocabulary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="listening" element={<div className="p-4">Luyện nghe</div>} />
          <Route path="speaking" element={<div className="p-4">Luyện nói</div>} />
          <Route path="exams" element={<div className="p-4">Luyện đề</div>} />
          <Route path="statistics" element={<div className="p-4">Thống kê</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
