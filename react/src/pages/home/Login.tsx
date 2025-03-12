import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/users";
import { UserContext } from "../../contexts/UserContext";
import { useContext } from "react";
import { User } from "../../types/Users";
type Login = {
  username: string,
  password: string
}

export function Login () {

  const navigate = useNavigate();

  // Set user context
  const userContextProvider = useContext(UserContext);
  if (!userContextProvider) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { setUserContext } = userContextProvider;

  // Login mutation
  const loginMutation = useMutation({
    mutationKey: ["Login"],
    mutationFn: login,
    onSuccess: (data: User) => {
      setUserContext(data)
      navigate('/professional')
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(getFields())
  }
  const getFields = () : Login => {
    const username = (document.getElementById('username') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value
    
    return {
      username,
      password
    }
  }

  return (
    <section>
      <h2>Welcome to login</h2>
      <form>
        <label htmlFor="username">Username</label>
        <input type="text" id="username"/>
        <label htmlFor="password">Password</label>
        <input type="password" id="password"/>
        <button onClick={handleSubmit}>Login</button>
      </form>
    </section>

  )
}