import React from "react";
import RegisterPage from "../../RegisterPage";

// Admin-specific wrapper around the shared registration page.
// Handy if you later add admin-only invite/creation flows.
const AdminRegisterPage: React.FC = () => {
  return <RegisterPage />;
};

export default AdminRegisterPage;






