import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
