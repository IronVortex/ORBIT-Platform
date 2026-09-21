import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load repository.");
        }

        const repo = Array.isArray(data) ? data[0] : data;
        setRepository(repo || null);
      } catch (err) {
        setError(err.message || "Unable to load repository.");
      }
    };

    fetchRepository();
  }, [id]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
        {error ? (
          <p>{error}</p>
        ) : repository ? (
          <>
            <h2>{repository.name}</h2>
            <p>{repository.description || "No description provided."}</p>
            <p>Visibility: {repository.visibility ? "Public" : "Private"}</p>
            <p>Owner: {repository.owner?.username || repository.owner || "Unknown owner"}</p>
          </>
        ) : (
          <p>Loading repository...</p>
        )}
      </div>
    </>
  );
};

export default RepositoryDetail;
