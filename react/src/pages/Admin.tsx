import { Header } from "../components/semantic/Header"
import { Logout } from "./home/Logout"
import { Outlet } from "react-router";
import { Nav } from "../components/semantic/Nav";

export function Admin() {
    const linksToShow = [
        { to: "show-clients", text: "Show Clients" },
        { to: "machines", text: "Machines Zone"},
        { to: "materials", text: "Materials Zone"},
        { to: "me", text: "Profile" }
    ];

    return (
        <>
            <Header title="Hello Admin">
                <Nav links={linksToShow} />
                <Logout />
            </Header>
            <Outlet />
        </>
    )
}