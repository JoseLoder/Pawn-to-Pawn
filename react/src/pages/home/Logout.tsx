import { useMutation } from "@tanstack/react-query";
import { Nav } from "../../components/semantic/Nav";
import { logout } from "../../api/users";

export const Logout = () => {
  const logoutMutation = useMutation({
    mutationKey: ["Logout"],
    mutationFn: logout,
    onSuccess: () => {
    },
  });

  return (
    <Nav
      links={[
        {
          to: "/",
          text: "Log Out",
            actions: () => {
                logoutMutation.mutate();
                localStorage.removeItem("user");
                console.log("Logged out");
            }
        },
      ]}
    ></Nav>
  );
};
