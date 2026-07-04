import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden font-sans pb-[72px] md:pb-0">
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-6 pb-6 md:pb-10" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
