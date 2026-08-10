import axios from "axios";

const api = axios.create({
  baseURL: "https://api-energiasolar.onrender.com"
});

export default api