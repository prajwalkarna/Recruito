import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user: authUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!token || !authUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/${authUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProfile(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    if (!token || !authUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${authUser.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProfile(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    if (!token) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload/profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update profile with new picture URL
      await fetchProfile();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload picture");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load profile when user logs in
  useEffect(() => {
    if (authUser && token) {
      fetchProfile();
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, token]);

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        uploadProfilePicture,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
