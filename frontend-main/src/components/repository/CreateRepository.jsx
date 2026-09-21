import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";

const CreateRepository = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "public",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      navigate("/auth");
      return;
    }

    if (!formData.name.trim()) {
      setError("Repository name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/repo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: userId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          visibility: formData.visibility !== "private",
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || "Unable to create repository.");
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to create repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "768px", margin: "0 auto", padding: "48px 24px" }}>
      <header style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "24px", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "var(--font-weight-semibold)", margin: "0 0 8px 0" }}>Create a new repository</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>
          A repository contains all project files, including the revision history.
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
            Repository name <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="my-awesome-project"
            style={{ maxWidth: '400px' }}
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
            Description <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(optional)</span>
          </label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is this repository for?"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px", marginTop: "8px" }}>
          <label style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', marginBottom: '16px' }}>Visibility</label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="visibility" 
                value="public" 
                checked={formData.visibility === "public"} 
                onChange={handleChange} 
                style={{ marginTop: '4px' }}
              />
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Public</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Anyone on the internet can see this repository. You choose who can commit.</span>
              </div>
            </label>

            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="visibility" 
                value="private" 
                checked={formData.visibility === "private"} 
                onChange={handleChange} 
                style={{ marginTop: '4px' }}
              />
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Private</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>You choose who can see and commit to this repository.</span>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="orbit-error-state" style={{ textAlign: 'left' }}>
            {error}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px", marginTop: "8px" }}>
          <Button type="submit" variant="primary" isLoading={loading}>
            Create repository
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRepository;
