import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  const location = useLocation();
  const isStudyRoute = location.pathname.includes('/study');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background pb-[78px] font-sans md:flex-row md:pb-0">
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {!isStudyRoute && <Header />}
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6 md:px-6 md:pb-10" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
