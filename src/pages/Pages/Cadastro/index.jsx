import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { AiFillEdit } from "react-icons/ai";
import logo from "../../../assets/logo.png";
import fundo from "../../../assets/fundo.jpg";
import api from "../../../services/api";
import { Link } from "react-router-dom";

export default function Cadastro() {
        const navigate = useNavigate();

        const [email, setEmail] = useState(""); 
        const [name, setUserName] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");

        //const responsavel pelo botão apresentar "Carregando.." enquanto requisição é feita
        const [carregando, setCarregando] = useState(false);

        //Para erros de senha ou nickname ou email
        const [erroSenha, setErroSenha] = useState("");
        const [erroEmail, setErroEmail] = useState("");
        const [erroNome, setErroNome] = useState("");

        const handleSubmit = async (e) => {
          e.preventDefault();

          setCarregando(true);
          setErroSenha("");
          setErroEmail("");
          setErroNome("");

            //Validações
            if(password !== confirmPassword){  //Verifica se as senhas são iguais
                setErroSenha("As senhas não coincidem.");
                return;
            }


             // Enviar para a API
             const dados = {
             email_usuario: email,
             nome_usuario: name,
             senha_usuario: password,
            };

                try {
                    await api.post('/API/cadastro', dados);

                    alert("Usuário Cadastrado!")

                    navigate("/login");

                } catch (error) {
                    console.error(error);

                    if (error.response) {

                        const mensagem = error.response.data.error;

                        if (mensagem === "Este e-mail já está cadastrado.") {
                            setErroEmail(mensagem);
                        }
                        else if (mensagem === "Este nome de usuário já está em uso.") {
                            setErroNome(mensagem);
                        }
                        else {
                            alert(mensagem);
                        }

                    } else {
                        alert("Erro ao conectar com o servidor.");
                    }
                }
                finally{
                    setCarregando(false);
                }

            console.log(dados);
        };

    return (
        //Fundo
        <main className="min-h-screen flex items-center justify-center bg-cover bg-no-repeat"
            style={{
            backgroundImage: `url(${fundo})`,
            backgroundPosition: "center 82%",
        }}>
        

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

                    {/* Nome de usuario */}
                    <div className="relative">
                        <AiFillEdit className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Digite seu nome de usuario..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-orange-500
                                                                                                             focus:ring-2
                                                                                                             focus:ring-orange-200"
                        />
                        {erroNome && (
                        <p className="text-red-500 text-sm mt-1">
                            {erroNome}
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

                    {/* Confirmar senha */}
                    <div className="relative">
                        <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme sua senha..."
                            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                        {erroSenha && (
                            <p className="text-red-500 text-sm mt-1">
                                {erroSenha}
                            </p>
                        )}
                    </div>


                    {/* Botão */}
                    <button
                        type="submit"
                        disabled={carregando}
                       className="w-full rounded-xl bg-orange-500 py-3 text-white font-semibold transition-all duration-300 hover:bg-orange-600 hover:scale-[1.02]"
                    >
                        {carregando ? "Carregando..." : "Cadastrar"}
                    </button>

                    {/* Link */}
                    <p className="text-center text-sm text-gray-500">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="font-medium text-orange-500 hover:underline">
                            Faça o login
                        </Link>
                    </p>

                </form>

            </div>

        </main>
    );
}