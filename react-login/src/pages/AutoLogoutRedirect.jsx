import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogoutRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a timer to redirect to login every 10 seconds
    const timer = setInterval(() => {
      // Clear localStorage to simulate logout
      localStorage.clear();
      // Redirect to the login page
      navigate("/login");
    }, 18000000); // 5 hours (5 * 60 * 60 * 1000 ms)

    // Cleanup the timer when the component is unmounted
    return () => clearInterval(timer);
  }, [navigate]);

  return null; // This component doesn't need to render anything
};

export default AutoLogoutRedirect;
