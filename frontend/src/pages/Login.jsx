/*import { useState } from "react";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6 md:p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Login
        </h1>

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
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;*/
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Placement Portal By Avi
          </h1>

          <p className="mt-2 text-base md:text-lg text-slate-500">
            Simplify your job hunt
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={submit}
          className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center">
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
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 mb-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 mb-5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm mt-5 text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;