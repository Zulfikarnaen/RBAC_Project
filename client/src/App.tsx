import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm"; // Diarahkan ke folder components/auth
import UserPage from "./pages/user/UserPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserPage />} />
          <Route path="/user" element={<UserPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;