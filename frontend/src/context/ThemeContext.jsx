import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import axios from "axios";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);

  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("#667eea");
  const [loading, setLoading] = useState(true);

  // Load theme from localStorage or fetch from server
  useEffect(() => {
    const loadTheme = async () => {
      // First check localStorage
      const savedTheme = localStorage.getItem("theme");
      const savedAccent = localStorage.getItem("accentColor");

      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }

      if (savedAccent) {
        setAccentColor(savedAccent);
        applyAccentColor(savedAccent);
      }

      // If user is logged in, fetch from server
      if (token && user) {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/settings/theme",
            { headers: { Authorization: `Bearer ${token}` } },
          );

          const { theme: serverTheme, accent_color } =
            response.data.preferences;
          setTheme(serverTheme);
          setAccentColor(accent_color);
          applyTheme(serverTheme);
          applyAccentColor(accent_color);

          // Save to localStorage
          localStorage.setItem("theme", serverTheme);
          localStorage.setItem("accentColor", accent_color);
        } catch (err) {
          console.error("Error fetching theme:", err);
        }
      }

      setLoading(false);
    };

    loadTheme();
  }, [token, user]);

  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const applyAccentColor = (color) => {
    document.documentElement.style.setProperty("--accent-color", color);
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Save to server if logged in
    if (token && user) {
      try {
        await axios.put(
          "http://localhost:5000/api/settings/theme",
          { theme: newTheme },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (err) {
        console.error("Error saving theme:", err);
      }
    }
  };

  const changeAccentColor = async (color) => {
    setAccentColor(color);
    applyAccentColor(color);
    localStorage.setItem("accentColor", color);

    // Save to server if logged in
    if (token && user) {
      try {
        await axios.put(
          "http://localhost:5000/api/settings/theme",
          { accent_color: color },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (err) {
        console.error("Error saving accent color:", err);
      }
    }
  };

  const value = {
    theme,
    accentColor,
    loading,
    toggleTheme,
    changeAccentColor,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
