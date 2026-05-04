import { useState, useEffect } from 'react';
import './Menu.css';
import Recommended from './Recommended';

function Menu() {
  // --- 1. HAFIZALAR (STATES) ---
  const [activeTab, setActiveTab] = useState('menu'); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [menuData, setMenuData] = useState([]); 
  const [recommendedProducts, setRecommendedProducts] = useState([]); // YENİ: Bot Seçimleri
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  
  const [cart, setCart] = useState([]); 
  const [expandedProductId, setExpandedProductId] = useState(null); 
  const [orders, setOrders] = useState([]); 

  // --- 2. FONKSİYONLAR ---
  
  // Sayfa açıldığında menüyü çek ve önerilenleri hazırla
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/menu'); 
        const data = await response.json();
        if (data.success) {
          setMenuData(data.data);

          // Bütün ürünleri bir havuza atıp rastgele 4 tane "Önerilen" seç
          let allProducts = [];
          data.data.forEach(category => {
            if (category.products) {
              allProducts = [...allProducts, ...category.products];
            }
          });
          const shuffled = allProducts.sort(() => 0.5 - Math.random());
          setRecommendedProducts(shuffled.slice(0, 4));

        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Menü yüklenirken sunucuya ulaşılamadı.');
      } finally {
        setLoading(false); 
      }
    };
    fetchMenu();
  }, []);

  const toggleProduct = (productId) => {
    if (expandedProductId === productId) setExpandedProductId(null);
    else setExpandedProductId(productId);
  };

  const addToCart = (product, event) => {
    event.stopPropagation(); 
    setCart([...cart, product]); 
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  // Gerçek Backend Bağlantılı Sipariş Gönderme Fonksiyonu
  const handleSendOrder = async () => {
    if (cart.length === 0) return; // Sepet boşsa dur
    
    // 1. Sepetteki ürünleri gruplayıp backend'in istediği formata çeviriyoruz
    const formattedItems = [];
    cart.forEach((cartItem) => {
      const existingItem = formattedItems.find(item => item.productId === cartItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        formattedItems.push({
          productId: cartItem.id, // Backend bizden productId bekliyor
          quantity: 1, 
          notes: "" 
        });
      }
    });

    try {
      // 1. Cepten (localStorage) biletimizi ve masa numaramızı çıkarıyoruz
      const token = localStorage.getItem('customerToken');
      const currentTable = localStorage.getItem('tableNumber') || 1;

      // 2. Kuryeyi yolluyoruz
      const response = await fetch('http://localhost:5000/api/orders/create', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token // Sadece ham token'ı gönderiyoruz
        },
        body: JSON.stringify({
          tableNumber: parseInt(currentTable), // Hangi masadan girdiysek o masa no gidiyor
          items: formattedItems
        })
      });

      const data = await response.json();

      if (data.success) {
        // 3. Başarılıysa backend'den gelen "Gerçek" fişi alıp listeye ekle
        setOrders([data.data, ...orders]); 
        setCart([]); // Sipariş verildiği için sepeti sıfırla
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Sipariş hatası: " + data.message);
      }
    } catch (error) {
      console.error("Sipariş gönderme hatası:", error);
      alert("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    }
  };

  // --- 3. EKRAN YÜKLENİYOR / HATA DURUMLARI ---
  if (loading) return <div className="menu-container" style={{ display:'flex', justifyContent:'center', alignItems:'center', color:'#FFC107' }}><h2>Menü Hazırlanıyor...</h2></div>;
  if (error) return <div className="menu-container" style={{ display:'flex', justifyContent:'center', alignItems:'center', color:'red' }}><h2>{error}</h2></div>;

  // --- 4. ANA EKRAN ÇİZİMİ ---
  return (
    <div className="menu-container">
      
      {/* ÜST BİLGİ ALANI (Sabit) */}
      <header className="top-header">
        <div className="brand-info">
          <div className="logo-small">LG</div>
          <div className="brand-texts">
            <h2>LA GRANDE</h2>
            <p>Lezzetin Ekmek Arası</p>
          </div>
        </div>
        <div className="user-info">
          <span className="user-name">Masa {localStorage.getItem('tableNumber') || 1}</span>
          <span className="user-pin">PIN: <strong>8840</strong></span>
        </div>
      </header>

      {/* DİNAMİK ALAN (SEKMELER) */}
      
      {/* 1. MENÜ SEKMESİ */}
      {activeTab === 'menu' && (
        <div className="menu-tab-content">
          {!selectedCategory ? (
            <div className="category-view">
              <div className="menu-intro">
                <span className="since-text">1974'TEN BERİ</span>
                <h1 className="menu-title-main">Menü</h1>
                <p className="menu-desc">Ürünü açıp içindekileri düzenleyebilir, istemediklerinizi kaldırabilirsiniz.</p>
              </div>

              <h3 className="section-title">KATEGORİLER</h3>
              <div className="category-list">
                {menuData.map(cat => (
                  <div key={cat.id} className="category-card" onClick={() => setSelectedCategory(cat)}>
                    <div className="cat-details">
                      <span className="cat-name">{cat.name}</span>
                      <span className="cat-count">{cat.products ? cat.products.length : 0} ürün</span>
                    </div>
                    <span className="arrow-icon">{'>'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="product-view">
              <button className="back-btn" onClick={() => { setSelectedCategory(null); setExpandedProductId(null); }}>
                Geri Dön
              </button>
              <h3 className="section-title uppercase">{selectedCategory.name.toUpperCase()}</h3>
              <div className="product-grid">
                {selectedCategory.products && selectedCategory.products.map(product => (
                  <div key={product.id} className="product-card" onClick={() => toggleProduct(product.id)}>
                    <div className="product-image-placeholder">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : "🍔"}
                    </div>
                    <div className="product-card-body">
                      <h4 className="product-name">{product.name}</h4>
                      <div className="product-price">{product.price} TL</div>
                      <div className="product-time">Tahmini hazırlama: 15 dk</div>
                    </div>
                    {expandedProductId === product.id && (
                      <div className="product-expanded-area" onClick={(e) => e.stopPropagation()}>
                        <p className="product-inner-desc">{product.description || "Klasik La Grande lezzeti."}</p>
                        <div className="ingredients-list">
                          <label><input type="checkbox" defaultChecked /> Dana köftesi</label>
                          <label><input type="checkbox" defaultChecked /> Karamelize soğan</label>
                          <label><input type="checkbox" defaultChecked /> Turşu</label>
                        </div>
                        <button className="big-add-btn" onClick={(e) => { addToCart(product, e); setExpandedProductId(null); }}>
                          Sepete Ekle
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ÖNERİLENLER SEKMESİ */}
      {activeTab === 'recommended' && (
        <Recommended 
          products={recommendedProducts}
          expandedProductId={expandedProductId}
          toggleProduct={toggleProduct}
          addToCart={addToCart}
          setExpandedProductId={setExpandedProductId}
        />
      )}

      {/* 3. SEPET SEKMESİ */}
      {activeTab === 'cart' && (
        <div className="cart-tab-content">
          <div className="menu-intro">
            <span className="since-text">SİPARİŞ</span>
            <h1 className="menu-title-main">Sepet</h1>
            <p className="menu-desc">Siparişi gönderdiğinizde ürünler fiş olarak burada kalır.</p>
          </div>

          {/* 1. SEPET KARTI (Gönderilmemiş Ürünler) */}
          <div className="order-card">
            {cart.length === 0 ? (
              <div className="empty-cart-text">Sepetiniz boş.</div>
            ) : (
              <div className="cart-item-list">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item-row">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-time">Hazırlama: 15 dk</div>
                    </div>
                    <div className="cart-item-price">{item.price} TL</div>
                  </div>
                ))}
              </div>
            )}

            <div className="dashed-divider"></div>

            <div className="cart-total-row">
              <span>Toplam</span>
              <span className="cart-total-price">{cartTotal.toFixed(2)} TL</span>
            </div>

            <button className="big-add-btn" onClick={handleSendOrder}>Siparişi Gönder</button>
            <button className="big-danger-btn" onClick={() => setCart([])}>Sepeti Temizle</button>
          </div>

          {/* 2. MASA ADİSYONU (Tüm Siparişlerin Tek Fişte Birleşimi) */}
          {orders.length > 0 && (
            <div className="order-card receipt-card">
              <h3 className="section-title">MASA ADİSYONU</h3>
              <div className="receipt-header">
                <span className="receipt-no">Açık Hesap <span className="badge-new" style={{backgroundColor: '#b9332c', color: 'white'}}>Ödenmedi</span></span>
              </div>
              
              <div className="cart-item-list">
                {/* Bütün siparişleri tek bir fişin içinde gruplayarak listeliyoruz */}
                {orders.map((order) => (
                  <div key={order.id} style={{ marginBottom: '15px' }}>
                    
                    {/* Sipariş Zamanı / Numarası (Adisyondaki kesik çizgiler gibi düşün) */}
                    <div style={{ fontSize: '11px', color: '#FFC107', marginBottom: '8px', borderBottom: '1px solid #2a2a2a', paddingBottom: '4px' }}>
                      SİPARİŞ #{order.id}
                    </div>
                    
                    {/* O siparişin içindeki ürünler */}
                    {order.items && order.items.map((orderItem, index) => (
                      <div key={index} className="cart-item-row" style={{ marginBottom: '6px' }}>
                        <div className="cart-item-name" style={{fontWeight: 'normal'}}>
                          {orderItem.quantity}x {orderItem.product?.name}
                        </div>
                        <div className="cart-item-price" style={{color: '#ccc'}}>
                          {(orderItem.product?.price * orderItem.quantity).toFixed(2)} TL
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="dashed-divider"></div>

              {/* Tüm siparişlerin Genel Toplamını hesaplıyoruz */}
              <div className="cart-total-row">
                <span>Genel Toplam</span>
                <span className="cart-total-price">
                  {orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)} TL
                </span>
              </div>

              <button className="big-success-btn">Hesabı Ödemeye Geliyorum</button>
            </div>
          )}

        </div>
      )}

      {/* ALT NAVİGASYON BARI */}
      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          MENÜ
        </div>
        
        {/* Önerilenler Tek Butonda Birleşti */}
        <div className={`nav-item ${activeTab === 'recommended' ? 'active' : ''}`} onClick={() => setActiveTab('recommended')}>
          ÖNERİLENLER
        </div>
        
        <div className={`nav-item cart-nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
          SEPET
          {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </div>
      </nav>

    </div>
  );
}

export default Menu;