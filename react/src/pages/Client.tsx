import { Header } from "../components/semantic/Header"
import { Logout } from "./home/Logout"
import { Outlet } from "react-router";
import { Nav } from "../components/semantic/Nav";

export function Client() {


    const linksToShow = [
        { to: "create-order", text: "Create Order" },
        { to: "show-orders", text: "Show Order" },
        { to: "me", text: "Profile" }
    ];

    return (
        <>
            <Header title="Hello Client">
                <Nav links={linksToShow} />
                <Logout />
            </Header>
            <Outlet />
        </>
    );
}