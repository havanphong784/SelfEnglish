import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./features/home/Dashboard'));
const VocabularyDashboard = lazy(() => import('./features/vocabulary/VocabularyDashboard'));
const StudyController = lazy(() => import('./features/vocabulary/StudyController'));
const PackageDetails = lazy(() => import('./features/vocabulary/PackageDetails'));
const ImportVocabulary = lazy(() => import('./features/vocabulary/ImportVocabulary'));
const Landing = lazy(() => import('./features/auth/Landing'));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
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
              <Route path="listening" element={<div className="p-4">Luyen nghe</div>} />
              <Route path="speaking" element={<div className="p-4">Luyen noi</div>} />
              <Route path="exams" element={<div className="p-4">Luyen de</div>} />
              <Route path="statistics" element={<div className="p-4">Thong ke</div>} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
