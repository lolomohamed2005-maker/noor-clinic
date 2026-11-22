import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RootLayout } from './components/layout/RootLayout'
import { Home } from './pages/Home'
import { Doctors } from './pages/Doctors'
import { DoctorDetail } from './pages/DoctorDetail'
import { Book } from './pages/Book'
import { Admin } from './pages/Admin'
import { AdminLogin } from './pages/AdminLogin'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="doctors/:department" element={<Doctors />} />
            <Route path="doctor/:slug" element={<DoctorDetail />} />
            <Route path="book" element={<Book />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
