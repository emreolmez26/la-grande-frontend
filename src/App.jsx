import { BrowserRouter, Routes, Route } from 'react-router-dom';


import CustomerLogin from './components/CustomerLogin';
import Menu from './components/Menu';

function App() {
  return (
    // 2. Oyuncuyu ana ekrana (sahneye) yerleştiriyoruz
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerLogin />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
