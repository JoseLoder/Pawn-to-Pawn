import axios from "axios"
import { useNavigate } from "react-router"
type Login = {
  username: string,
  password: string
}

export function Login () {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const login = getFields()
    
    axios.post('http://localhost:3000/users/login', login)
      .then((response) => {
        if (response.status === 200) {
          console.log('Ehtamoh activoh papi')
          document.cookie = `access_token=${response.data.accessToken}`
          navigate('/professional')
        }
      }).catch((error) => {
        console.log('ehto que eh` lo que eh`')
        console.error('Error:', error)
    })
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