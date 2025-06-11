import { Header } from "../components/semantic/Header"
import { Logout } from "./home/Logout"
import { Outlet, useNavigate } from "react-router";
import { Nav } from "../components/semantic/Nav";
import { useEffect } from "react";

export function Admin() {
    const navigate = useNavigate();
    const linksToShow = [
        { to: "show-clients", text: "Show Clients" },
        { to: "show-orders", text: "Show Orders" },
        { to: "machines", text: "Machines Zone"},
        { to: "materials", text: "Materials Zone"},
        { to: "products", text: "Products Zone"},
        { to: "me", text: "Profile" },
        Logout()
    ];
    useEffect(() => {
            navigate("/admin/show-clients");
    }, []);
    return (
        <>
            <Header title="Hello Admin">
                <Nav links={linksToShow} />
            </Header>
            <Outlet />
        </>
    )
}