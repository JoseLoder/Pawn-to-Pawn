import { Nav } from './components/syntax/Nav'
function App() {
const linksToShow = [
    { to: "professional", text: "Professional" },
    { to: "client", text: "Client" },
    { to: "home", text: "Test New Home"}
  ]

  return (
    <>
      <header className="App-header">
        <h1>Home</h1>
        <Nav links={linksToShow} />
      </header>
      <main>
        <h2>Select who you are</h2>
      </main>
    </>
  )
}

export default App
