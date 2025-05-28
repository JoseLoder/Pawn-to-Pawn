import { Outlet, useNavigate } from "react-router";
import { Header } from "../components/semantic/Header";
import { Nav } from "../components/semantic/Nav";
import styled from "@emotion/styled";
import { useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";

const StyledMain = styled.main`
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
input {
  margin-bottom: 10px;
}
`
export function Home() {
  const navigate = useNavigate();
  const userContextProvider = useContext(UserContext);
  
  if (!userContextProvider) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  
  const { getUserContext } = userContextProvider;

  useEffect(() => {
    // Check if user is already logged in and redirect
    const userAlreadyLogged = getUserContext();
    
    if (userAlreadyLogged) {
      if (userAlreadyLogged.role === 'client') {
        navigate('/client');
      } else if (userAlreadyLogged.role === 'operator') {
        navigate('/professional');
      } else if (userAlreadyLogged.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [getUserContext, navigate]);

  const linksToShow = [
    { to: "login", text: "Login" },
    { to: "register", text: "Register" },
  ];

  return (
    <>
      <Header title="Welcome to home">
        <Nav links={linksToShow} />
      </Header>
      <StyledMain>
        <Outlet />
      </StyledMain>
    </>
  );
}
