
import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import { ProfesionalContextProvider } from "../contexts/ProfessionalContextProvider";
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
    const user = getUserContext()
    if (user) {
      setIsActivated(true)
    }else {
      setIsActivated(false)
    }
    console.log(user)
    console.log(isActivated)
  }
  , [getUserContext, isActivated, navigate])

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
              {isActivated && <Outlet />}
            </ProfesionalContextProvider>
        </>
      )
    }