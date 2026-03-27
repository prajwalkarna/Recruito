import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./context/AppContext";
import { useAuth } from "./context/useAuth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import JobSearchPage from "./pages/JobSearchPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import EmployerAnalyticsPage from "./pages/employer/EmployerAnalyticsPage";
import FreelancerAnalyticsPage from "./pages/freelancer/FreelancerAnalyticsPage";
// Pranjal — Job Management
import MyJobsPage from "./pages/employer/MyJobsPage";
import CreateJobPage from "./pages/employer/CreateJobPage";
import EditJobPage from "./pages/employer/EditJobPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import FreelancerDashboardPage from "./pages/freelancer/FreelancerDashboardPage";
import SavedJobsPage from "./pages/freelancer/SavedJobsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
// Ronit — CV Builder
import MyCVsPage from "./pages/freelancer/MyCVsPage";
import CreateCVPage from "./pages/freelancer/CreateCVPage";
import EditCVPage from "./pages/freelancer/EditCVPage";
import CVPreviewPage from "./pages/freelancer/CVPreviewPage";
import EmployerDashboardPage from "./pages/employer/EmployerDashboardPage";
import MyPortfolioPage from "./pages/freelancer/MyPortfolioPage";
import CreatePortfolioPage from "./pages/freelancer/CreatePortfolioPage";
import SettingsPage from "./pages/SettingsPage";
// Susmita - Applications
import MyApplicationsPage from "./pages/freelancer/MyApplicationsPage";
import ApplicantsPage from "./pages/employer/ApplicantsPage";
import ApplicantDetailsPage from "./pages/employer/ApplicantDetailsPage";
import EmailPreferencesPage from "./pages/EmailPreferencesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailsPage from "./pages/admin/AdminUserDetailsPage";
import AdminJobsPage from "./pages/admin/AdminJobsPage";
import AdminJobDetailsPage from "./pages/admin/AdminJobDetailsPage";
import ThemeCustomizer from "./components/ThemeCustomizer";
import Navbar from "./components/layout/Navbar";
import ResetPasswordPage from "./pages/ResetPasswordPage";


function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/" />;
}


function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return token ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <ThemeCustomizer />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobSearchPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          {/* Auth */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          {/* Prajwal — Profile Settings */}
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <ProfileSettingsPage />
              </PrivateRoute>
            }
          />
          {/* Prajwal — Messages */}
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagesPage />
              </PrivateRoute>
            }
          />
          {/* Prajwal — Notifications */}
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          {/* Prajwal — Freelancer Analytics */}
          <Route
            path="/freelancer/analytics"
            element={
              <PrivateRoute>
                <FreelancerAnalyticsPage />
              </PrivateRoute>
            }
          />
          {/* Prajwal — Employer Analytics */}
          <Route
            path="/employer/analytics"
            element={
              <PrivateRoute>
                <EmployerAnalyticsPage />
              </PrivateRoute>
            }
          />
          {/* Pranjal — Employer Job Management */}
          <Route
            path="/employer/my-jobs"
            element={
              <PrivateRoute>
                <MyJobsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employer/create-job"
            element={
              <PrivateRoute>
                <CreateJobPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/employer/edit-job/:id"
            element={
              <PrivateRoute>
                <EditJobPage />
              </PrivateRoute>
            }
          />
          {/* pranjal — Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          {/* pranjal — Profile Edit */}
          <Route
            path="/profile/edit"
            element={
              <PrivateRoute>
                <ProfileEditPage />
              </PrivateRoute>
            }
          />
          {/* Pranjal — Freelancer Dashboard */}
          <Route
            path="/freelancer/dashboard"
            element={
              <PrivateRoute>
                <FreelancerDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/saved-jobs"
            element={
              <PrivateRoute>
                <SavedJobsPage />
              </PrivateRoute>
            }
          />
          {/* Pranjal - Admin - Categories Management */}
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute>
                <CategoriesPage />
              </PrivateRoute>
            }
          />
          {/* Ronit — CV Builder */}
          <Route
            path="/freelancer/my-cvs"
            element={
              <PrivateRoute>
                <MyCVsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/create-cv"
            element={
              <PrivateRoute>
                <CreateCVPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/edit-cv/:id"
            element={
              <PrivateRoute>
                <EditCVPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/cv/:id/preview"
            element={
              <PrivateRoute>
                <CVPreviewPage />
              </PrivateRoute>
            }
          />
          {/* Ronit - Employerdashboard */}
          <Route
            path="/employer/dashboard"
            element={
              <PrivateRoute>
                <EmployerDashboardPage />
              </PrivateRoute>
            }
          />
          {/*Ronit - CreatePortfolio */}
          <Route
            path="/freelancer/create-portfolio"
            element={
              <PrivateRoute>
                <CreatePortfolioPage />
              </PrivateRoute>
            }
          />
          {/* Ronit - MyPortfolio */}
          <Route
            path="/freelancer/my-portfolio"
            element={
              <PrivateRoute>
                <MyPortfolioPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/freelancer/create-portfolio"
            element={
              <PrivateRoute>
                <CreatePortfolioPage />
              </PrivateRoute>
            }
          />
          {/* Ronit — Settings */}
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          {/* Susmita — Applications */}
          <Route
            path="/freelancer/my-applications"
            element={
              <PrivateRoute>
                <MyApplicationsPage />
              </PrivateRoute>
            }
          />

          {/* Susmita - Applicants*/}
          <Route
            path="/employer/job/:jobId/applicants"
            element={
              <PrivateRoute>
                <ApplicantsPage />
              </PrivateRoute>
            }
          />
          {/* Susmita - ApplicantsDetails*/}
          <Route
            path="/employer/applicant/:applicationId"
            element={
              <PrivateRoute>
                <ApplicantDetailsPage />
              </PrivateRoute>
            }
          />
          {/* Susmita — Email Preferences */}
          <Route
            path="/email-preferences"
            element={
              <PrivateRoute>
                <EmailPreferencesPage />
              </PrivateRoute>
            }
          />
          {/* Susmita - Admin - Users */}
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <AdminUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <PrivateRoute>
                <AdminUserDetailsPage />
              </PrivateRoute>
            }
          />
          {/* Susmita - Admin - Jobs */}
          <Route
            path="/admin/jobs"
            element={
              <PrivateRoute>
                <AdminJobsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/jobs/:id"
            element={
              <PrivateRoute>
                <AdminJobDetailsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
