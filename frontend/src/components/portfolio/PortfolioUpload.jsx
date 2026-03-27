import { useState } from "react";
import FileUpload from "../common/FileUpload";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "./PortfolioUpload.css";

export default function PortfolioUpload({ onUploadSuccess }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !title) {
      setError("Please provide a title and select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("portfolioFile", selectedFile);
      formData.append("title", title);
      formData.append("description", description);

      const response = await axios.post(
        "http://localhost:5000/api/upload/portfolio",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(response.data.portfolio);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="portfolio-upload">
      <h3>Add Portfolio Item</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Website Design Project"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project..."
            rows="3"
          />
        </div>

        <FileUpload
          label="Upload File *"
          accept="image/*,application/pdf"
          maxSize={10}
          onFileSelect={handleFileSelect}
        />

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" disabled={uploading || !selectedFile}>
          {uploading ? "Uploading..." : "Add to Portfolio"}
        </button>
      </form>
    </div>
  );
}
