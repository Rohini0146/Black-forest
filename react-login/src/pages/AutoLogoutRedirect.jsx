import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogoutRedirect = () => {
  const navigate = useNavigate();

  // Timer reference
  let logoutTimer = null;

  // Function to start/reset the timer
  const startLogoutTimer = () => {
    // Clear any existing timer
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }

    // Set a new timer for auto logout after 10 seconds of inactivity
    logoutTimer = setTimeout(() => {
      localStorage.clear(); // Clear localStorage to simulate logout
      navigate("/login"); // Redirect to the login page
    }, 180000); // 10 seconds of inactivity
  };

  useEffect(() => {
    // Start the initial 10-second logout timer
    startLogoutTimer();

    // Event listener for activity (mouse move, key press, clicks)
    const resetTimerOnActivity = () => {
      startLogoutTimer(); // Reset the logout timer to 10 seconds on activity
    };

    // Attach event listeners to detect activity
    window.addEventListener("mousemove", resetTimerOnActivity);
    window.addEventListener("keydown", resetTimerOnActivity);
    window.addEventListener("click", resetTimerOnActivity);  // Add click event

    // Cleanup on component unmount
    return () => {
      clearTimeout(logoutTimer); // Clear the timer
      window.removeEventListener("mousemove", resetTimerOnActivity);
      window.removeEventListener("keydown", resetTimerOnActivity);
      window.removeEventListener("click", resetTimerOnActivity); // Clean up click event
    };
  }, [navigate]);

  return null; // This component doesn't need to render anything
};

export default AutoLogoutRedirect;
