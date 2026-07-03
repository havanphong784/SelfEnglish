import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './features/home/Dashboard';
import VocabularyDashboard from './features/vocabulary/VocabularyDashboard';
import StudyController from './features/vocabulary/StudyController';
import MultipleChoiceStudy from './features/vocabulary/MultipleChoiceStudy';
import TypingStudy from './features/vocabulary/TypingStudy';
import PackageDetails from './features/vocabulary/PackageDetails';
import ImportVocabulary from './features/vocabulary/ImportVocabulary';
import Landing from './features/auth/Landing';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="vocabulary">
              <Route index element={<VocabularyDashboard />} />
              <Route path="study" element={<StudyController />} />
              <Route path="import" element={<ImportVocabulary />} />
              <Route path="packages/:packageId" element={<PackageDetails />} />
            </Route>
            <Route path="listening" element={<div className="p-4">Luyện nghe</div>} />
            <Route path="speaking" element={<div className="p-4">Luyện nói</div>} />
            <Route path="exams" element={<div className="p-4">Luyện đề</div>} />
            <Route path="statistics" element={<div className="p-4">Thống kê</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
