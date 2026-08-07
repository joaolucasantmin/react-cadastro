import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Cadastro from "./pages/Pages/Cadastro"
//import Login from "./pages/Pages/Login"
import TelaMain from "./pages/Pages/telaMain"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<h1>TESTE CADASTRO</h1>} />
        <Route path="/home" element={<TelaMain />} />
      </Routes>
    </BrowserRouter>




  )
}

export default App
