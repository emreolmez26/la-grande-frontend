import React from 'react';

function Recommended({ products, expandedProductId, toggleProduct, addToCart, setExpandedProductId }) {
  return (
    <div className="recommended-tab-content">
      <div className="menu-intro">
        <span className="since-text">BOT SEÇİMİ</span>
        <h1 className="menu-title-main">Önerilenler</h1>
        <p className="menu-desc">Menüden otomatik seçilen yiyecek ve içecek önerileri.</p>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card" onClick={() => toggleProduct(product.id)}>
            <div className="product-image-placeholder">
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : "🔥"}
            </div>
            <div className="product-card-body">
              <h4 className="product-name">{product.name}</h4>
              <div className="product-price">{product.price} TL</div>
              <div className="product-time">Tahmini hazırlama: 15 dk</div>
            </div>
            
            {/* Tıklanınca Açılan Detay Alanı */}
            {expandedProductId === product.id && (
              <div className="product-expanded-area" onClick={(e) => e.stopPropagation()}>
                <p className="product-inner-desc">{product.description || "Botumuzun sizin için özel seçimi!"}</p>
                <button 
                  className="big-add-btn" 
                  onClick={(e) => { 
                    addToCart(product, e); 
                    setExpandedProductId(null); 
                  }}
                >
                  Sepete Ekle
                </button>
              </div>
            )}
          </div>
        ))}
        
        {products.length === 0 && (
          <p style={{color: '#888', padding: '0 20px'}}>Şu an için bir öneri bulunamıyor.</p>
        )}
      </div>
    </div>
  );
}

export default Recommended;