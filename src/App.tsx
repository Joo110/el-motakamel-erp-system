import './App.css'; 
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

// Authentication Pages
import UserLogin from './mycomponents/user/authentication/UserLogin';
import UserRegister from './mycomponents/user/authentication/UserRegister';
import UserResetPassword from './mycomponents/user/authentication/UserResetPassword';
import UserForgetPassword from './mycomponents/user/authentication/UserForgetPassword';
import UserVerification from './mycomponents/user/authentication/UserVerification';
import UserAuthLayout from './mycomponents/user/shared/UserAuthLayout';
import NotFound from './mycomponents/user/shared/NotFound';

// Dashboard Pages
import DashboardLayout from "./mycomponents/dashboard/layout/DashboardLayout";
import DashboardHome from './mycomponents/dashboard/pages/DashboardHome';
import Users from './mycomponents/dashboard/pages/Users';
import Bills from './mycomponents/user/pages/Bills/Bills';
import NewProduct from './mycomponents/product/page/NewProduct ';
import ProductsManagement from './mycomponents/product/page/ProductsManagement';
import EditProductForm from './mycomponents/product/page/EditProductForm';
import ViewProduct from './mycomponents/product/page/ViewProduct';

// Inventory Pages
import Inventories from './mycomponents/inventory/page/InventoriesListView';
import AddInventory from './mycomponents/inventory/page/AddInventoryForm';
import StockSearch from './mycomponents/inventory/page/StockSearchView';
import InventoryDetails from './mycomponents/inventory/page/InventoryDetailsView';
import EditInventory from "@/mycomponents/inventory/page/EditInventory";

// New Inventory Components
import StockIn from './mycomponents/inventory/page/StockInComponent';
import StockInDraft from './mycomponents/inventory/page/StockInDraftComponent';
import StockOut from './mycomponents/inventory/page/StockOutComponent';
import StockOutDraft from './mycomponents/inventory/page/StockOutDraftComponent';
import Transfer from './mycomponents/inventory/page/TransferComponent';
import TransferDraft from './mycomponents/inventory/page/TransferDraftComponent';

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
        { path: "", element: <DashboardHome /> },
        { path: "products", element: <ProductsManagement /> },
        { path: "add-product", element: <NewProduct /> },
        { path: "products/edit/:id", element: <EditProductForm /> },
        { path: "products/view/:id", element: <ViewProduct /> },
        { path: "users", element: <Users /> },
        { path: "bills", element: <Bills /> },

        // 🔹 Inventory Routes
        { path: "inventories", element: <Inventories /> },
        { path: "add-inventory", element: <AddInventory /> },
        { path: "stock-search", element: <StockSearch /> },
        { path: "inventory-details/:id", element: <InventoryDetails /> },
         { path: "edit-inventory/:id", element: <EditInventory /> },

        // 🔹 New Inventory Routes
        { path: "stock-in", element: <StockIn /> },
        { path: "stock-in-draft", element: <StockInDraft /> },
        { path: "stock-out", element: <StockOut /> },
        { path: "stock-out-draft", element: <StockOutDraft /> },
        { path: "transfer", element: <Transfer /> },
        { path: "transfer-draft", element: <TransferDraft /> },
      ],
    },

    // 🔹 Catch-all
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
