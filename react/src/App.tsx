import { Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import { Login } from './pages/home/Login'
import { Register } from './pages/home/Register'
import ErrorPage from './pages/ErrorPage'
import { Client } from './pages/Client'
import { CreateOrder } from './pages/Client/CreateOrder'
import { ShowOrders } from './pages/Client/ShowOrders'
import { Profile } from './pages/Client/Profile'
import { Professional } from './pages/Professional'
import { ShowClient } from './pages/profesional/ShowClient'
import { AddClient } from './pages/profesional/AddClient'
import { EditClient } from './pages/profesional/EditClient'
import { Admin } from './pages/Admin'
import { UserContext } from './contexts/UserContext'
import { JSX, useContext, useEffect, useState } from 'react'

const RouterMap = {
  "client":
    <Route path="client" element={<Client />}>
      <Route path="create-order" element={<CreateOrder />} />
      <Route path="show-order" element={<ShowOrders />} />
      <Route path="me" element={<Profile />} />
    </Route>
  ,
  "operator":
    <Route path="professional" element={<Professional />}>
      <Route path="show-client" element={<ShowClient />} />
      <Route path="add-client" element={<AddClient />} />
      <Route path="edit-client/" element={<EditClient />} />
    </Route>,
  "admin":
    <Route path="admin" element={<Admin />}>
    </Route>
}

function App() {
  const userContextProvider = useContext(UserContext);
  if (!userContextProvider) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { getUserContext } = userContextProvider;

  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const userAlreadyLogged = getUserContext()
    if (userAlreadyLogged) {
      setRole(userAlreadyLogged.role)
    }
  }, [])

  const showRoute = (role: string | null): JSX.Element | null => {
    if (role === "client" || role === "operator" || role === "admin") {
      return RouterMap[role]
    }
    return null
  }


  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      {role ? showRoute(role) : null}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default App
