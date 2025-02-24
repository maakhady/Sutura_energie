import { useState, useEffect, useRef } from "react";
import { LayoutGrid, Mail } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const CodeForm = ({ setPage }) => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [showCode, setShowCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3); // Nombre de tentatives restantes
  const firstCodeInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (firstCodeInputRef.current) {
      firstCodeInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const savedTimeLeft = localStorage.getItem("timeLeft");
    if (savedTimeLeft) {
      setTimeLeft(parseInt(savedTimeLeft, 10));
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      localStorage.setItem("timeLeft", timeLeft.toString());
    } else {
      localStorage.removeItem("timeLeft");
    }
  }, [timeLeft]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prevTime) => prevTime - 1), 1000);
    } else {
      setAttemptsLeft(3); // Réinitialiser les tentatives après le décompte
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCodeChange = (index, value) => {
    if (timeLeft > 0) return;

    if (isNaN(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }

    if (newCode.some((digit) => digit !== "")) {
      setShowCode(true);
      setTimeout(() => setShowCode(false), 1000);
    }

    if (newCode.every((digit) => digit !== "")) {
      validateCode(newCode.join(""));
    }

    setCodeError(""); // Réinitialiser les erreurs lors de la saisie
  };

  const validateCode = async (submittedCode) => {
    try {
      const response = await authService.loginWithCode(submittedCode);
      if (response.success) {
        setCodeError("");
        localStorage.setItem("token", response.token);
        console.log("Code valide !");
        navigate("/dashboard");
      } else {
        handleValidationError();
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error);
      handleValidationError();
    }
  };

  const handleValidationError = () => {
    setCodeError("Code incorrect");
    setAttemptsLeft((prevAttempts) => {
      const newAttempts = prevAttempts - 1;
      if (newAttempts === 0) {
        setTimeLeft(30); // Bloquer pendant 30 secondes après 3 erreurs
        return 3; // Réinitialiser les tentatives après le décompte
      }
      return newAttempts;
    });
    setCode(["", "", "", ""]);
    setCodeError("");
    firstCodeInputRef.current.focus();
  };

  const handleCodeKeyDown = (index, e) => {
    if (timeLeft > 0) return;

    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    if (timeLeft === 0 || codeError) {
      setCode(["", "", "", ""]);
      firstCodeInputRef.current.focus();
    }
  }, [timeLeft, codeError]);

  const gaugeWidth = (timeLeft / 30) * 100;

  return (
    <div className="container">
      <div
        className="card shadow-lg mx-auto mt-5"
        style={{ maxWidth: "400px" }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <img
              src="images/Sutura-Énergie.png"
              alt="Sutura-Énergie"
              className="img-fluid"
              style={{ width: "100px", height: "100px", borderRadius: "20%" }}
            />
          </div>

          <h4 className="text-center mb-4 primary-text">
            Bienvenue sur Sutura Énergie
          </h4>

          <div className="d-flex gap-2 mb-4">
            <button
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 btn-outline-secondary"
              onClick={() => setPage("login")}
            >
              <Mail size={16} />
              Email
            </button>
            <button
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 btn-primary"
              onClick={() => setPage("code")}
            >
              <LayoutGrid size={16} />
              Code
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="d-flex justify-content-center gap-3 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type={showCode ? "text" : "password"}
                  pattern="[0-9]"
                  maxLength="1"
                  className="form-control text-center code-input"
                  style={{ width: "60px", height: "60px" }}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  autoComplete="one-time-code"
                  ref={index === 0 ? firstCodeInputRef : null}
                  disabled={timeLeft > 0}
                />
              ))}
            </div>
            {codeError && (
              <div className="alert alert-danger mt-3" role="alert">
                {codeError}
              </div>
            )}
            {timeLeft > 0 ? (
              <div className="text-center mb-3">
                <p>
                  Veuillez patienter {timeLeft} secondes avant de réessayer.
                </p>
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${gaugeWidth}%`,
                      height: "100%",
                      backgroundColor: timeLeft > 15 ? "red" : "green",
                      transition: "width 1s, background-color 1s",
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-center mb-3">
                <p>Tentatives restantes : {attemptsLeft}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

CodeForm.propTypes = {
  setPage: PropTypes.func.isRequired,
};

export default CodeForm;
