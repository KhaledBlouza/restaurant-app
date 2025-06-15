import './App.css';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Check, Leaf, 
  Sparkles, ArrowLeft, Clock, Star, ChefHat, Award,
  MapPin, Heart, Info, X, Menu, 
  Phone, Mail, Instagram, Facebook
} from 'lucide-react';

// Configuration API
const API_URL = 'http://localhost:5000/api';

// Context pour le panier
const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const addToCart = (dish) => {
    const existingItem = cart.find(item => item._id === dish._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
  if (quantity < 1) {
    return; // Don't allow quantity to go below 1
  }
  
  setCart(cart.map(item =>
    item._id === id ? { ...item, quantity } : item
  ));
};

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (dishId) => {
    if (favorites.includes(dishId)) {
      setFavorites(favorites.filter(id => id !== dishId));
    } else {
      setFavorites([...favorites, dishId]);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, updateQuantity, removeFromCart, getTotalPrice, clearCart,
      favorites, toggleFavorite 
    }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

// Composant Loading Skeleton
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3, 4, 5, 6].map((n) => (
      <div key={n} className="skeleton-card">
        <div className="skeleton-img"></div>
        <div className="skeleton-content">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-subtitle"></div>
          <div className="skeleton-text skeleton-description"></div>
          <div className="flex justify-between items-center mt-4">
            <div className="skeleton-text skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Composant Mobile Menu
const MobileMenu = ({ isOpen, onClose, onCategorySelect, categories }) => (
  <div className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
    <div className={`mobile-menu ${isOpen ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="mobile-menu-header">
        <h2 className="font-playfair text-xl font-bold text-emerald-900">Menu</h2>
        <button onClick={onClose} className="close-button">
          <X size={24} />
        </button>
      </div>
      <div className="mobile-menu-content">
        <button
          onClick={() => {
            onCategorySelect(null);
            onClose();
          }}
          className="mobile-menu-item"
        >
          <ChefHat size={20} />
          Toutes les collections
        </button>
        {categories.map(category => (
          <button
            key={category._id}
            onClick={() => {
              onCategorySelect(category);
              onClose();
            }}
            className="mobile-menu-item"
          >
            <Leaf size={20} />
            {category.name}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// Composant Footer
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-section">
        <div className="footer-logo">
          <div className="logo-container">
            <div className="logo-inner gradient-emerald">
              <Leaf className="text-white" size={20} />
            </div>
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-white">Nutra Saveurs</h3>
            <p className="text-sm text-emerald-100">Epices qui soignent , recette qui ravissent</p>
          </div>
        </div>
        <p className="footer-description">
          Une expérience culinaire unique où chaque plat raconte l'histoire des épices rares et des herbes aromatiques.
        </p>
      </div>
      
      <div className="footer-section">
        <h4 className="footer-title">Contact</h4>
        <div className="footer-contact">
          <div className="contact-item">
            <Phone size={16} />
            <span>+216 92710044</span>
          </div>
          <div className="contact-item">
            <Mail size={16} />
            <span>contact@NutraSaveurs.com</span>
          </div>
          <div className="contact-item">
            <MapPin size={16} />
            <span>123 Rue arome, ariana</span>
          </div>
        </div>
      </div>
      
      <div className="footer-section">
        <h4 className="footer-title">Suivez-nous</h4>
        <div className="social-links">
         <a href="https://instagram.com" className="social-link">
            <Instagram size={20} />
          </a>
          <a href="https://facebook.com" className="social-link">
            <Facebook size={20} />
          </a>
          
        </div>
      </div>
    </div>
    
    <div className="footer-bottom">
      <p>&copy; 2024 Nutra saveurs. Tous droits réservés.</p>
    </div>
  </footer>
);

// Composant principal
function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [error, setError] = useState(null);
  
  const { cart, addToCart, updateQuantity, removeFromCart, getTotalPrice, clearCart, favorites, toggleFavorite } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fonction pour récupérer les catégories depuis l'API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les catégories. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les plats d'une catégorie
  const fetchDishes = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/dishes?category=${categoryId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des plats');
      const data = await response.json();
      setDishes(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les plats.');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedDish(null);
    if (category) {
      fetchDishes(category._id);
    }
  };

  const handleDishClick = async (dishId) => {
    try {
      const response = await fetch(`${API_URL}/dishes/${dishId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement du plat');
      const dish = await response.json();
      setSelectedDish(dish);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les détails du plat.');
    }
  };

  const handleAddToCart = (dish) => {
    addToCart(dish);
    setAddedToCart(dish._id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const handleOrder = async () => {
    try {
      const orderData = {
        items: cart.map(item => ({
          dish: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        total: getTotalPrice()
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Erreur lors de la commande');

      clearCart();
      setShowCart(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      setError('Erreur lors de la validation de la commande.');
    }
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `http://localhost:5000${imagePath}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-gold-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchCategories}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-herb herb-1"></div>
        <div className="floating-herb herb-2"></div>
        <div className="floating-herb herb-3"></div>
        <div className="floating-herb herb-4"></div>
        <div className="floating-herb herb-5"></div>
        <div className="floating-herb herb-6"></div>
        <div className="floating-herb herb-7"></div>
      </div>

      {/* Header */}
      <header className={`header-glass ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="mobile-menu-trigger md:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="header-logo">
            <div className="logo-container">
              <div className="logo-inner gradient-emerald">
                <Leaf className="text-white logo-icon" size={24} />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-emerald-900">
                Nutra Saveurs
              </h1>
              <p className="text-xs text-emerald-700 tracking-widest uppercase">
                Epices qui soignent , recette qui ravissent
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={() => setShowCart(!showCart)}
              className="cart-button"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Panier</span>
              {cartItemsCount > 0 && (
                <span className="cart-badge">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onCategorySelect={handleCategoryClick}
        categories={categories}
      />

      {/* Success Notification */}
      {orderSuccess && (
        <div className="notification-success">
          <div className="notification-icon gradient-emerald">
            <Check className="text-white" size={20} />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Commande confirmée!</p>
            <p className="text-sm text-emerald-600">Votre repas est en préparation</p>
          </div>
        </div>
      )}

      {/* Cart Notification */}
      {addedToCart && (
        <div className="notification-cart">
          <Check size={16} className="text-emerald-600" />
          <span className="text-sm">Ajouté au panier</span>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {!selectedCategory && !selectedDish && (
          <div className="animate-fadeInUp">
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-content">
                <span className="hero-badge">
                  <Award size={16} />
                  Restaurant Étoilé 2024
                </span>
                <h2 className="hero-title font-playfair">
                  Nos Collections <span className="text-gradient">Culinaires</span>
                </h2>
                <p className="hero-description">
                  Découvrez une symphonie de saveurs où chaque plat raconte l'histoire 
                  des épices rares et des herbes aromatiques cultivées dans nos jardins
                </p>
              </div>
            </section>

            {/* Categories Grid */}
            <section className="categories-section">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {categories.map((category, index) => (
                    <div
                      key={category._id}
                      onClick={() => handleCategoryClick(category)}
                      className="category-card"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="category-image-wrapper">
                        {category.image ? (
                          <img
                            src={getImageUrl(category.image)}
                            alt={category.name}
                            className="category-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="category-image bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <ChefHat size={48} className="text-white" />
                          </div>
                        )}
                        <div className="category-overlay">
                          <div className="category-icon">
                            <ChefHat size={32} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="category-content">
                        <h3 className="category-title font-playfair">
                          {category.name}
                        </h3>
                        <p className="category-description">
                          Collection culinaire d'exception
                        </p>
                        <div className="category-meta">
                          <span className="category-tag">
                            <Sparkles size={14} />
                            Collection Premium
                          </span>
                          <span className="category-count">
                            Découvrir
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {selectedCategory && !selectedDish && (
          <div className="animate-fadeInUp">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setDishes([]);
                }}
                className="breadcrumb-link"
              >
                <ArrowLeft size={16} />
                Collections
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{selectedCategory.name}</span>
            </nav>

            {/* Category Header */}
            <div className="category-header">
              <div className="category-header-content">
                <h2 className="category-header-title font-playfair">
                  {selectedCategory.name}
                </h2>
                <p className="category-header-description">
                  Une sélection raffinée de nos meilleures créations
                </p>
              </div>
            </div>

            {/* Dishes Grid */}
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {dishes.map((dish, index) => (
                  <div
                    key={dish._id}
                    className="dish-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="dish-image-wrapper">
                      {dish.image ? (
                        <img
                          src={getImageUrl(dish.image)}
                          alt={dish.name}
                          className="dish-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="dish-image bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <ChefHat size={32} className="text-white" />
                        </div>
                      )}
                      <button
                        className={`favorite-button ${favorites.includes(dish._id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dish._id);
                        }}
                      >
                        <Heart size={18} />
                      </button>
                      <div className="dish-badges">
                        <span className="badge-new">Nouveau</span>
                        <span className="badge-bio">
                          <Leaf size={12} />
                          Bio
                        </span>
                      </div>
                    </div>
                    <div className="dish-content">
                      <h3 className="dish-title font-playfair">
                        {dish.name}
                      </h3>
                      <p className="dish-description">
                        {dish.description}
                      </p>
                      <div className="dish-footer">
                        <div className="price-section">
                          <span className="price-value">{Number(dish.price).toFixed(2)}TND</span>
                          <span className="price-label">par assiette</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(dish);
                          }}
                          className={`add-to-cart-btn ${addedToCart === dish._id ? 'added' : ''}`}
                        >
                          {addedToCart === dish._id ? (
                            <Check size={20} />
                          ) : (
                            <Plus size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDishClick(dish._id)}
                      className="dish-view-details"
                    >
                      <Info size={16} />
                      Voir les détails
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDish && (
          <div className="dish-detail-container animate-fadeInUp">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setDishes([]);
                  setSelectedDish(null);
                }}
                className="breadcrumb-link"
              >
                <ArrowLeft size={16} />
                Collections
              </button>
              <span className="breadcrumb-separator">/</span>
              <button
                onClick={() => setSelectedDish(null)}
                className="breadcrumb-link"
              >
                {selectedCategory?.name}
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{selectedDish.name}</span>
            </nav>

            {/* Dish Detail */}
            <div className="dish-detail-card">
              <div className="dish-detail-grid">
                <div className="dish-detail-image-wrapper">
                  {selectedDish.image ? (
                    <img
                      src={getImageUrl(selectedDish.image)}
                      alt={selectedDish.name}
                      className="dish-detail-image"
                    />
                  ) : (
                    <div className="dish-detail-image bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <ChefHat size={64} className="text-white" />
                    </div>
                  )}
                  <div className="image-badges">
                    <span className="badge-premium-large">
                      <Star size={16} />
                      Création du Chef
                    </span>
                  </div>
                </div>
                
                <div className="dish-detail-content">
                  <div className="detail-header">
                    <h2 className="detail-title font-playfair">
                      {selectedDish.name}
                    </h2>
                    <button
                      className={`favorite-button-large ${favorites.includes(selectedDish._id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(selectedDish._id)}
                    >
                      <Heart size={24} />
                    </button>
                  </div>
                  
                  <div className="detail-tags">
                    <span className="detail-tag">
                      <Clock size={16} />
                      Préparation 25 min
                    </span>
                    <span className="detail-tag">
                      <Leaf size={16} />
                      100% Bio
                    </span>
                    <span className="detail-tag">
                      <MapPin size={16} />
                      Produits locaux
                    </span>
                  </div>

                  <div className="detail-description">
                    <h3 className="detail-section-title">Description</h3>
                    <p className="detail-text">
                      {selectedDish.description || 'Une création culinaire d\'exception, préparée avec passion et les meilleurs ingrédients.'}
                    </p>
                  </div>

                  <div className="detail-ingredients">
                    <h3 className="detail-section-title">Ingrédients principaux</h3>
                    <div className="ingredients-grid">
                      <span className="ingredient-chip">Basilic frais</span>
                      <span className="ingredient-chip">Safran d'Iran</span>
                      <span className="ingredient-chip">Cardamome verte</span>
                      <span className="ingredient-chip">Fleur de sel</span>
                    </div>
                  </div>

                  <div className="detail-footer">
                    <div className="price-section-large">
                      <span className="price-label-large">Prix par assiette</span>
                      <span className="price-value-large">
                        {Number(selectedDish.price).toFixed(2)}TND
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleAddToCart(selectedDish);
                        setSelectedDish(null);
                      }}
                      className="add-to-cart-large"
                    >
                      <Plus size={24} />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <div className={`cart-overlay ${showCart ? 'active' : ''}`} onClick={() => setShowCart(false)}>
        <div className={`cart-sidebar ${showCart ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="cart-header">
            <div>
              <h2 className="cart-title font-playfair">Votre Sélection</h2>
              <p className="cart-subtitle">
                {cartItemsCount} article{cartItemsCount > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowCart(false)}
              className="close-button"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <ShoppingCart size={48} />
                </div>
                <h3 className="empty-cart-title font-playfair">Votre panier est vide</h3>
                <p className="empty-cart-description">
                  Découvrez nos créations culinaires et composez votre menu
                </p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-header">
                      <h3 className="cart-item-name font-playfair">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="remove-button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="cart-item-footer">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="item-total">
                        {(item.price * item.quantity).toFixed(2)}TND
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Sous-total</span>
                  <span>{getTotalPrice().toFixed(2)}TND</span>
                </div>
                <div className="summary-row">
                  <span>Service</span>
                  <span>Inclus</span>
                </div>
                <div className="summary-total">
                  <span className="summary-total-label font-playfair">Total</span>
                  <span className="summary-total-value">
                    {getTotalPrice().toFixed(2)}TND
                  </span>
                </div>
              </div>
              <button
                onClick={handleOrder}
                className="checkout-button"
              >
                <span>Valider la commande</span>
                <ArrowLeft size={20} className="rotate-180" />
              </button>
              <p className="security-note">
                <Check size={14} />
                Paiement sécurisé • Service premium garanti
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function RestaurantApp() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}