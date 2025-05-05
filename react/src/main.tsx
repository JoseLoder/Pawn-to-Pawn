import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import styled from "@emotion/styled";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles.css";
import { UserContextProvider } from "./contexts/UserContextProvider.tsx";

import App from "./App.tsx";

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
          <App />
        </BrowserRouter>
      </UserContextProvider>
    </QueryClientProvider>
  </StyledRoot>
);


