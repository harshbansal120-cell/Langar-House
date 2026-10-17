import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Impact from './pages/Impact'
import Gallery from './pages/Gallery'

// The dashboard (and Recharts) only loads for signed-in staff.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const VisitorTracking = lazy(() => import('./pages/VisitorTracking'))
const FoodPrepared = lazy(() => import('./pages/FoodPrepared'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Reports = lazy(() => import('./pages/Reports'))

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="size-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">This page isn't on the menu</h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">The link may be old, or the page may have moved.</p>
      <Link to="/" className="mt-6 font-medium text-brand-700 hover:underline dark:text-brand-400">Back to home</Link>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="impact" element={<Impact />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="visitors" element={<VisitorTracking />} />
          <Route path="food-prepared" element={<FoodPrepared />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
