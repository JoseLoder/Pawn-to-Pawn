import { useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/users";
import { UserContext } from "../../contexts/UserContext";
import { useContext, useState } from "react";
import { AxiosError } from "axios";
import { LoginUser, PublicUser } from "../../types/users.types";
import { AxiosErrorData, AxiosValidationErrorData } from "../../types/axios.type";

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
  const [errorMessage, setErrorMessage] = useState<AxiosValidationErrorData | AxiosErrorData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Login mutation
  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onMutate: () => {
      setLoading(true),
        setErrorMessage(null)
    },
    onSuccess: (data) => {
      console.log(data.data)
      setUserContext(data.data as PublicUser)
      navigate('/login')
    },
    onError: (e) => {
      setLoading(false);
      if (e instanceof AxiosError) {

        if (e.response?.data.name === "ValidationError") {
          setErrorMessage(e.response.data as AxiosValidationErrorData)
        }
        else if (e.response?.data.name === "ClientError") {
          setErrorMessage(e.response.data as AxiosErrorData)

        }
      }
    }
  })

  const showError = () => {
    if (!errorMessage) return;
    console.log(errorMessage)
    if (errorMessage.name === "ValidationError") {
      return <div>
        <p>{errorMessage.name}</p>
        <ul>
          {(errorMessage as AxiosValidationErrorData).errors.map((error, index) => (
            <li key={index}>
              {error.path}: {error.message}
            </li>
          ))}
        </ul>
      </div>
    } else if (errorMessage.name === "ClientError") {
      return <div>
        <p>{errorMessage.name}</p>
        <p>{(errorMessage as AxiosErrorData).message}</p>
      </div>;
    } else {
      return <p>Something went wrong</p>;
    }
  }

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
      {errorMessage && showError()}
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