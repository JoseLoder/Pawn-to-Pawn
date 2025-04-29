import { useContext, useEffect, useState } from "react";
import { Header } from "../components/semantic/Header"
import { Logout } from "./home/Logout"
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router";

export function Admin() {
    const navigate = useNavigate();
    const [isActivated, setIsActivated] = useState(false);
    const userContextProvider = useContext(UserContext);
    if (!userContextProvider) {
        throw new Error("UserContext must be used within a UserProvider");
    }
    const { getUserContext } = userContextProvider;

    useEffect(() => {
        const user = getUserContext();
        if (user && user.role === "admin") {

            setIsActivated(true);
        } else {
            setIsActivated(false);
            navigate("/login");
        }
    }, []);


    return isActivated ?
        (<>
            <Header title="Hello Admin" />
            <Logout />
        </>) : null;
}