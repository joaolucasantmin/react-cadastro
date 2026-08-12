import { useState } from "react";
import api from '/src/services/api'
import { useNavigate } from "react-router-dom";

import { FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { AiFillEdit } from "react-icons/ai";
import logo from "/src/assets/logo.png";
import fundo from "/src/assets/fundo.jpg";
import { Link } from "react-router-dom";

export default function Login() {
        const navigate = useNavigate();

        const [email, setEmail] = useState(""); 
        const [password, setPassword] = useState("");


        //Para erros de senha ou nickname ou email
        const [erroSenha, setErroSenha] = useState("");
        const [erroEmail, setErroEmail] = useState("");
        

        const handleSubmit = async (e) => {
          e.preventDefault();

          setErroSenha("");
          setErroEmail("");

            //Validações
        

            

             // Enviar para a API
             const dados = {
             email_usuario: email,
             senha_usuario: password,
            };

                try {
                    const { data } = await api.post('/API/login', dados);

                    const token = data.token;

                    localStorage.setItem('token', token);

                    console.log(token)
                    alert("Login ok!")

                    navigate("/home");

                } catch (error) {

                    alert("Email ou senha incorretos!")
                }

            console.log(dados);
        };

    return (
        //Fundo
        <main className="min-h-screen flex items-center justify-center min-h bg-[url(/src/assets/fundo.jpg)] bg-cover bg-[center_82%] bg-no-repeat">

            <div className="w-[450px] rounded-3xl bg-white shadow-xl px-8 py-10">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-44"
                    />
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email */}
                    <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            placeholder="Digite seu email..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-orange-500
                                                                                                             focus:ring-2
                                                                                                             focus:ring-orange-200"
                        />
                        {erroEmail && (
                            <p className="text-red-500 text-sm mt-1">
                                {erroEmail}
                            </p>
                        )}
                    </div>


                    {/* Senha */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-orange-500
                                                                                                             focus:ring-2
                                                                                                             focus:ring-orange-200"
                        />
                    </div>



                    {/* Botão */}
                    <button
                        type="submit"
                       className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold transition-all duration-300 hover:bg-orange-600 hover:scale-[1.02]"
                    >
                        Entrar

                    </button>

                    {/* Link */}
                    <p className="text-center text-sm text-gray-500">
                        Não tem uma conta?{" "}
                        <Link to="/cadastro" className="font-medium text-orange-500 hover:underline">
                            Faça o cadastro
                        </Link>
                    </p>

                </form>

            </div>

        </main>
    );
}