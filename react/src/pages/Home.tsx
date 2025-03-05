import { Outlet } from "react-router";
import { Header } from "../components/syntax/Header";
import { Nav } from "../components/syntax/Nav";
import styled from "@emotion/styled";

const StyledMain = styled.main`
background-color: aliceblue;
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
