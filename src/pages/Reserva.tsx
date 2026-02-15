import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Reserva = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
    setTimeout(() => {
      document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [navigate]);

  return null;
};

export default Reserva;
