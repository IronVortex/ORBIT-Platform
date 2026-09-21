import React from "react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Input from "../ui/Input";
import Button from "../ui/Button";
import "./auth.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await axios.post("http://localhost:3000/signup", {
        email: email.trim(),
        password: password,
        username: username.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = "/";
    } catch (err) {
      const message =
        err?.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Start building and collaborating with your team on ORBIT."
    >
      <form className="orbit-auth-form" onSubmit={handleSignup} noValidate>
        {error && (
          <div className="orbit-auth-error" aria-live="polite">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. adaloelace"
        />

        <Input
          label="Email address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
        />

        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
        />

        <div className="orbit-auth-options" style={{ marginTop: '4px' }}>
          <label className="orbit-checkbox-label">
            <input 
              type="checkbox" 
              className="orbit-checkbox" 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            I agree to the Terms & Conditions.
          </label>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
          isLoading={loading}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="orbit-auth-footer">
        <span>Already have an account?</span>
        <Link to="/auth">Sign In</Link>
      </div>
    </AuthLayout>
  );
};

export default Signup;
