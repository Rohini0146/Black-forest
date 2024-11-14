import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogoutRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            // Replace with your actual API call or session validation logic
            const response = await fetch("/api/check-session");
            if (!response.ok) {
                navigate("/login"); // Redirect to login if session is invalid
            }
        };

        const intervalId = setInterval(checkSession, 10000); // Check every 10 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [navigate]);

    return null; // This component does not render anything
};

export default AutoLogoutRedirect;