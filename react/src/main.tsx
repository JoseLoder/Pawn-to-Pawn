import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import styled from "@emotion/styled";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./styles.css";
import { Professional } from "./pages/Professional.tsx";
import { Home } from "./pages/Home.tsx";
import { Client } from "./pages/Client.tsx";
import { Admin } from "./pages/Admin.tsx";
import { ShowClient } from "./pages/profesional/ShowClient.tsx";
import { AddClient } from "./pages/profesional/AddClient.tsx";
import { Login } from "./pages/home/Login.tsx";
import { Register } from "./pages/home/Register.tsx";
import { EditClient } from "./pages/profesional/EditClient.tsx";
import { UserContextProvider } from "./contexts/UserContextProvider.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

const StyledRoot = styled.div`
  min-height: 100vh;
  padding: 10px;
  background-color: #333;
  color: #fff;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StyledRoot>
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <BrowserRouter>
          <ReactQueryDevtools />
          <Routes>
            <Route path="/" element={<Home />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            <Route path="professional" element={<Professional />}>
              <Route path="show-client" element={<ShowClient />} />
              <Route path="add-client" element={<AddClient />} />
              <Route path="edit-client/" element={<EditClient />} />
            </Route>
            <Route path="client" element={<Client />}>
              {/* Routes from client */}
            </Route>
            <Route path="admin" element={<Admin />}>
              {/* Routes from client */}
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </UserContextProvider>
    </QueryClientProvider>
  </StyledRoot>
);


