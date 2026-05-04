import { useState } from "react";
import "./CustomerLogin.css";
import { useNavigate } from 'react-router-dom';

function CustomerLogin() {
  const [tableNumber, setTableNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); // Yeni bir deneme yapıldığında eski hatayı ekrandan sil

    try {
      const response =  await fetch("http://localhost:5000/api/tables/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableNumber, pin }),
      });

      const data = await response.json();
      if (data.success) {
        // Backend "Giriş Başarılı" derse
        console.log("Token alındı:", data.token);
        
        // YENİ: Backend'den gelen bileti ve masayı tarayıcının kalıcı hafızasına (cebine) koy!
        localStorage.setItem('customerToken', data.token); 
        localStorage.setItem('tableNumber', tableNumber);
        
        navigate('/menu');
        
        // NOT: İleride buraya sayfalar arası geçiş (React Router) kodumuzu ekleyeceğiz.
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
        <p className="description">
          Menüye erişmek için masa numaranızı ve size özel müşteri PIN'inizi girin.
        </p>

        {/* YENİ: Eğer error kutusunun içi doluysa bu div ekranda görünür */}
        {error && <div style={{ color: '#ff4d4d', backgroundColor: '#331010', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ff4d4d' }}>{error}</div>}

        <form onSubmit={handleLogin} className="login-form"></form>
        {/* Form Alanı */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Masa Numarası</label>
            <input
              type="number"
              placeholder="Örn: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
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
