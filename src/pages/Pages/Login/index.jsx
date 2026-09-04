import { useState, useEffect } from "react";
import api from '/src/services/api'
import { useNavigate } from "react-router-dom";

import { FaEnvelope, FaLock, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { AiFillEdit } from "react-icons/ai";
import logo from "/src/assets/logo.png";
import fundo from "/src/assets/fundo.jpg";
import { Link } from "react-router-dom";

export default function Login() {
        const navigate = useNavigate();

        const [email, setEmail] = useState(""); 
        const [password, setPassword] = useState("");

        const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);

        
        // Toast de respostas para erros ou sucessos
        const [toast, setToast] = useState(null);

        // Mostra um toast e some sozinho depois de alguns segundos
        const mostrarToast = (tipo, mensagem) => {
            setToast({ tipo, mensagem });
        };

        useEffect(() => {
            if (!toast) return;

            const timer = setTimeout(() => setToast(null), 3000);

            return () => clearTimeout(timer);
        }, [toast]);


        
        // Estado do botão
        const [carregando, setCarregando] = useState(false);

        const handleSubmit = async (e) => {
        e.preventDefault();

        if (carregando) return; // evita dois cliques

        setCarregando(true);
        

        const dados = {
            email_usuario: email,
            senha_usuario: password,
        };

        try {
            const { data } = await api.post("/API/login", dados);

            // Salva o token sem exibi-lo no console
            localStorage.setItem("token", data.token);

            mostrarToast("sucesso", "Login realizado!");

                setTimeout(() => {
                    navigate("/home");
                }, 500);

            } catch (error) {
                mostrarToast(
                    "erro",
                    error.response?.data?.error || "E-mail ou senha incorretos."
                );
        } finally {
            setCarregando(false);
        }
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
                        
                    </div>


                    {/* Senha */}
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type={mostrarSenhaLogin ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite sua senha..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 outline-none focus:border-orange-500
                                                                                                             focus:ring-2
                                                                                                             focus:ring-orange-200"
                        />
                        <button
                            type="submit"
                            onClick={() => setMostrarSenhaLogin(!mostrarSenhaLogin)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                        >
                            {mostrarSenhaLogin ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>



                    {/* Botão */}
                    <button
                        type="submit"
                        disabled = {carregando}
                        className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold transition-all duration-300 hover:bg-orange-600 hover:scale-[1.02]"
                    >
                        {carregando ? "Carregando..." : "Entrar"}
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

            {/* ---------------- TOAST ---------------- */}
                {toast && (
                    <div
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
                            toast.tipo === "sucesso"
                                ? "bg-green-500"
                                : toast.tipo === "erro"
                                ? "bg-red-500"
                                : "bg-blue-500"
                        }`}
                    >
                        {toast.mensagem}
                    </div>
                )}


        </main>
    );
}