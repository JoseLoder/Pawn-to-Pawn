import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { Logout } from "./home/Logout";
import { Outlet } from "react-router";

export function Professional() {

  const linksToShow = [
    { to: "show-orders", text: "Show Orders" },
    { to: "preparation", text: "Order Preparation" },
    { to: "me", text: "Profile" },
  ];

  return (
    <>
      <Header title="Hello Professional">
        <Nav links={linksToShow} />
        <Logout />
      </Header>
      <Outlet />
    </>
  )
}
