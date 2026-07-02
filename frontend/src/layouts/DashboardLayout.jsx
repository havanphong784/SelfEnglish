import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background relative overflow-hidden font-sans">
      {/* Ambient background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      
      <div className="flex w-full h-full p-4 gap-4 z-10 relative">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl glass-panel relative">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-transparent">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
