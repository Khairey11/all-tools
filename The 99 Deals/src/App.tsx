import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import About from './pages/About'

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer>
          <div className="container">
            <p>&copy; 2026 The 99 Deals Nepal. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
