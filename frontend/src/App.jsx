import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Landing page
import LandingPage from './pages/LandingPage'

// Auth pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Route guards
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/Courses'
import StudentSessions from './pages/student/Sessions'
import StudentAssignments from './pages/student/Assignments'
import AssignmentAttempt from './pages/student/AssignmentAttempt'
import AssignmentResults from './pages/student/AssignmentResults'
import StudentProgress from './pages/student/Progress'
import StudentCertificates from './pages/student/Certificates'

// Faculty pages
import FacultyDashboard from './pages/faculty/Dashboard'
import FacultySessions from './pages/faculty/Sessions'
import FacultySessionCreate from './pages/faculty/SessionCreate'
import FacultyAssignmentCreate from './pages/faculty/AssignmentCreate'
import FacultySubmissions from './pages/faculty/Submissions'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCourses from './pages/admin/Courses'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page - public */}
        <Route path="/" element={<LandingPage />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/assignments/:id" element={<AssignmentAttempt />} />
            <Route path="/student/assignments/:id/results" element={<AssignmentResults />} />
            <Route path="/student/progress" element={<StudentProgress />} />
            <Route path="/student/certificates" element={<StudentCertificates />} />
          </Route>

          {/* Faculty routes */}
          <Route element={<RoleRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/sessions" element={<FacultySessions />} />
            <Route path="/faculty/sessions/create" element={<FacultySessionCreate />} />
            <Route path="/faculty/assignments/create" element={<FacultyAssignmentCreate />} />
            <Route path="/faculty/assignments/:id/submissions" element={<FacultySubmissions />} />
          </Route>

          {/* Admin routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function RootRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/login" replace />
}
