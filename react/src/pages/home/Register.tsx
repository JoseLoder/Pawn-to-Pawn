import axios from "axios"

type Register = {
name: string,
username: string,
password: string
}
export function Register () {
  const handleSubmit = (e: React.FormEvent)  => {
    e.preventDefault()
    const newUser = getFields()
    axios.post('http://localhost:3000/users/login', newUser)
      .then((response) => {
        if (response.status === 201) {
          console.log('Ehtamoh activoh papi')
          console.log(response.data.message)
        }
      })
      .catch((error) => {
        console.log('ehto que eh` lo que eh`')
        console.error('Error:', error)
    })
  }
  const getFields = () : Register => {
    const name = (document.getElementById('name') as HTMLInputElement).value
    const username = (document.getElementById('username') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value

    return {
      name: name,
      username: username,
      password: password
    }
  }

    return (
      <section>
        <h2>Welcome to register</h2>
        <form>
          <label htmlFor="name">Name</label>
          <input type="text" id="name"/>
          <label htmlFor="username">Username</label>
          <input type="text" id="username"/>
          <label htmlFor="password">Password</label>
          <input type="password" id="password"/>
          <button onClick={handleSubmit}>Register</button>
        </form>
      </section>
  
    )
  }