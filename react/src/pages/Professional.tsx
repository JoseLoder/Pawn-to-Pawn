import { useEffect } from "react";
import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { Logout } from "./home/Logout";
import { Outlet, useNavigate } from "react-router";

export function Professional() {
  const navigate = useNavigate();
  const linksToShow = [
    { to: "show-orders", text: "Show Orders" },
    { to: "preparation", text: "Order Preparation" },
    { to: "products", text: "Products Zone" },
    { to: "me", text: "Profile" },
    Logout()
  ];
  useEffect(() => {
    navigate("/professional/show-orders");
}, []);
  return (
    <>
      <Header title="Hello Professional">
        <Nav links={linksToShow} />
      </Header>
      <Outlet />
    </>
  )
}
