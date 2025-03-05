import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import styled from "@emotion/styled";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Professional } from "./pages/Professional.tsx";
import { Home } from "./pages/Home.tsx";
import { Client } from "./pages/Client.tsx";
import { ClientTable } from "./pages/profesional/ClientTable.tsx";
import App from "./App.tsx";
import { AddClient } from "./pages/profesional/AddClient.tsx";
import { Login } from "./pages/home/Login.tsx";
import { Register } from "./pages/home/Register.tsx";

const StyledRoot = styled.div`
  width: 100%;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StyledRoot>
    <QueryClientProvider client={ queryClient }>
    <BrowserRouter>
      <ReactQueryDevtools/>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="Home" element={<Home />} >
          <Route path="login" element={<Login/>} />
          <Route path="register" element={<Register/>}/>
        </Route>
        <Route path="professional" element={<Professional />}>
          <Route path="clients" element={<ClientTable />} />
          <Route path="add-client" element={<AddClient />} />
        </Route>
        <Route path="client" element={<Client />}>
          {/* Routes from client */}
        </Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </StyledRoot>
);
