import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MyList from './pages/MyList'
import Browse from './pages/Browse'
import DramaDetail from './pages/DramaDetail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/home"      element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/my-list"   element={<MyList />} />
          <Route path="/browse"    element={<Browse />} />
          <Route path="/drama/:id" element={<DramaDetail />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
