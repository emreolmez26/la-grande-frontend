import { useState, useEffect } from "react";
import "./CustomerLogin.css";
import { useNavigate } from "react-router-dom";

function CustomerLogin() {
  const [tableNumber, setTableNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isTableLocked, setIsTableLocked] = useState(false); // YENİ: Masa numarasını kilitlemek için

  const navigate = useNavigate();

  // YENİ EKLENEN RADAR: Sayfa açıldığında linkte "?table=X" var mı diye bakar
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tableFromQR = queryParams.get("table");

    if (tableFromQR) {
      setTableNumber(tableFromQR); // Kutuyu otomatik doldur
      setIsTableLocked(true); // Kutuyu kilitle (müşteri değiştiremesin)
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Yeni bir deneme yapıldığında eski hatayı ekrandan sil

    try {
      const response = await fetch(
        "https://cafe-backend-p04f.onrender.com/api/tables/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tableNumber, pin }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Backend "Giriş Başarılı" derse
        console.log("Token alındı:", data.token);

        // Backend'den gelen bileti ve masayı tarayıcının kalıcı hafızasına koy!
        localStorage.setItem("customerToken", data.token);
        localStorage.setItem("tableNumber", tableNumber);

        navigate("/menu");
      } else {
        // Backend "Hatalı PIN" vs. derse, bu mesajı error state'ine at
        setError(data.message);
      }
    } catch (err) {
      // Backend sunucusu kapalıysa veya internet yoksa
      setError("Sunucuya ulaşılamıyor. Lütfen bağlantınızı kontrol edin.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="logo-circle">
          <span>LG</span>
        </div>

        {/* Başlıklar ve Açıklama */}
        <h3 className="sub-title">QR MENÜ</h3>
        <h1 className="main-title">La Grande</h1>
        <p className="description">
          Menüye erişmek için masa numaranızı ve size özel müşteri PIN'inizi
          girin.
        </p>

        {/* Eğer error kutusunun içi doluysa bu div ekranda görünür */}
        {error && (
          <div
            style={{
              color: "#ff4d4d",
              backgroundColor: "#331010",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              border: "1px solid #ff4d4d",
            }}
          >
            {error}
          </div>
        )}

        {/* Form Alanı */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Masa Numarası</label>
            <input
              type="number"
              placeholder="Örn: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              readOnly={isTableLocked} // Kilitliyse müdahale edilemez
              style={
                isTableLocked
                  ? {
                      backgroundColor: "#2a2a2a",
                      color: "#888",
                      cursor: "not-allowed",
                    }
                  : {}
              }
            />
          </div>
          <div className="input-group">
            <label>Müşteri PIN Kodu</label>
            <input
              type="text"
              placeholder="Örn: 8840"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            Menüye Gir
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerLogin;
