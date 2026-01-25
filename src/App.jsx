import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyTwoFactor } from './pages/VerifyTwoFactor';
import { SetupTwoFactor } from './pages/SetupTwoFactor';
import { Dashboard } from './pages/Dashboard';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectsNew } from './pages/ProjectsNew';
import { ProjectManagement } from './pages/ProjectManagement';
import { TasksPage } from './pages/Tasks';
import { TaskCreate } from './pages/TaskCreate';
import { TaskDetail } from './pages/TaskDetail';
import { MyTasks } from './pages/MyTasks';
import { TaskSubmission } from './pages/TaskSubmission';
import { ReviewsPage } from './pages/Reviews';
import { InviteUserPage } from './pages/InviteUser';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { UsersPage } from './pages/Users';
import { OrganizationsPage } from './pages/Organizations';
import { OrganizationDetail } from './pages/OrganizationDetail';
import { MemberManagement } from './pages/MemberManagement';
import { MemberDetail } from './pages/MemberDetail';
import { NotificationsPage } from './pages/Notifications';
import { SubscriptionsPage } from './pages/Subscriptions';
import { NotFound } from './pages/NotFound';
import { MilestonesPage } from './pages/MilestonesPage';
import { ContractorsPage } from './pages/ContractorsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { Guide } from './pages/Guide';

import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrganizationProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-2fa" element={<VerifyTwoFactor />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <Profile />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/2fa"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <SetupTwoFactor />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <UsersPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <ProjectsList />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <ProjectsNew />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <ProjectManagement />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <TasksPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks/new"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <TaskCreate />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tasks"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <MyTasks />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks/:taskId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <TaskDetail />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks/:taskId/submit"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <TaskSubmission />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <ReviewsPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/invite"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <InviteUserPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizations"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <OrganizationsPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizations/new"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <OrganizationsPage openForm={true} />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizations/:organizationId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <OrganizationDetail />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <MemberManagement />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members/:memberId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <MemberDetail />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <NotificationsPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <SubscriptionsPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Milestones */}
                <Route
                  path="/projects/:projectId/milestones"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <MilestonesPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                {/* Contractors */}
                <Route
                  path="/projects/:projectId/contractors"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <ContractorsPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                {/* Departments */}
                <Route
                  path="/projects/:projectId/departments"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <DepartmentsPage />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Guide */}
                <Route
                  path="/guide"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardLayout>
                          <Guide />
                        </DashboardLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SubscriptionProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
