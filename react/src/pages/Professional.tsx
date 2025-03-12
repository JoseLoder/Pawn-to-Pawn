
import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { ProfesionalContextProvider } from "../contexts/ProfessionalContextProvider";
import { Logout } from "./home/Logout";
import { ProtectedRoute } from "../components/utils/ProtectedRoute";
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
              <ProtectedRoute canActivate={true} redirectTo="/home/login" />
            </ProfesionalContextProvider>
        </>
      )
    }