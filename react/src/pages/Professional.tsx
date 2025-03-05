import { Outlet } from "react-router";
import { Header } from "../components/syntax/Header";
import { Nav } from "../components/syntax/Nav";

export function Professional() {

  const linksToShow = [
    { to: "add-client", text: "Add Client" },
    { to: "clients", text: "Clients" }
  ]

    return (
        <>
            <Header title="Hello Profesional">
              <Nav links={linksToShow} />
            </Header>
            <Outlet />
        </>
      )
    }