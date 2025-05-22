import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Form from "./components/Form";
import AdminDashboard from "./components/AdminDashboard";
import AdminQuestionDetail from "./components/AdminQuestionDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/detail/:id" element={<AdminQuestionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
