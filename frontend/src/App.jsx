import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Panel } from './components/ui/Primitives';

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./features/home/Dashboard'));
const VocabularyDashboard = lazy(() => import('./features/vocabulary/VocabularyDashboard'));
const StudyController = lazy(() => import('./features/vocabulary/StudyController'));
const PackageDetails = lazy(() => import('./features/vocabulary/PackageDetails'));
const ImportVocabulary = lazy(() => import('./features/vocabulary/ImportVocabulary'));
const Landing = lazy(() => import('./features/auth/Landing'));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-storybook-green border-t-primary" />
  </div>
);

const ComingSoon = ({ title }) => (
  <div className="se-shell pt-4  py-4">
    <Panel className="text-center">
      <div className="se-eyebrow mb-4">Đang hoàn thiện</div>
      <h1 className="se-page-title">{title}</h1>
      <p className="se-body mx-auto mt-3 max-w-xl text-sm">
        Tính năng này sắp có mặt. Tụi mình đang làm cho trải nghiệm học mượt hơn, dùng là vào guồng ngay.
      </p>
    </Panel>
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
              <Route path="listening" element={<ComingSoon title="Luyện nghe" />} />
              <Route path="speaking" element={<ComingSoon title="Luyện nói" />} />
              <Route path="exams" element={<ComingSoon title="Luyện đề" />} />
              <Route path="statistics" element={<ComingSoon title="Thống kê" />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
