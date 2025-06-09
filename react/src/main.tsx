import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import styled, { ThemeProvider } from "styled-components";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./styles.css";
import { UserContextProvider } from "./contexts/UserContextProvider.tsx";
import App from "./App.tsx";
import {
  blue,
  green,
  yellow,
  red
  } from "@radix-ui/colors";
  
  const theme = {
  ...blue,
  ...green,
  ...yellow,
  ...red,
  
  accent1: blue.blue1,
  accent2: blue.blue2,
  accent3: blue.blue3,
  accent4: blue.blue4,
  accent5: blue.blue5,
  accent6: blue.blue6,
  accent7: blue.blue7,
  accent8: blue.blue8,
  accent9: blue.blue9,
  accent10: blue.blue10,
  accent11: blue.blue11,
  accent12: blue.blue12,
  
  success1: green.green1,
  success2: green.green2,
  // repeat for all steps
  
  warning1: yellow.yellow1,
  warning2: yellow.yellow2,
  // repeat for all steps
  
  danger1: red.red9,
  danger2: red.red4,
  // repeat for all steps
  };
const StyledRoot = styled.div`
  min-height: 100vh;
  padding: 10px;
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
          <ThemeProvider theme={theme}>
          <App />
          </ThemeProvider>
        </BrowserRouter>
      </UserContextProvider>
    </QueryClientProvider>
  </StyledRoot>
);


