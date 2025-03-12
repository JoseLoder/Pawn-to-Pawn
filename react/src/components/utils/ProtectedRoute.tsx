import { Outlet, Navigate } from "react-router";

export const ProtectedRoute = ({
    canActivate,
    redirectTo
}: {
    canActivate: boolean;
    redirectTo: string;
}) => {
    const renderOutlet = () => <Outlet />;
    const renderNavigate = () => <Navigate to={redirectTo} />;

    return canActivate ? renderOutlet() : renderNavigate();
}