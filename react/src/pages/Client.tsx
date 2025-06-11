import { Header } from "../components/semantic/Header"
import { Logout } from "./home/Logout"
import { Outlet, useNavigate } from "react-router";
import { Nav } from "../components/semantic/Nav";
import { useEffect } from "react";

export function Client() {
    const navigate = useNavigate();
    const linksToShow = [
        { to: "create-order", text: "Create Order" },
        { to: "show-orders", text: "Show Order" },
        { to: "me", text: "Profile" },
        Logout()
    ];
    useEffect(() => {
        navigate("/client/create-order");
}, []);
    return (
        <>
            <Header title="Hello Client">
                <Nav links={linksToShow} />
            </Header>
            <Outlet />
        </>
    );
}