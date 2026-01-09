import React from "react";
import LoginPage from "../../LoginPage";

// Admin-specific wrapper around the shared login page.
// Use this route when you want an explicit admin entrypoint, e.g. /admin/login.
const AdminLoginPage: React.FC = () => {
  return <LoginPage />;
};

export default AdminLoginPage;






