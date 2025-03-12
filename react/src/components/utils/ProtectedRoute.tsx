import { Outlet } from "react-router";
interface ProtectedRouteProps {

    isActivated: boolean;
  
  }

  export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isActivated }) => {

    return isActivated ?? <Outlet />

}