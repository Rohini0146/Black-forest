import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogoutRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Replace with your actual API call or session validation logic
        const response = await fetch("/api/check-session");
        if (!response.ok) {
          navigate("/login"); // Redirect to login if session is invalid
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login"); // Redirect to login if session validation fails
      }
    };

    // Schedule session checks every 10 hours (36000000 ms)
    const intervalId = setInterval(checkSession, 36000000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [navigate]);

  return null; // This component does not render anything
};

export default AutoLogoutRedirect;
