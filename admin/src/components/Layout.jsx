import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', backgroundColor: '#f5f5f5', padding: 32 }}>
      <Outlet />
    </main>
  </div>
);

export default Layout;
