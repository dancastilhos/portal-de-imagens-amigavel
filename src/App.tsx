
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Index from './pages/Index';
import Upload from './pages/Upload';
import Portal from './pages/Portal';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import VMwareAutomator from './pages/VMwareAutomator';
import VDILinuxAutomator from './pages/VDILinuxAutomator';
import HostnameGenerator from './pages/HostnameGenerator';

function App() {
  return (
    <div className="app">
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/portal" element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            } />
            <Route path="/vmware-automator" element={
              <ProtectedRoute>
                <VMwareAutomator />
              </ProtectedRoute>
            } />
            <Route path="/vdi-linux-automator" element={
              <ProtectedRoute>
                <VDILinuxAutomator />
              </ProtectedRoute>
            } />
            <Route path="/hostname-generator" element={
              <ProtectedRoute>
                <HostnameGenerator />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
