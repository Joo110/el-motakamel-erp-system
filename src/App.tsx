import './App.css'; 
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./ProtectedRoute";

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
import Shipping from './mycomponents/inventory/page/Shipping';

import UpdateTransferComponent from './mycomponents/inventory/page/UpdateTransferComponent';
import TransferManagement from './mycomponents/inventory/page/TransferManagement';
import InventoryOrders from './mycomponents/Sales/page/InventoryOrders';
import PreciousManagement from './mycomponents/Precious/page/PreciousManagement';
import EditPurchaseOrderComponent from './mycomponents/Precious/page/EditPurchaseOrderComponent';
import EditSaleOrderComponent from './mycomponents/Sales/page/EditSaleOrderComponent';

import EmployeeList from './mycomponents/HR/page/EmployeeListScreen';
import AddEmployeeScreen from './mycomponents/HR/page/AddEmployeeScreen';
import EditEmployeeScreen from './mycomponents/HR/page/EditEmployeeScreen';
import EmployeeView from './mycomponents/HR/page/ViewEmployeeScreen';
import PayrollManagement from './mycomponents/HR/page/PayrollScreen';
import Attendance from './mycomponents/HR/page/AttendanceScreen';

//  Sales Management Pages (Customer)
import CustomerSearchList from './mycomponents/Sales/page/CustomerSearchList';
import CustomerDetails from './mycomponents/Sales/page/CustomerDetails';
import CustomerEditFilled from './mycomponents/Sales/page/CustomerEditFilled';
import CustomerAdd from './mycomponents/Sales/page/CustomerAdd';

//  Precious Management Pages (Supplier)
import SupplierSearchList from './mycomponents/Precious/page/SupplierSearchList';
import SupplierDetails from './mycomponents/Precious/page/SupplierDetails';
import SupplierEditFilled from './mycomponents/Precious/page/SupplierEditFilled';
import SupplierAdd from './mycomponents/Precious/page/SupplierAdd';


function App() {
  const routes = createHashRouter([
    //  Public (Auth) Routes
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

    //  Protected (Dashboard) Routes
    {
      path: "/dashboard",
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
      children: [
        { path: "", element: <DashboardHome /> },
        { path: "products", element: <ProductsManagement /> },
        { path: "add-product", element: <NewProduct /> },
        { path: "products/edit/:id", element: <EditProductForm /> },
        { path: "products/view/:id", element: <ViewProduct /> },
        { path: "users", element: <Users /> },
        { path: "bills", element: <Bills /> },

        //  Inventory Routes
        { path: "inventories", element: <Inventories /> },
        { path: "add-inventory", element: <AddInventory /> },
        { path: "stock-search", element: <StockSearch /> },
        { path: "inventory-details/:id", element: <InventoryDetails /> },
        { path: "edit-inventory/:id", element: <EditInventory /> },

        //  Old Inventory Routes
        { path: "stock-in", element: <StockIn /> },
        { path: "stock-in-draft/:id", element: <StockInDraft /> },
        { path: "stock-out", element: <StockOut /> },
        { path: "stock-out-draft/:id", element: <StockOutDraft /> },
        { path: "transfer", element: <Transfer /> },
        { path: "transfer-draft/:id", element: <TransferDraft /> },
        { path: "Shipping/:id", element: <Shipping /> },

        // Old Management Routes
        { path: "UpdateTransferComponent/:id", element: <UpdateTransferComponent /> },
        { path: "transfermanagement", element: <TransferManagement /> },
        { path: "inventoryorders", element: <InventoryOrders /> },
        { path: "preciousmanagement", element: <PreciousManagement /> },
        { path: "EditPurchaseOrderComponent/:id", element: <EditPurchaseOrderComponent /> },
        { path: "EditSaleOrderComponent/:id", element: <EditSaleOrderComponent /> },

        // Sales Management Routes (Customer)
        { path: "sales/customers", element: <CustomerSearchList /> },
        { path: "sales/customer/:id", element: <CustomerDetails /> },
        { path: "sales/customer/edit/:id", element: <CustomerEditFilled /> },
        { path: "sales/customer/new", element: <CustomerAdd /> },

        //  Precious Management Routes (Supplier)
        { path: "precious/suppliers", element: <SupplierSearchList /> },
        { path: "precious/supplier/:id", element: <SupplierDetails /> },
        { path: "precious/supplier/edit/:id", element: <SupplierEditFilled /> },
        { path: "precious/supplier/new", element: <SupplierAdd /> },

        // 🆕 HR Management Routes
    { path: "hr/employees", element: <EmployeeList /> },
    { path: "hr/employee/new", element: <AddEmployeeScreen /> },
    { path: "hr/employee/edit/:id", element: <EditEmployeeScreen /> },
    { path: "hr/employee/view/:id", element: <EmployeeView /> },
    { path: "hr/payroll", element: <PayrollManagement /> },
    { path: "hr/Attendance", element: <Attendance /> },
      ],
    },
    //  Catch-all
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;