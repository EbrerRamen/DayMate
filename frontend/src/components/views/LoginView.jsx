import Login from "../Login";

const LoginView = ({ onBack, onLoginSuccess, onNavigateToRegister }) => (
  <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans p-6 flex items-center justify-center">
    <div className="w-full max-w-md">
      <button onClick={onBack} className="mb-4 text-indigo-300 hover:text-indigo-100 underline cursor-pointer">
        ← Back to Home
      </button>

      <Login onLoginSuccess={onLoginSuccess} />

      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <button className="text-cyan-400 underline hover:text-cyan-200 transition cursor-pointer" onClick={onNavigateToRegister}>
          Register
        </button>
      </p>
    </div>
  </div>
);

export default LoginView;

