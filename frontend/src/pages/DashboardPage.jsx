import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === "employer") {
        navigate("/employer/dashboard", { replace: true });
      } else if (user.role === "freelancer") {
        navigate("/freelancer/dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/jobs", { replace: true });
      }
    }
  }, [user, navigate]);

  return <div className="loading">Redirecting...</div>;
}
