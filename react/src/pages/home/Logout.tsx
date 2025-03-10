import { useMutation } from "@tanstack/react-query";
import { Nav } from "../../components/semantic/Nav";
import { logout } from "../../api/users";

export const Logout = () => {
  const logoutMutation = useMutation({
    mutationKey: ["Logout"],
    mutationFn: logout,
  });

  return (
    <Nav
      links={[
        {
          to: "/",
          text: "Log Out",
            actions: () => {
                logoutMutation.mutate();
                console.log("Logged out");
            }
        },
      ]}
    ></Nav>
  );
};
