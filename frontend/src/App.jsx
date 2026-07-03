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
  <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-muted-foreground">
    <div className="w-full max-w-sm space-y-4 rounded-xl surface-panel p-6">
      <div className="h-3 w-24 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-shimmer bg-primary/40" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full bg-muted" />
        <div className="h-4 w-3/4 rounded-full bg-muted" />
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ children }) => (
  <div className="surface-panel mt-4 rounded-xl p-6 text-sm font-medium text-foreground">
    {children}
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
              <Route path="listening" element={<PlaceholderPage>Luyện nghe</PlaceholderPage>} />
              <Route path="speaking" element={<PlaceholderPage>Luyện nói</PlaceholderPage>} />
              <Route path="exams" element={<PlaceholderPage>Luyện đề</PlaceholderPage>} />
              <Route path="statistics" element={<PlaceholderPage>Thống kê</PlaceholderPage>} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
