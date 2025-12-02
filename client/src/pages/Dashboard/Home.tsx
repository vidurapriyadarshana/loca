import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to Discover page
        navigate("/discover", { replace: true });
    }, [navigate]);

    return null;
}
