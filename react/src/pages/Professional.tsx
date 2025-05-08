import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { Logout } from "./home/Logout";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { Outlet, useNavigate } from "react-router";

export function Professional() {
  const navigate = useNavigate();
  const userContextProvider = useContext(UserContext);
  const [isActivated, setIsActivated] = useState(false);

  if (!userContextProvider) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { getUserContext } = userContextProvider;

  useEffect(() => {
    const user = getUserContext();
    if (user && user.role === "operator") {

      setIsActivated(true);
    } else {
      setIsActivated(false);
      navigate("/login");
    }
  }, []);

  const linksToShow = [
    { to: "add-client", text: "Add Client" },
    { to: "show-client", text: "Show Client" },
    { to: "preparation", text: "Order Preparation" },
  ];

  return isActivated ? (
    <>
      <button onClick={() => getUserContext()}>context</button>
      <Header title="Hello Professional">
        <Nav links={linksToShow} />
        <Logout />
      </Header>
      <Outlet />
    </>
  ) : null;
}
