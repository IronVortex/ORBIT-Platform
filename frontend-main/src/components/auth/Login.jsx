import React from "react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Input from "../ui/Input";
import Button from "../ui/Button";
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { setCurrentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("http://localhost:3000/login", {
        email: email.trim(),
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      if (rememberMe) {
        localStorage.setItem("orbit_remember_email", email.trim());
      } else {
        localStorage.removeItem("orbit_remember_email");
      }

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to sign in right now. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue to your ORBIT workspace."
    >
      <form className="orbit-auth-form" onSubmit={handleLogin} noValidate>
        {error && (
          <div className="orbit-auth-error" aria-live="polite">
            {error}
          </div>
        )}

        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={error && !email.trim() ? "Required" : ""}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            error={error && !password.trim() ? "Required" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: 'absolute',
              right: '12px',
              top: '32px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '12px',
              padding: '4px'
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="orbit-auth-options">
          <label className="orbit-checkbox-label">
            <input 
              type="checkbox" 
              className="orbit-checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          {/* Note: Forgot password omitted as there is no backend functionality for it */}
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
          isLoading={loading}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="orbit-auth-footer">
        <span>New to ORBIT?</span>
        <Link to="/signup">Create an account</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
