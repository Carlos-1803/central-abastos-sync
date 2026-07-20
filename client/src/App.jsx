import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import Trucks from './pages/Trucks';
import Clients from './pages/Clients';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/trucks" element={<Trucks />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;