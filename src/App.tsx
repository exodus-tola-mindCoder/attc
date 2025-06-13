import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useToast } from './hooks/useToast';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentProfile from './components/students/StudentProfile';

import ToastContainer from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { toasts, removeToast } = useToast();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading University Management System...</p>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {isLoginMode ? (
          <Login onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <Register onToggleMode={() => setIsLoginMode(true)} />
        )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? <AdminDashboard /> : <StudentProfile />;
      case 'students':
        return <StudentList />;
      case 'courses':
        return <CourseManagement />;
      case 'instructors':
        return <InstructorManagement />;
      case 'health':
        return <HealthDashboard />;
      case 'leave':
        return <LeaveManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'cafeteria':
        return <CafeteriaManagement />;
      case 'meal-feedback':
        return <MealFeedbackForm />;
      case 'graduation-gallery':
        return <GraduationGallery />;
      case 'documents':
        return <DocumentCenter />;
      case 'transcripts':
        return <TranscriptRequest />;
      case 'course-registration':
        return <CourseRegistration />;
      case 'semester-management':
        return <SemesterManagement />;
      case 'messages':
        return <MessageCenter />;
      case 'profile':
        return <StudentProfile />;
      default:
        return user.role === 'admin' ? <AdminDashboard /> : <StudentProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;