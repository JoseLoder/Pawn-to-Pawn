import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/users";
import { UserContext } from "../../contexts/UserContext";
import { useContext, useState } from "react";
import { LoginUser, PublicUser } from "@pawn-to-pawn/shared";
import { BackEndError } from "../../errors/BackEndError";

export function Login() {

  const navigate = useNavigate();

  // Set user context
  const userContextProvider = useContext(UserContext);
  if (!userContextProvider) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { setUserContext, getUserContext } = userContextProvider;

  const userAlreadyLogged = getUserContext()
  // Check if user is already logged in and redirect too
  if (userAlreadyLogged) {
    if (userAlreadyLogged.role === 'client') {
      navigate('/client')
    } else if (userAlreadyLogged.role === 'operator') {
      navigate('/professional')
    } else if (userAlreadyLogged.role === 'admin') {
      navigate('/admin')
    }
  }

  // State for error messages 
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Login mutation
  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onMutate: () => {
      setLoading(true),
        setError(null)
    },
    onSuccess: (data) => {
      console.log(data.data)
      setUserContext(data.data as PublicUser)
      navigate('/home')
    },
    onError: (e) => {
      setLoading(false);
      setError(e)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate(getFields())
  }
  const getFields = (): LoginUser => {
    const email = (document.getElementById('email') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value

    return {
      email,
      password
    }
  }

  return (
    <section>
      <h2>Welcome to login</h2>
      {error && <BackEndError inputError={error} />}
      <form>
        <label htmlFor="email">Username</label>
        <input type="email" id="email" />
        <label htmlFor="password">Password</label>
        <input type="password" id="password" />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Cargando..." : "Login"}
        </button>
      </form>
    </section>

  )
}