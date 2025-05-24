import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

import Form from "./components/Form";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import AdminQuestionDetail from "./components/AdminQuestionDetail";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Form />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/dashboard/detail/:id"
            element={<AdminQuestionDetail />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
