
import './App.css'
import { createHashRouter, RouterProvider } from "react-router-dom";
import UserLogin from './mycomponents/user/authentication/UserLogin';
import UserRegister from './mycomponents/user/authentication/UserRegister';
import UserResetPassword from './mycomponents/user/authentication/UserResetPassword';
import UserForgetPassword from './mycomponents/user/authentication/UserForgetPassword';
import NotFound from './mycomponents/user/shared/NotFound';
import UserAuthLayout from './mycomponents/user/shared/UserAuthLayout';
import { ToastContainer } from 'react-toastify';
import UserVerification from './mycomponents/user/authentication/UserVerification';
import Bills from './mycomponents/user/pages/Bills/Bills';

function App() {
  // const routes = createBrowserRouter([
    const routes = createHashRouter([

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
        { path: "bill", element: <Bills /> },


      ],
    },
  
  ]);

  return (
    <>
      <RouterProvider router={routes} />
              <ToastContainer position="top-right" />

    </>
  );
}

export default App
