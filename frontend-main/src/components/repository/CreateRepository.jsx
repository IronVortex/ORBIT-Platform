import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: userId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          visibility: formData.visibility === "private" ? false : true,
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
    <>
      <Navbar />
      <div style={{ maxWidth: "720px", margin: "2rem auto", padding: "1rem" }}>
        <h2>Create a repository</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="name">Repository name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              style={{ display: "block", width: "100%", marginTop: "0.5rem" }}
              placeholder="my-project"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ display: "block", width: "100%", minHeight: "110px", marginTop: "0.5rem" }}
              placeholder="Optional repository description"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              style={{ display: "block", width: "180px", marginTop: "0.5rem" }}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {error && (
            <p style={{ color: "#d73a49", marginBottom: "1rem" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{ padding: "0.65rem 1rem" }}>
            {loading ? "Creating..." : "Create repository"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateRepository;
