import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = Cookies.get("authToken");

  if (!token) {
    // المستخدم مش عامل لوجن
    return <Navigate to="/user-login" replace />;
  }

  // المستخدم داخل فعلاً
  return <>{children}</>;
};

export default ProtectedRoute;
