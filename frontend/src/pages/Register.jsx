import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import getErrorMessage from "../utils/getErrorMessage";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register",
        form
      );

      login(response.data);

      navigate(
        response.data.user.role === "student"
          ? "/student"
          : "/company"
      );

      toast.success("Account created successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to register"
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
        <h2 className="text-3xl font-bold">
          Create Account
        </h2>

        <p className="text-slate-500 mt-2 mb-6">
          Join the placement portal.
        </p>

        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
          className="w-full border rounded-lg px-3 py-2.5 mb-4"
        />

        <input
          required
          type="email"
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
          required
          minLength={6}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
          className="w-full border rounded-lg px-3 py-2.5 mb-4"
        />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value
            })
          }
          className="w-full border rounded-lg px-3 py-2.5 mb-5"
        >
          <option value="student">
            Student
          </option>
          <option value="company">
            Company
          </option>
        </select>

        <button
          disabled={loading}
          className="theme-glow-button w-full disabled:bg-slate-500 text-white py-3 rounded-lg"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm mt-5">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-blue-400 font-medium hover:text-purple-300"
          >
            Sign in
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

export default Register;
