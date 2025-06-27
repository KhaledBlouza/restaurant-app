import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Edit2, Trash2, Upload, Leaf, Calendar, Image, FileText,
  ChefHat, ShoppingBag, TrendingUp, DollarSign, Package, Sparkles,
  Plus, Search, Filter, MoreVertical, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import './AdminDashboard.css';

const API_URL = 'https://restaurant-app-production-f41b.up.railway.app/api';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: null });
  const [dishForm, setDishForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '', 
    image: null 
  });

  useEffect(() => {
    fetchCategories();
    fetchDishes();
    fetchOrders();
    fetchStatistics(statsPeriod);
  }, []);

  useEffect(() => {
    fetchStatistics(statsPeriod);
  }, [statsPeriod]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Impossible de charger les catégories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/dishes`);
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Impossible de charger les plats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Impossible de charger les commandes', 'error');
    }
  };

  const fetchStatistics = async (period) => {
    try {
      const response = await fetch(`${API_URL}/statistics?period=${period}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Impossible de charger les statistiques', 'error');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', categoryForm.name);
    if (categoryForm.image) {
      formData.append('image', categoryForm.image);
    }
    
    try {
      setIsLoading(true);
      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory._id}`
        : `${API_URL}/categories`;
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        body: formData
      });
      
      if (response.ok) {
        await fetchCategories();
        setCategoryForm({ name: '', image: null });
        setEditingCategory(null);
        showToast(editingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Une erreur s\'est produite lors de la sauvegarde', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        await fetchCategories();
        await fetchDishes();
        showToast('Catégorie supprimée avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        showToast('Impossible de supprimer la catégorie', 'error');
      }
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', dishForm.name);
    formData.append('description', dishForm.description);
    formData.append('price', dishForm.price);
    formData.append('category', dishForm.category);
    if (dishForm.image) {
      formData.append('image', dishForm.image);
    }
    
    try {
      setIsLoading(true);
      const url = editingDish
        ? `${API_URL}/dishes/${editingDish._id}`
        : `${API_URL}/dishes`;
      const response = await fetch(url, {
        method: editingDish ? 'PUT' : 'POST',
        body: formData
      });
      
      if (response.ok) {
        await fetchDishes();
        setDishForm({ name: '', description: '', price: '', category: '', image: null });
        setEditingDish(null);
        showToast(editingDish ? 'Plat modifié avec succès' : 'Plat créé avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Une erreur s\'est produite lors de la sauvegarde', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDish = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      try {
        await fetch(`${API_URL}/dishes/${id}`, { method: 'DELETE' });
        await fetchDishes();
        showToast('Plat supprimé avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        showToast('Impossible de supprimer le plat', 'error');
      }
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchOrders();
      showToast('Statut de la commande mis à jour');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Impossible de mettre à jour le statut', 'error');
    }
  };

  const COLORS = ['#047857', '#059669', '#F59E0B', '#E5C17C', '#B08D57'];

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigationTabs = [
    { key: 'dashboard', icon: TrendingUp, label: 'Tableau de bord', color: '#2563eb' },
    { key: 'categories', icon: FileText, label: 'Collections', color: '#10b981' },
    { key: 'dishes', icon: ChefHat, label: 'Menu', color: '#f59e0b' },
    { key: 'orders', icon: ShoppingBag, label: 'Commandes', color: '#8b5cf6' }
  ];

  return (
    <div className="min-h-screen bg-background bg-texture">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Leaf className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">Nutra Saveurs</h1>
                <p className="text-sm text-muted-foreground font-serif">Administration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span className="hidden sm:inline">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass border-b border-border/50 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {navigationTabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`${
                    activeTab === tab.key ? 'nav-tab-active' : 'nav-tab-inactive'
                  } animate-slide-in-right whitespace-nowrap`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={18} className={activeTab === tab.key ? '' : ''} style={{ color: activeTab === tab.key ? 'white' : tab.color }} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && statistics && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-display text-display-sm text-primary mb-2">Tableau de bord</h2>
              <p className="text-muted-foreground font-serif">
                Analyse des performances et insights de votre restaurant
              </p>
            </div>

            {/* Statistics Period Selector */}
            <div className="flex gap-2">
              {[
                { key: 'day', label: 'Aujourd\'hui' },
                { key: 'week', label: 'Cette semaine' },
                { key: 'month', label: 'Ce mois' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setStatsPeriod(period.key)}
                  className={`${
                    statsPeriod === period.key ? 'btn-primary' : 'btn-ghost'
                  } text-sm`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-elevated p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <ShoppingBag className="text-blue-600" size={24} />
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Commandes totales</p>
                  <p className="text-2xl font-bold text-primary mt-1">{statistics.totalOrders}</p>
                </div>
              </div>

              <div className="card-elevated p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="text-emerald-600" size={24} />
                  </div>
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Revenus totaux</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{statistics.totalRevenue.toFixed(2)} TND</p>
                </div>
              </div>

              <div className="card-elevated p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="text-amber-600" size={24} />
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Panier moyen</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {statistics.totalOrders > 0 ? (statistics.totalRevenue / statistics.totalOrders).toFixed(2) : '0.00'} TND
                  </p>
                </div>
              </div>

              <div className="card-elevated p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Package className="text-purple-600" size={24} />
                  </div>
                  <span className="text-2xl">🍽️</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Plats vendus</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {statistics.topDishes.reduce((sum, dish) => sum + dish.count, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card-elevated p-6">
                <h3 className="font-display text-xl font-semibold text-primary mb-6">Plats les plus populaires</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.topDishes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dish" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statistics.topDishes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card-elevated p-6">
                <h3 className="font-display text-xl font-semibold text-primary mb-6">Répartition des revenus</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.topDishes}
                      dataKey="revenue"
                      nameKey="dish"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statistics.topDishes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} TND`, 'Revenus']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-display-sm text-primary mb-2">Collections culinaires</h2>
                <p className="text-muted-foreground font-serif">
                  Organisez vos créations par univers d'épices et ambiances
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Category Form */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-accent flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h3 className="font-display text-xl font-semibold text-primary">
                  {editingCategory ? 'Modifier la collection' : 'Nouvelle collection'}
                </h3>
              </div>
              
              <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-foreground mb-2">
                    Nom de la collection <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Ex: Délices aux épices orientales"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-foreground mb-2">Image de couverture</label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.files?.[0] || null })}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="btn-secondary flex items-center gap-2 justify-center w-full">
                      <Upload size={16} />
                      {categoryForm.image ? categoryForm.image.name : "Choisir une image"}
                    </div>
                  </label>
                </div>
                
                <div className="lg:col-span-2 flex gap-3 pt-4">
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enregistrement...
                      </div>
                    ) : (
                      editingCategory ? 'Enregistrer les modifications' : 'Créer la collection'
                    )}
                  </button>
                  
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', image: null });
                      }}
                      className="btn-ghost"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => (
                <div 
                  key={category._id} 
                  className="card-elevated group hover:shadow-large transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    {category.image ? (
                      <img
                        src={`${API_URL.replace('/api', '')}${category.image}`}
                        alt={category.name}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 rounded-t-2xl flex items-center justify-center">
                        <Image size={48} className="text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryForm({ name: category.name, image: null });
                          }}
                          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Edit2 size={14} className="text-primary" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-display text-lg font-semibold text-primary mb-2">{category.name}</h4>
                    <p className="text-sm text-muted-foreground font-serif">Collection culinaire</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dishes Tab */}
        {activeTab === 'dishes' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-display-sm text-primary mb-2">Menu gastronomique</h2>
                <p className="text-muted-foreground font-serif">
                  Composez votre carte avec passion et poésie des saveurs
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Dish Form */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-accent flex items-center justify-center">
                  <ChefHat className="text-white" size={20} />
                </div>
                <h3 className="font-display text-xl font-semibold text-primary">
                  {editingDish ? 'Modifier la création' : 'Nouvelle création culinaire'}
                </h3>
              </div>
              
              <form onSubmit={handleDishSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-foreground mb-2">
                    Nom du plat <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Ex: Risotto aux truffes et parmesan"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-foreground mb-2">
                    Prix (TND) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="form-input"
                    placeholder="29.90"
                    required
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block font-semibold text-foreground mb-2">Description poétique</label>
                  <textarea
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    className="form-textarea"
                    rows={4}
                    placeholder="Une symphonie de saveurs où se mêlent délicatesse et raffinement..."
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-foreground mb-2">
                    Collection <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Sélectionner une collection</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold text-foreground mb-2">Photographie</label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => setDishForm({ ...dishForm, image: e.target.files?.[0] || null })}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="btn-secondary flex items-center gap-2 justify-center w-full">
                      <Upload size={16} />
                      {dishForm.image ? dishForm.image.name : "Choisir une image"}
                    </div>
                  </label>
                </div>
                
                <div className="lg:col-span-2 flex gap-3 pt-4">
                  <button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enregistrement...
                      </div>
                    ) : (
                      editingDish ? 'Enregistrer les modifications' : 'Créer le plat'
                    )}
                  </button>
                  
                  {editingDish && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDish(null);
                        setDishForm({ name: '', description: '', price: '', category: '', image: null });
                      }}
                      className="btn-ghost"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Dishes List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDishes.map((dish, index) => (
                <div 
                  key={dish._id} 
                  className="card-elevated group hover:shadow-large transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-4 p-6">
                    <div className="relative flex-shrink-0">
                      {dish.image ? (
                        <img
                          src={`${API_URL.replace('/api', '')}${dish.image}`}
                          alt={dish.name}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center">
                          <ChefHat size={24} className="text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-lg font-semibold text-primary truncate">{dish.name}</h4>
                        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => {
                              setEditingDish(dish);
                              setDishForm({
                                name: dish.name,
                                description: dish.description,
                                price: dish.price.toString(),
                                category: dish.category._id,
                                image: null
                              });
                            }}
                            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                          >
                            <Edit2 size={14} className="text-primary" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteDish(dish._id)}
                            className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground font-serif mb-1">{dish.category?.name}</p>
                      {dish.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{dish.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl font-bold text-accent">{Number(dish.price).toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-display text-display-sm text-primary mb-2">Gestion des commandes</h2>
              <p className="text-muted-foreground font-serif">
                Visualisez, validez et suivez vos commandes clients en temps réel
              </p>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="card-elevated p-12 text-center">
                  <ShoppingBag size={48} className="text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold text-muted-foreground mb-2">Aucune commande</h3>
                  <p className="text-muted-foreground">Les commandes apparaîtront ici une fois reçues.</p>
                </div>
              ) : (
                orders.map((order, index) => (
                  <div 
                    key={order._id} 
                    className="card-elevated hover:shadow-large transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="font-display text-2xl font-bold text-accent">{order.total.toFixed(2)} TND</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {order.status === 'traitée' ? (
                            <span className="badge-success flex items-center gap-2">
                              <CheckCircle size={14} />
                              Traitée
                            </span>
                          ) : (
                            <>
                              <span className="badge-warning flex items-center gap-2">
                                <Clock size={14} />
                                En attente
                              </span>
                              <button
                                onClick={() => handleOrderStatus(order._id, 'traitée')}
                                className="btn-primary text-sm"
                              >
                                Marquer comme traitée
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t border-border pt-4">
                        <h4 className="font-semibold text-foreground mb-3">Détails de la commande</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                  {item.quantity}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {item.dish?.name || 'Plat supprimé'}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {(item.price * item.quantity).toFixed(2)} TND
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;