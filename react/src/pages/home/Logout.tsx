import { useMutation } from "@tanstack/react-query";
import { Nav } from "../../components/semantic/Nav";
import { logout } from "../../api/users";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

export const Logout = () => {
    // Set user context
    const userContextProvider = useContext(UserContext);
    if (!userContextProvider) {
      throw new Error("UserContext must be used within a UserProvider");
    }
    const { setUserContext } = userContextProvider;
    
  const logoutMutation = useMutation({
    mutationKey: ["Logout"],
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("user");
      setUserContext(undefined)
      console.log("Logged out");
    },
  });

  return (
    <Nav
      links={[
        {
          to: "/",
          text: "Log Out",
            actions: () => logoutMutation.mutate()
        },
      ]}
    ></Nav>
  );
};
