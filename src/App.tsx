import './App.css';
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

// ✅ Authentication Pages
import UserLogin from './mycomponents/user/authentication/UserLogin';
import UserRegister from './mycomponents/user/authentication/UserRegister';
import UserResetPassword from './mycomponents/user/authentication/UserResetPassword';
import UserForgetPassword from './mycomponents/user/authentication/UserForgetPassword';
import UserVerification from './mycomponents/user/authentication/UserVerification';
import UserAuthLayout from './mycomponents/user/shared/UserAuthLayout';
import NotFound from './mycomponents/user/shared/NotFound';

// ✅ Dashboard Pages
import DashboardLayout from "./mycomponents/dashboard/layout/DashboardLayout";
import DashboardHome from './mycomponents/dashboard/pages/DashboardHome';
import Products from './mycomponents/dashboard/pages/Products';
import Users from './mycomponents/dashboard/pages/Users';
import Bills from './mycomponents/user/pages/Bills/Bills';
import NewProduct from './mycomponents/product/page/NewProduct ';

function App() {
  const routes = createHashRouter([
    // 🔹 Public (Auth) Routes
    {
      path: "/",
      element: <UserAuthLayout />,
      errorElement: <NotFound />,
      children: [
        { path: "", element: <UserLogin /> },
        { path: "user-login", element: <UserLogin /> },
        { path: "user-register", element: <UserRegister /> },
        { path: "user-reset-password", element: <UserResetPassword /> },
        { path: "user-forget-password", element: <UserForgetPassword /> },
        { path: "user-verification", element: <UserVerification /> },
      ],
    },

    // 🔹 Protected (Dashboard) Routes
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        { path: "", element: <DashboardHome /> }, // 👈 دي الصفحة الافتراضية
        { path: "products", element: <Products /> },
        { path: "add-product", element: <NewProduct /> }, // الرابط الجديد
        { path: "users", element: <Users /> },
        { path: "bills", element: <Bills /> },
      ],
    },

    // 🔹 Catch All (404)
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
      <ToastContainer position="top-right" />
    </>
  );
}

export default App;
