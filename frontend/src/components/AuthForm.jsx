function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const submit = async () => {
    try {
      const url = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
      const res = await axios.post(url, { email, password });
      if (!isRegister) {
        localStorage.setItem("token", res.data.access_token);
        onLogin(res.data.access_token);
      } else {
        alert("Registration successful. Please login.");
        setIsRegister(false);
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md max-w-md mx-auto mt-12">
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">{isRegister ? "Register" : "Login"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-2 p-2 rounded text-black"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 p-2 rounded text-black"
      />
      <button onClick={submit} className="px-4 py-2 bg-cyan-500 rounded hover:bg-cyan-400">{isRegister ? "Register" : "Login"}</button>
      <p className="mt-2 text-sm text-indigo-200 cursor-pointer" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
      </p>
    </div>
  );
}
