import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import getErrorMessage from "../utils/getErrorMessage";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/login",
        form
      );

      login(response.data);

      const role = response.data.user.role;

      navigate(
        role === "student"
          ? "/student"
          : role === "company"
            ? "/company"
            : "/admin"
      );

      toast.success("Login successful");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to login"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-shell min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight theme-gradient-text">
            Placement Portal By Avi
          </h1>
          <p className="mt-2 text-base md:text-lg text-slate-500">
            Simplify your job hunt
          </p>
        </div>

        <form
          onSubmit={submit}
          className="theme-auth-panel w-full rounded-2xl p-6 md:p-8"
        >
        <h2 className="text-3xl font-bold text-center mb-6">
          Login
        </h2>

        <p className="text-slate-500 mt-2 mb-6 text-center">
          Sign in to continue.
        </p>

        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
          className="w-full border rounded-lg px-3 py-2.5 mb-4"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
          className="w-full border rounded-lg px-3 py-2.5 mb-5"
        />

        <button
          disabled={loading}
          className="theme-glow-button w-full disabled:bg-slate-500 text-white py-3 rounded-lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 font-medium hover:text-purple-300"
          >
            Register
          </Link>
        </p>
        </form>
      </div>

      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none whitespace-nowrap">
        <p className="text-xs text-slate-400/70 font-medium tracking-wide">
          Developed by Avi Keshari
        </p>
      </div>
    </div>
  );
};

export default Login;
