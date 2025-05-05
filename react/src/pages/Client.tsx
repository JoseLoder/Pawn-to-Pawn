import { useContext, useEffect, useState } from "react";
import { Header } from "../components/semantic/Header"
import { Logout } from "./home/Logout"
import { UserContext } from "../contexts/UserContext";
import { Outlet, useNavigate } from "react-router";
import { Nav } from "../components/semantic/Nav";

export function Client() {
    const navigate = useNavigate();
    const userContextProvider = useContext(UserContext);
    const [isActivated, setIsActivated] = useState(false);

    if (!userContextProvider) {
        throw new Error("UserContext must be used within a UserProvider");
    }
    const { getUserContext } = userContextProvider;

    useEffect(() => {
        const user = getUserContext();
        if (user && user.role === "client") {
            setIsActivated(true);
        } else {
            setIsActivated(false);
            navigate("/login");
        }
    }, []);

    const linksToShow = [
        { to: "create-order", text: "Create Order" },
        { to: "show-order", text: "Show Order" },
        { to: "me", text: "Profile" }
    ];

    return isActivated ? (
        <>
            <button onClick={() => getUserContext()}>context</button>
            <Header title="Hello Client">
                <Nav links={linksToShow} />
                <Logout />
            </Header>
            <Outlet />
        </>
    ) : null;
}