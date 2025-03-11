import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/users";
type Login = {
  username: string,
  password: string
}

export function Login () {
  const navigate = useNavigate();
  const loginMutation = useMutation({
    mutationKey: ["Login"],
    mutationFn: login,
    onSuccess: () => {
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