import { Route, Routes } from 'react-router'
import { Home } from './pages/Home'
import { Login } from './pages/home/Login'
import { Register } from './pages/home/Register'
import ErrorPage from './pages/ErrorPage'
import { Client } from './pages/Client'
import { CreateOrder } from './pages/Client/CreateOrder'
import { Profile } from './components/semantic/Profile'
import { Professional } from './pages/Professional'
import { Admin } from './pages/Admin'
import { UserContext } from './contexts/UserContext'
import { JSX, useContext, useEffect, useState } from 'react'
import { ShowOperatorOrders } from './pages/profesional/ShowOperatorOrders'
import { ShowClientOrders } from './pages/Client/ShowClientOrders'
import { PreparationView } from './pages/profesional/PreparationView'
import { ShowClient } from './pages/admin/ShowClient'
import { Materials } from './pages/admin/Materials'
import { Machines } from './pages/admin/Machines'

const RouterMap = {
  "client":
    <Route path="client" element={<Client />}>
      <Route path="create-order" element={<CreateOrder />} />
      <Route path="show-orders" element={<ShowClientOrders />} />
      <Route path="me" element={<Profile />} />
    </Route>
  ,
  "operator":
    <Route path="professional" element={<Professional />}>
      <Route path="show-orders" element={<ShowOperatorOrders />} />
      <Route path="preparation" element={<PreparationView />} />
      <Route path="me" element={<Profile />} />
    </Route>,
  "admin":
    <Route path="admin" element={<Admin />}>
      <Route path="show-clients" element={<ShowClient />} />
      <Route path='machines' element={<Machines/>}/>
      <Route path='materials' element={<Materials/>}/>
      <Route path="me" element={<Profile />} />
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
