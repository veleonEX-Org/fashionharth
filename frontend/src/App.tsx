import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import TrendingPage from "./pages/TrendingPage";
import ItemDetailsPage from "./pages/ItemDetailsPage";
import PricingPage from "./pages/PricingPage";
import { StripeProvider } from "./components/Payment/StripeProvider";
import AdminLoginPage from "./pages/admin/auth/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/auth/AdminRegisterPage";
import AdminProfilePage from "./pages/admin/profile/AdminProfilePage";
import StaffLoginPage from "./pages/staff/auth/StaffLoginPage";
import StaffRegisterPage from "./pages/staff/auth/StaffRegisterPage";
import StaffProfilePage from "./pages/staff/profile/StaffProfilePage";
import UserLoginPage from "./pages/user/auth/UserLoginPage";
import UserRegisterPage from "./pages/user/auth/UserRegisterPage";
import UserProfilePage from "./pages/user/profile/UserProfilePage";
import AdminListItemsPage from "./pages/admin/list/AdminListItemsPage";
import AdminAddItemPage from "./pages/admin/add/AdminAddItemPage";
import AdminViewItemPage from "./pages/admin/view/AdminViewItemPage";
import AdminEditItemPage from "./pages/admin/edit/AdminEditItemPage";
import StaffListItemsPage from "./pages/staff/list/StaffListItemsPage";
import StaffAddItemPage from "./pages/staff/add/StaffAddItemPage";
import StaffViewItemPage from "./pages/staff/view/StaffViewItemPage";
import StaffEditItemPage from "./pages/staff/edit/StaffEditItemPage";
import UserListItemsPage from "./pages/user/list/UserListItemsPage";
import UserAddItemPage from "./pages/user/add/UserAddItemPage";
import UserViewItemPage from "./pages/user/view/UserViewItemPage";
import UserEditItemPage from "./pages/user/edit/UserEditItemPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatPage } from "./pages/ChatPage";
import StyleMePage from "./pages/StyleMePage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import StaffPortalPage from "./pages/staff/StaffPortalPage";

const App: React.FC = () => {
  return (
    <StripeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/style-me" element={<StyleMePage />} />
        {/* Global auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Public pages */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        {/* Generic protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Admin-specific auth & profile */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>

        {/* Staff-specific auth & profile */}
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/staff/register" element={<StaffRegisterPage />} />
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff/profile" element={<StaffProfilePage />} />
        </Route>

        {/* User-specific auth & profile */}
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/user/register" element={<UserRegisterPage />} />
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/profile" element={<UserProfilePage />} />
        </Route>

        {/* Role-specific dashboards */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/items" element={<AdminListItemsPage />} />
          <Route path="/admin/items/new" element={<AdminAddItemPage />} />
          <Route path="/admin/items/:id" element={<AdminViewItemPage />} />
          <Route path="/admin/items/:id/edit" element={<AdminEditItemPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          <Route path="/staff/items" element={<StaffListItemsPage />} />
          <Route path="/staff/items/new" element={<StaffAddItemPage />} />
          <Route path="/staff/items/:id" element={<StaffViewItemPage />} />
          <Route path="/staff/items/:id/edit" element={<StaffEditItemPage />} />
          <Route path="/staff/portal" element={<StaffPortalPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
          <Route path="/user/items" element={<UserListItemsPage />} />
          <Route path="/user/items/new" element={<UserAddItemPage />} />
          <Route path="/user/items/:id" element={<UserViewItemPage />} />
          <Route path="/user/items/:id/edit" element={<UserEditItemPage />} />
        </Route>
        </Routes>
      </Layout>
    </StripeProvider>
  );
};

export default App;
