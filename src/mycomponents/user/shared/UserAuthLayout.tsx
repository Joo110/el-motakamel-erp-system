import { Outlet, useLocation } from "react-router-dom";
import Authphoto from "../../../assets/authphoto.png"; 

const UserAuthLayout = () => {
  const location = useLocation();
const getTitle = () => {
  if (location.pathname.includes("user-register")) {
    return "Smart solutions for best management decisions";
  } else if (location.pathname.includes("user-login")) {
    return "Manage finances, inventory, and sales";
  } else if (location.pathname.includes("user-reset-password")) {
    return "Compliant solutions for faster e-invoicing";
  } else if (location.pathname.includes("user-forget-password")) {
    return "Data-driven solutions for accounting control";
  } else {
    return "Integrated solutions to streamline sales operations";
  }
};


  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-xl p-8 ">
          <Outlet />
        </div>
      </div>

      <div
        className="hidden md:flex w-1/2 relative items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${Authphoto})`, 
        }}
      >
         <div className="absolute inset-0  flex flex-col justify-end items-center pb-10">
          <h2 className="text-white text-[23px] md:text-4xl font-semibold text-center px-4">
              {getTitle()}
           </h2>
        </div>
      </div>
    </div>
  );
};

export default UserAuthLayout;
