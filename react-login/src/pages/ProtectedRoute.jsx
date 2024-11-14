const ProtectedRoute = ({ children }) => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (!username || !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
