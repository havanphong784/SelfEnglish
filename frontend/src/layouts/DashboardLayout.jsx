import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-[76px] font-sans md:flex-row md:pb-0">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden px-4 pb-8 md:px-8 md:pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
