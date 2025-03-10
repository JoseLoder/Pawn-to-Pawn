import { Outlet } from "react-router";
import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { ProfesionalContextProvider } from "../contexts/ProfessionalContextProvider";
import { Logout } from "./home/Logout";
export function Professional() {

  const linksToShow = [
    { to: "add-client", text: "Add Client" },
    { to: "show-client", text: "Show Client" },
    { to: "edit-client", text: "Edit Client" }
  ]

    return (
        <>
            <Header title="Hello Profesional">
              <Nav links={linksToShow} />
              <Logout />
            </Header>
            <ProfesionalContextProvider>
              <Outlet />
            </ProfesionalContextProvider>
        </>
      )
    }