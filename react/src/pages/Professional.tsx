import { Outlet } from "react-router";
import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { ProfesionalContextProvider } from "../contexts/ProfessionalContextProvider";
export function Professional() {

  const linksToShow = [
    { to: "add-client", text: "Add Client" },
    { to: "clients", text: "Clients" },
    { to: "edit-client", text: "Edit Client" }
  ]

    return (
        <>
            <Header title="Hello Profesional">
              <Nav links={linksToShow} />
            </Header>
            <ProfesionalContextProvider>
              <Outlet />
            </ProfesionalContextProvider>
        </>
      )
    }