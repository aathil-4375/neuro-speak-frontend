// frontend/src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import PatientUser from './pages/PatientUser';
import GraphTab from './pages/GraphTab';
import ChapterPage from './pages/ChapterPage';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path='/' element={<LogIn />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/home' element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path='/home/patient' element={
              <PrivateRoute>
                <PatientUser />
              </PrivateRoute>
            } />
            <Route path="/graph-tab" element={
              <PrivateRoute>
                <GraphTab />
              </PrivateRoute>
            } />
            <Route path="/home/patient/:chapterId" element={
              <PrivateRoute>
                <ChapterPage />
              </PrivateRoute>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;