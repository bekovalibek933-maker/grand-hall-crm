import React, { useState, useEffect } from 'react';
import { 
  Calendar, LayoutDashboard, Users, Wallet, Settings, PlusCircle, Bell, Search,
  Menu, X, TrendingUp, CheckCircle, Clock, ArrowLeft, Save, Plus, Trash2,
  Calculator, User, Phone, ChevronLeft, ChevronRight, 
  Shield, Star, ChevronDown, ChevronUp,
  LogOut, Lock, UserCircle, Key, AlertTriangle, DollarSign, Download, Upload, Printer
} from 'lucide-react';

const initialBookings = [];
const initialCompanyExpenses = [];
const initialNotifications = [];

const defaultCredentials = { manager: 'admin123', boshliq: 'boss123' };
const defaultCompanyInfo = { name: "Grand Hall", phone: "+998 90 123 45 67" };

const eventCategories = ["Nikoh to'yi", "Sunnat to'yi", "Nahorgi osh", "Qiz bazmi", "Kechki tadbir", "Tug'ilgan kun", "Yubiley", "Boshqa"];

export default function ToyxonaCRM() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [currentUserRole, setCurrentUserRole] = useState('manager'); 

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('crm_company_info');
    return saved ? JSON.parse(saved) : defaultCompanyInfo;
  });
  useEffect(() => localStorage.setItem('crm_company_info', JSON.stringify(companyInfo)), [companyInfo]);

  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('crm_credentials');
    return saved ? JSON.parse(saved) : defaultCredentials;
  });
  useEffect(() => localStorage.setItem('crm_credentials', JSON.stringify(credentials)), [credentials]);
  
  const [passwordsForm, setPasswordsForm] = useState(credentials);

  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('crm_exchange_rate');
    return saved ? parseFloat(saved) : 12650;
  });
  useEffect(() => localStorage.setItem('crm_exchange_rate', exchangeRate.toString()), [exchangeRate]);

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('crm_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });
  useEffect(() => localStorage.setItem('crm_bookings', JSON.stringify(bookings)), [bookings]);

  const [companyExpenses, setCompanyExpenses] = useState(() => {
    const saved = localStorage.getItem('crm_company_expenses');
    return saved ? JSON.parse(saved) : initialCompanyExpenses;
  });
  useEffect(() => localStorage.setItem('crm_company_expenses', JSON.stringify(companyExpenses)), [companyExpenses]);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('crm_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });
  useEffect(() => localStorage.setItem('crm_notifications', JSON.stringify(notifications)), [notifications]);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [sysNotifPermission, setSysNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date()); 

  const [newCompExp, setNewCompExp] = useState({ title: '', amount: '', currency: 'UZS' });
  const [expandedFinanceId, setExpandedFinanceId] = useState(null);

  const initialFormState = {
    clientName: '', clientPhone: '', clientAddress: '', eventCategory: 'Nikoh to\'yi', eventDate: '', eventTypes: [],
    orderPrice: '', orderPriceCurr: 'UZS',
    advancePayment: '', advancePaymentCurr: 'UZS',
    additionalServices: '', additionalServicesCurr: 'UZS',
    expElectricity: '', expElectricityCurr: 'UZS',
    expChef: '', expChefCurr: 'UZS',
    expWorkers: '', expWorkersCurr: 'UZS',
    expSamovar: '', expSamovarCurr: 'UZS',
    otherExpenses: []
  };
  const [formData, setFormData] = useState(initialFormState);

  const formatNumber = (num) => parseInt(num?.toString().replace(/\D/g, '')) || 0;
  
  const formatUZS = (num) => new Intl.NumberFormat('uz-UZ').format(Math.round(num)) + ' UZS';
  const formatUSD = (num) => '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);

  const formatDualCurrency = (num) => {
    const uzs = parseInt(num?.toString().replace(/\D/g, '')) || 0;
    const rate = Math.max(1, exchangeRate);
    const usd = uzs / rate;
    return `${new Intl.NumberFormat('uz-UZ').format(uzs)} UZS ($${usd.toLocaleString('en-US', {maximumFractionDigits: 1})})`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['orderPrice', 'advancePayment', 'additionalServices', 'expElectricity', 'expChef', 'expWorkers', 'expSamovar'].includes(name)) {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addOtherExpense = () => setFormData({ ...formData, otherExpenses: [...formData.otherExpenses, { id: Date.now(), name: '', amount: '', currency: 'UZS' }] });
  const updateOtherExpense = (id, field, value) => {
    setFormData({ ...formData, otherExpenses: formData.otherExpenses.map(exp => exp.id === id ? { ...exp, [field]: field === 'amount' ? value.replace(/\D/g, '') : value } : exp) });
  };
  const removeOtherExpense = (id) => setFormData({ ...formData, otherExpenses: formData.otherExpenses.filter(exp => exp.id !== id) });

  const getLiveValues = (amountStr, currency) => {
    const num = formatNumber(amountStr);
    const rate = Math.max(1, exchangeRate);
    if (currency === 'USD') {
      return { uzs: num * rate, usd: num };
    } else {
      return { uzs: num, usd: num / rate };
    }
  };

  const orderPriceValues = getLiveValues(formData.orderPrice, formData.orderPriceCurr);
  const additionalServicesValues = getLiveValues(formData.additionalServices, formData.additionalServicesCurr);
  const totalIncomeUZS = orderPriceValues.uzs + additionalServicesValues.uzs;
  const totalIncomeUSD = orderPriceValues.usd + additionalServicesValues.usd;

  const expElectricityValues = getLiveValues(formData.expElectricity, formData.expElectricityCurr);
  const expChefValues = getLiveValues(formData.expChef, formData.expChefCurr);
  const expWorkersValues = getLiveValues(formData.expWorkers, formData.expWorkersCurr);
  const expSamovarValues = getLiveValues(formData.expSamovar, formData.expSamovarCurr);
  
  const totalOtherExpensesLive = formData.otherExpenses.reduce((acc, exp) => {
    const vals = getLiveValues(exp.amount, exp.currency);
    return { uzs: acc.uzs + vals.uzs, usd: acc.usd + vals.usd };
  }, { uzs: 0, usd: 0 });

  const totalExpensesUZS = expElectricityValues.uzs + expChefValues.uzs + expWorkersValues.uzs + expSamovarValues.uzs + totalOtherExpensesLive.uzs;
  const totalExpensesUSD = expElectricityValues.usd + expChefValues.usd + expWorkersValues.usd + expSamovarValues.usd + totalOtherExpensesLive.usd;

  const netProfitLiveUZS = totalIncomeUZS - totalExpensesUZS;
  const netProfitLiveUSD = totalIncomeUSD - totalExpensesUSD;

  // FUNKSIYA: Zaxira faylini yuklab olish (Export)
  const handleExportBackup = () => {
    const backupData = {
      bookings,
      companyExpenses,
      companyInfo,
      credentials,
      exchangeRate
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${companyInfo.name}_CRM_Zaxira_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // FUNKSIYA: Zaxira faylidan ma'lumotlarni tiklash (Import)
  const handleImportBackup = (e) => {
    const fileReader = new FileReader();
    if (!e.target.files[0]) return;
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.bookings) {
          setBookings(parsed.bookings);
          setCompanyExpenses(parsed.companyExpenses || []);
          setCompanyInfo(parsed.companyInfo || defaultCompanyInfo);
          setCredentials(parsed.credentials || defaultCredentials);
          setExchangeRate(parsed.exchangeRate || 12650);
          alert("Barcha ma'lumotlar zaxira nusxadan muvaffaqiyatli tiklandi!");
          window.location.reload();
        } else {
          alert("Noto'g'ri zaxira fayli formati!");
        }
      } catch (err) {
        alert("Faylni o'qishda xatolik yuz berdi!");
      }
    };
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    if (username === 'manager' && password === credentials.manager) {
      setCurrentUserRole('manager');
      setIsAuthenticated(true);
      setLoginError('');
    } else if (username === 'boshliq' && password === credentials.boshliq) {
      setCurrentUserRole('viewer');
      setIsAuthenticated(true);
      setLoginError('');
      if (activeTab === 'new_order') setActiveTab('dashboard'); 
    } else {
      setLoginError('Login yoki parol noto\'g\'ri!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
    setActiveTab('dashboard');
  };

  const requestSystemNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    await Notification.requestPermission();
  };

  const handleAddCompanyExpense = () => {
    if (currentUserRole !== 'manager') return;
    if (!newCompExp.title || !newCompExp.amount) return;
    
    const rate = Math.max(1, exchangeRate);
    const num = formatNumber(newCompExp.amount);
    const amountUZS = newCompExp.currency === 'USD' ? num * rate : num;
    const amountUSD = newCompExp.currency === 'USD' ? num : num / rate;

    setCompanyExpenses([...companyExpenses, { 
      id: Date.now(), 
      date: new Date().toISOString().split('T')[0], 
      title: newCompExp.title, 
      amountUZS,
      amountUSD,
      currency: newCompExp.currency,
      originalAmount: num
    }]);
    setNewCompExp({ title: '', amount: '', currency: 'UZS' });
  };

  const handleDeleteBooking = (id, clientName) => {
    if (currentUserRole !== 'manager') return;
    const isConfirmed = window.confirm(`${clientName} ning buyurtmasini rostdan ham bekor qilmoqchimisiz?`);
    if (isConfirmed) {
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  const handleClearMemory = () => {
    const isConfirmed = window.confirm("DIQQAT! Barcha kiritilgan ma'lumotlar o'chib ketadi. Rozimisiz?");
    if (isConfirmed) {
      localStorage.clear();
      window.location.reload(); 
    }
  };

  const handleSaveBooking = () => {
    if (currentUserRole !== 'manager') return;
    if(!formData.clientName || !formData.eventDate) return; 
    if(formData.eventTypes.length === 0) {
      alert("Iltimos, kamida bitta tadbir vaqtini tanlang!");
      return;
    }

    const rate = Math.max(1, exchangeRate);

    const getLockedValues = (amountStr, currency) => {
      const num = formatNumber(amountStr);
      return currency === 'USD' ? { uzs: num * rate, usd: num } : { uzs: num, usd: num / rate };
    };

    const priceVals = getLockedValues(formData.orderPrice, formData.orderPriceCurr);
    const advVals = getLockedValues(formData.advancePayment, formData.advancePaymentCurr);
    const addVals = getLockedValues(formData.additionalServices, formData.additionalServicesCurr);
    const elecVals = getLockedValues(formData.expElectricity, formData.expElectricityCurr);
    const chefVals = getLockedValues(formData.expChef, formData.expChefCurr);
    const workVals = getLockedValues(formData.expWorkers, formData.expWorkersCurr);
    const samVals = getLockedValues(formData.expSamovar, formData.expSamovarCurr);

    const savedOtherExpenses = formData.otherExpenses.map(exp => {
      const eVals = getLockedValues(exp.amount, exp.currency);
      return { ...exp, uzs: eVals.uzs, usd: eVals.usd };
    });

    const otherExpTotalUZS = savedOtherExpenses.reduce((s, e) => s + e.uzs, 0);
    const otherExpTotalUSD = savedOtherExpenses.reduce((s, e) => s + e.usd, 0);

    const bookingIncomeUZS = priceVals.uzs + addVals.uzs;
    const bookingIncomeUSD = priceVals.usd + addVals.usd;
    const bookingExpensesUZS = elecVals.uzs + chefVals.uzs + workVals.uzs + samVals.uzs + otherExpTotalUZS;
    const bookingExpensesUSD = elecVals.usd + chefVals.usd + workVals.usd + samVals.usd + otherExpTotalUSD;

    const newBooking = {
      id: Date.now(),
      date: formData.eventDate,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      eventCategory: formData.eventCategory,
      eventTypes: formData.eventTypes,
      status: 'Tasdiqlangan',
      lockedExchangeRate: rate, 
      
      incomeUZS: bookingIncomeUZS,
      incomeUSD: bookingIncomeUSD,
      expensesUZS: bookingExpensesUZS,
      expensesUSD: bookingExpensesUSD,
      advanceUZS: advVals.uzs,
      advanceUSD: advVals.usd,
      
      orderPriceUZS: priceVals.uzs,
      orderPriceUSD: priceVals.usd,
      additionalServicesUZS: addVals.uzs,
      additionalServicesUSD: addVals.usd,
      
      expElectricityUZS: elecVals.uzs,
      expElectricityUSD: elecVals.usd,
      expChefUZS: chefVals.uzs,
      expChefUSD: chefVals.usd,
      expWorkersUZS: workVals.uzs,
      expWorkersUSD: workVals.usd,
      expSamovarUZS: samVals.uzs,
      expSamovarUSD: samVals.usd,
      otherExpenses: savedOtherExpenses
    };

    setBookings([...bookings, newBooking].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setFormData(initialFormState);
    setActiveTab('dashboard');
  };

  const navItems = [
    { id: 'dashboard', label: 'Asosiy panel', icon: LayoutDashboard },
    ...(currentUserRole === 'manager' ? [{ id: 'new_order', label: 'Yangi Buyurtma', icon: PlusCircle }] : []),
    { id: 'calendar', label: 'Taqvim va Bron', icon: Calendar },
    { id: 'finance', label: 'Moliya va Hisob', icon: Wallet },
    { id: 'crm', label: 'Mijozlar (CRM)', icon: Users },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  const Sidebar = () => (
    <div className={`bg-slate-900 text-white w-64 flex-shrink-0 fixed h-full z-30 transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col shadow-xl print:hidden`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{companyInfo.name}</h1>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mt-1">CRM System</span>
        </div>
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>
      <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={20} className={`mr-3 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${currentUserRole === 'manager' ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : 'bg-gradient-to-tr from-emerald-500 to-teal-500'}`}>
               {currentUserRole === 'manager' ? 'M' : 'B'}
             </div>
             <div className="text-left">
               <p className="text-sm font-medium text-white leading-tight">{currentUserRole === 'manager' ? 'Menejer' : 'Boshliq'}</p>
               <p className="text-[10px] text-slate-400 uppercase tracking-wider">{currentUserRole === 'manager' ? 'To\'liq huquq' : 'Kuzatuvchi'}</p>
             </div>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors">
             <LogOut size={18}/>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const totalExpectedUZS = bookings.reduce((sum, b) => sum + b.incomeUZS, 0);
    const totalExpectedUSD = bookings.reduce((sum, b) => sum + b.incomeUSD, 0);
    const activeOrders = bookings.length;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Oylik Kutilayotgan Tushum</p>
                <h3 className="text-xl font-bold text-slate-800">{formatUZS(totalExpectedUZS)}</h3>
                <p className="text-sm text-green-600 font-bold mt-1">{formatUSD(totalExpectedUSD)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl text-green-600"><TrendingUp size={24} /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Faol Buyurtmalar</p>
                <h3 className="text-2xl font-bold text-slate-800">{activeOrders} ta</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Calendar size={24} /></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 font-medium mb-1 text-sm">Joriy Holat</p>
                <h3 className="text-xl font-bold">Faoliyat jarayonida</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl text-white backdrop-blur-sm"><Clock size={24} /></div>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-500/30">
              <p className="text-sm text-indigo-100">Keyingi tadbir: <span className="font-bold text-white">{bookings[0]?.date || 'Hozircha yo\'q'}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Yaqin oradagi tadbirlar</h2>
            <button onClick={() => setActiveTab('calendar')} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">Barchasini ko'rish</button>
          </div>
          <div className="overflow-x-auto">
            {bookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Hozircha kiritilgan tadbirlar yo'q</div>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Sana & Vaqt</th>
                  <th className="px-6 py-4 font-semibold">Mijoz / Tadbir</th>
                  <th className="px-6 py-4 font-semibold">Holati</th>
                  <th className="px-6 py-4 font-semibold">Moliya (Kirim)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700 divide-y divide-slate-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-slate-700 border border-slate-200">
                          <span className="text-xs font-medium uppercase">{new Date(booking.date).toLocaleString('uz-UZ', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{new Date(booking.date).getDate()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{booking.date}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {booking.eventTypes.map(t => (
                              <span key={t} className="text-indigo-600 font-medium text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{booking.clientName.charAt(0)}</div>
                        <div>
                          <span className="font-bold text-slate-800 block">{booking.clientName}</span>
                          <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><Star size={10} className="text-amber-400"/> {booking.eventCategory}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200`}>
                        <CheckCircle size={14} /> {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-900">{formatUZS(booking.incomeUZS)}</span>
                      <span className="text-green-600 text-xs font-bold">{formatUSD(booking.incomeUSD)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
    
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, bookings: bookings.filter(b => b.date === dateStr) });
    }

    const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Calendar size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Taqvim va Bandlik</h2>
              <p className="text-sm text-slate-500">Telefon va kompyuter vaqtiga moslashgan jonli taqvim</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronLeft size={20} className="text-slate-600"/></button>
            <span className="font-bold text-slate-800 min-w-[120px] text-center">{monthNames[month]} {year}</span>
            <button onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronRight size={20} className="text-slate-600"/></button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map(d => (
              <div key={d} className="text-center font-bold text-slate-400 uppercase text-xs tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {days.map((dayObj, idx) => (
              <div key={idx} className={`min-h-[100px] p-2 rounded-xl border ${dayObj ? 'bg-white border-slate-100 hover:border-indigo-300 transition-colors' : 'bg-slate-50/50 border-transparent'} relative flex flex-col`}>
                {dayObj && (
                  <>
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${dayObj.bookings.length > 0 ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                      {dayObj.day}
                    </span>
                    <div className="space-y-1 flex-1">
                      {dayObj.bookings.map(b => (
                        <div key={b.id} className="text-[10px] p-1.5 rounded leading-tight font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 mb-1">
                          <span className="block truncate font-bold">{b.clientName.split(' ')[0]}</span>
                          <div className="flex flex-col gap-0.5 mt-0.5 opacity-80">
                             {b.eventTypes.map(t => <span key={t}>- {t}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleSavePasswords = () => {
      setCredentials(passwordsForm);
      alert("Parollar muvaffaqiyatli o'zgartirildi!"); 
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><Settings size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tizim Sozlamalari</h2>
            <p className="text-sm text-slate-500">Xavfsizlik va zaxira nusxa boshqaruvi</p>
          </div>
        </div>
        
        {/* YANGI: Zaxira nusxa yaratish bloki (Backup Section) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Shield size={20} className="text-indigo-500" /> Ma'lumotlar himoyasi (Zaxira nusxa)
          </h3>
          <p className="text-sm text-slate-500 mb-4">Viruslar, qurilma buzilishi yoki kesh tozalanishidan himoyalanish uchun kunlik zaxira faylini yuklab oling.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleExportBackup} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition-colors shadow-sm">
              <Download size={18}/> Zaxira faylini yuklab olish
            </button>
            <label className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl transition-colors shadow-sm cursor-pointer text-center">
              <Upload size={18}/> Zaxirani qayta tiklash
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">To'yxona nomi (Brend)</label>
              <input type="text" disabled={currentUserRole !== 'manager'} value={companyInfo.name} onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Telefon raqam</label>
              <input type="text" disabled={currentUserRole !== 'manager'} value={companyInfo.phone} onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <label className="block text-sm font-bold text-green-800 mb-2 flex items-center gap-1"><DollarSign size={16}/> AQSH Dollari Kursi (1 USD)</label>
              <div className="relative">
                <input type="number" disabled={currentUserRole !== 'manager'} value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)} className="w-full p-3 pr-12 border border-green-300 rounded-xl font-bold text-green-900 bg-white outline-none" />
                <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">UZS</span>
              </div>
            </div>
          </div>

          {currentUserRole === 'manager' && (
            <div className="pt-8 border-t border-slate-100 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Menejer paroli</label>
                  <input type="text" value={passwordsForm.manager} onChange={(e) => setPasswordsForm({...passwordsForm, manager: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Boshliq paroli</label>
                  <input type="text" value={passwordsForm.boshliq} onChange={(e) => setPasswordsForm({...passwordsForm, boshliq: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none" />
                </div>
              </div>
              <button onClick={handleSavePasswords} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"><Save size={18}/> Parollarni Saqlash</button>

              <div className="pt-8 border-t border-slate-100 mt-8">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle size={24}/></div>
                    <div>
                      <h4 className="font-bold text-red-900">Tizim xotirasini butunlay tozalash (Reset)</h4>
                      <p className="text-xs text-red-700 mt-1">Barcha ma'lumotlarni o'chirish va tizimni boshlang'ich zavod sozlamalariga qaytarish.</p>
                    </div>
                  </div>
                  <button onClick={handleClearMemory} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors whitespace-nowrap">Xotirani Tozalash</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCRM = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mijozlar Bazasi (CRM)</h2>
            <p className="text-sm text-slate-500">Barcha mijozlar tarixi va kontaktlari</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.length === 0 ? (
           <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl">Hozircha mijozlar mavjud emas</div>
        ) : (
        bookings.map((client, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
             {currentUserRole === 'manager' && (
               <button onClick={() => handleDeleteBooking(client.id, client.clientName)} className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                 <Trash2 size={20}/>
               </button>
             )}
             <div className="flex items-center gap-4 mb-4 pr-10">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">{client.clientName.charAt(0)}</div>
                <div>
                  <h3 className="font-bold text-slate-800 truncate">{client.clientName}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Phone size={12}/> {client.clientPhone}</p>
                </div>
             </div>
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sanasi:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {client.date} <br/> 
                    <span className="text-[10px] text-indigo-500">{client.eventTypes.join(', ')}</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Umumiy shartnoma:</span>
                  <span className="font-bold text-indigo-600">{formatUZS(client.orderPriceUZS)}</span>
                </div>
             </div>
          </div>
        ))
        )}
      </div>
    </div>
  );

  const renderFinance = () => {
    const totalIncomeValueUZS = bookings.reduce((sum, b) => sum + b.incomeUZS, 0);
    const totalIncomeValueUSD = bookings.reduce((sum, b) => sum + b.incomeUSD, 0);
    
    const totalWeddingExpensesValueUZS = bookings.reduce((sum, b) => sum + b.expensesUZS, 0);
    const totalWeddingExpensesValueUSD = bookings.reduce((sum, b) => sum + b.expensesUSD, 0);
    
    const totalCompanyExpensesValueUZS = companyExpenses.reduce((sum, exp) => sum + exp.amountUZS, 0);
    const totalCompanyExpensesValueUSD = companyExpenses.reduce((sum, exp) => sum + exp.amountUSD, 0);
    
    const netProfitValueUZS = totalIncomeValueUZS - (totalWeddingExpensesValueUZS + totalCompanyExpensesValueUZS);
    const netProfitValueUSD = totalIncomeValueUSD - (totalWeddingExpensesValueUSD + totalCompanyExpensesValueUSD);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 print:border-b-2 print:border-slate-800 print:rounded-none">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 print:hidden"><Wallet size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 print:text-2xl">{companyInfo.name} — To'liq Moliyaviy Hisobot</h2>
              <p className="text-sm text-slate-500">Sana: {new Date().toLocaleDateString('uz-UZ')} {new Date().toLocaleTimeString('uz-UZ')}</p>
            </div>
          </div>
          {/* YANGI: Chop etish tugmasi (Print Button) */}
          <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 print:hidden shadow-sm transition-colors">
            <Printer size={18} /> Hisobotni chop etish
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:border-slate-300 print:p-4">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Jami Tushumlar</p>
            <h3 className="text-lg font-bold text-green-600">{formatUZS(totalIncomeValueUZS)}</h3>
            <p className="text-sm font-bold text-green-700">{formatUSD(totalIncomeValueUSD)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:border-slate-300 print:p-4">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Tadbirlar Xarajati</p>
            <h3 className="text-lg font-bold text-red-500">- {formatUZS(totalWeddingExpensesValueUZS)}</h3>
            <p className="text-sm font-bold text-red-600">- {formatUSD(totalWeddingExpensesValueUSD)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:border-slate-300 print:p-4">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Maishiy Xarajatlar</p>
            <h3 className="text-lg font-bold text-amber-500">- {formatUZS(totalCompanyExpensesValueUZS)}</h3>
            <p className="text-sm font-bold text-amber-600">- {formatUSD(totalCompanyExpensesValueUSD)}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white print:bg-slate-100 print:text-slate-900 print:border-slate-800 print:border-2 print:p-4">
            <p className="text-xs text-slate-400 print:text-slate-500 font-bold uppercase mb-1">Jami Sof Foyda</p>
            <h3 className="text-lg font-bold text-emerald-400 print:text-green-700">{formatUZS(netProfitValueUZS)}</h3>
            <h3 className="text-sm font-bold text-white print:text-slate-800">{formatUSD(netProfitValueUSD)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8 print:border-none print:shadow-none">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 print:p-2 print:bg-white print:border-b-2">
            <h2 className="text-lg font-bold text-slate-800 print:text-xl">Tadbirlar bo'yicha batafsil ro'yxat</h2>
          </div>
          
          <div className="divide-y divide-slate-100 print:divide-y-2 print:divide-slate-300">
            {bookings.length === 0 ? (
               <div className="p-8 text-center text-slate-500">Hozircha ma'lumotlar yo'q</div>
            ) : (
            bookings.slice().reverse().map(b => {
              const bNetProfitUZS = b.incomeUZS - b.expensesUZS;
              const bNetProfitUSD = b.incomeUSD - b.expensesUSD;
              const isExpanded = expandedFinanceId === b.id;

              return (
                <div key={b.id} className="transition-colors hover:bg-slate-50/30 print:bg-white print:py-3">
                  <div className="p-6 flex flex-col xl:flex-row xl:items-center justify-between cursor-pointer gap-4 print:p-2 print:flex-row" onClick={() => setExpandedFinanceId(isExpanded ? null : b.id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-bold text-slate-800 text-lg print:text-base">{b.clientName}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md print:border">{b.date}</span>
                        <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-bold">Kurs: {b.lockedExchangeRate} UZS</span>
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold print:inline">{b.eventTypes.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap text-sm print:gap-4 print:text-xs">
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-0.5 print:hidden">Tushum</p>
                        <p className="font-bold text-green-600">{formatUZS(b.incomeUZS)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-0.5 print:hidden">Xarajat</p>
                        <p className="font-bold text-red-500">{formatUZS(b.expensesUZS)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-0.5 print:hidden">Foyda</p>
                        <p className={`font-bold ${bNetProfitUZS >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatUZS(bNetProfitUZS)}</p>
                      </div>
                      <div className="text-slate-400 print:hidden">{isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}</div>
                    </div>
                  </div>

                  {/* Qog'ozga chop etilganda barcha detallar avtomatik ochilib chiqadi (print:block yordamida) */}
                  <div className={`px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 print:bg-white print:block ${isExpanded ? 'block' : 'hidden print:block'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm print:grid-cols-2 print:gap-4 print:text-xs mt-2">
                      <div className="space-y-2">
                        <h4 className="font-bold text-green-700 border-b border-green-200 pb-1 uppercase tracking-wider text-[11px]">Kirim detallari</h4>
                        <div className="flex justify-between"><span>Asosiy Shartnoma:</span><span className="font-medium">{formatUZS(b.orderPriceUZS)} ({formatUSD(b.orderPriceUSD)})</span></div>
                        <div className="flex justify-between"><span>Qo'shimcha Xizmatlar:</span><span className="font-medium">{formatUZS(b.additionalServicesUZS)} ({formatUSD(b.additionalServicesUSD)})</span></div>
                        <div className="flex justify-between pt-1 border-t border-dashed border-slate-200 font-bold"><span>Olingan Avans:</span><span className="text-green-600">{formatUZS(b.advanceUZS)}</span></div>
                        <div className="flex justify-between bg-amber-50 p-1.5 rounded border border-amber-100 font-bold print:bg-white"><span>Qoldiq qarz:</span><span className="text-amber-700">{formatUZS(b.incomeUZS - b.advanceUZS)}</span></div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-red-700 border-b border-red-200 pb-1 uppercase tracking-wider text-[11px]">Chiqim detallari</h4>
                        <div className="flex justify-between"><span>Kommunal / Oshpaz / Ishchilar / Samovar:</span><span className="font-medium">{formatUZS(b.expElectricityUZS + b.expChefUZS + b.expWorkersUZS + b.expSamovarUZS)}</span></div>
                        {b.otherExpenses && b.otherExpenses.length > 0 && (
                          <div className="pl-3 border-l-2 border-red-200 space-y-0.5">
                            {b.otherExpenses.map((exp, i) => (
                              <div key={i} className="flex justify-between text-slate-600 text-xs"><span>- {exp.name}:</span><span>{formatUZS(exp.uzs)}</span></div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-dashed border-slate-200 font-bold"><span>Jami tadbir chiqimi:</span><span className="text-red-500">{formatUZS(b.expensesUZS)} ({formatUSD(b.expensesUSD)})</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8 print:shadow-none print:border-slate-300">
           <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 print:bg-white">
              <h3 className="font-bold text-amber-900">Umumiy va Maishiy Xarajatlar ro'yxati</h3>
           </div>
           <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-1 print:p-2">
              {currentUserRole === 'manager' && (
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit space-y-4 print:hidden">
                   <h4 className="text-sm font-bold text-slate-800">Yangi xarajat qo'shish</h4>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Xarajat maqsadi</label>
                     <input type="text" placeholder="Masalan: Bino ta'miri" value={newCompExp.title} onChange={(e) => setNewCompExp({...newCompExp, title: e.target.value})} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Summa va Valyuta</label>
                     <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                       <input type="text" placeholder="0" value={formatNumber(newCompExp.amount).toLocaleString('en-US')} onChange={(e) => setNewCompExp({...newCompExp, amount: e.target.value})} className="flex-1 p-2.5 text-sm outline-none font-bold text-right" />
                       <select value={newCompExp.currency} onChange={(e) => setNewCompExp({...newCompExp, currency: e.target.value})} className="bg-slate-100 px-2 text-xs font-bold outline-none">
                         <option value="UZS">UZS</option>
                         <option value="USD">USD ($)</option>
                       </select>
                     </div>
                   </div>
                   <button onClick={handleAddCompanyExpense} className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2">
                     <Plus size={18}/> Qo'shish
                   </button>
                </div>
              )}

              <div className="lg:col-span-2 border border-slate-200 rounded-xl overflow-hidden print:border-none">
                <table className="w-full text-left text-sm print:text-xs">
                   <thead className="bg-slate-50 text-slate-500 font-medium print:bg-white print:border-b">
                      <tr>
                        <th className="p-4 border-b">Sana</th>
                        <th className="p-4 border-b">Maqsad</th>
                        <th className="p-4 border-b text-right">Summa (Dual)</th>
                        <th className="p-4 border-b w-10 print:hidden"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {companyExpenses.length === 0 ? (
                        <tr><td colSpan="4" className="p-4 text-center text-slate-500">Hozircha xarajatlar yo'q</td></tr>
                      ) : (
                      companyExpenses.map(exp => (
                        <tr key={exp.id}>
                           <td className="p-4 text-slate-500">{exp.date}</td>
                           <td className="p-4 font-medium">{exp.title}</td>
                           <td className="p-4 font-bold text-red-500 text-right">{formatUZS(exp.amountUZS)} <br/><span className="text-xs text-slate-400 font-normal">{formatUSD(exp.amountUSD)}</span></td>
                           <td className="p-4 text-right print:hidden">
                              {currentUserRole === 'manager' && (
                                <button onClick={() => setCompanyExpenses(companyExpenses.filter(e => e.id !== exp.id))} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                              )}
                           </td>
                        </tr>
                      ))
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderNewOrder = () => {
    const toggleEventType = (type) => {
      setFormData(prev => ({
        ...prev,
        eventTypes: prev.eventTypes.includes(type) ? prev.eventTypes.filter(t => t !== type) : [...prev.eventTypes, type]
      }));
    };

    const CurrencyInput = ({ label, name, value, currencyName }) => (
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 shadow-sm">
          <input type="text" name={name} value={formatNumber(value).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="flex-1 p-2.5 text-sm outline-none font-bold text-right text-slate-800" />
          <select name={currencyName} value={formData[currencyName]} onChange={handleInputChange} className="bg-slate-100 px-3 text-xs font-bold border-l border-slate-200 outline-none text-slate-700 cursor-pointer">
            <option value="UZS">UZS</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"><ArrowLeft size={20} /></button>
            <h2 className="text-xl font-bold text-slate-800">Yangi Buyurtma</h2>
          </div>
          <button onClick={handleSaveBooking} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-md">
            <Save size={18} /> Saqlash va Tasdiqlash
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2"><User size={20} className="text-indigo-500"/><h3 className="font-bold text-slate-800">Mijoz va Tadbir</h3></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mijoz Ism-sharifi</label>
                  <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Masalan: Alisher Vahobov" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Telefon raqam</label>
                  <input type="text" name="clientPhone" value={formData.clientPhone} onChange={handleInputChange} placeholder="+998 90 123 45 67" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tadbir sanasi</label>
                  <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tadbir toifasi</label>
                  <select name="eventCategory" value={formData.eventCategory} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 mb-2">Tadbir vaqti (Bir nechtasini tanlash mumkin)</label>
                  <div className="flex flex-wrap gap-3">
                    {['Nahorgi osh', 'Kunduzgi tadbir', 'Kechki bazm'].map(type => (
                      <label key={type} className={`cursor-pointer px-4 py-2 border rounded-xl flex items-center gap-2 text-sm transition-all
                        ${formData.eventTypes.includes(type) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="checkbox" className="hidden" checked={formData.eventTypes.includes(type)} onChange={() => toggleEventType(type)}/>
                        {formData.eventTypes.includes(type) && <CheckCircle size={16} className="text-indigo-600"/>}
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center gap-2"><TrendingUp size={20} className="text-green-600"/><h3 className="font-bold text-green-800">Tushumlar (Kirim)</h3></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <CurrencyInput label="Kelishilgan Asosiy Narx" name="orderPrice" value={formData.orderPrice} currencyName="orderPriceCurr" />
                <CurrencyInput label="Olingan Avans" name="advancePayment" value={formData.advancePayment} currencyName="advancePaymentCurr" />
                <div className="md:col-span-2">
                  <CurrencyInput label="Qo'shimcha Xizmatlar tushumi" name="additionalServices" value={formData.additionalServices} currencyName="additionalServicesCurr" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center gap-2"><Wallet size={20} className="text-red-500"/><h3 className="font-bold text-red-800">Xarajatlar (Chiqim)</h3></div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CurrencyInput label="Elektr / Chiroq sarfi" name="expElectricity" value={formData.expElectricity} currencyName="expElectricityCurr" />
                  <CurrencyInput label="Oshpaz xizmati" name="expChef" value={formData.expChef} currencyName="expChefCurr" />
                  <CurrencyInput label="Ishchilar va Ofitsiantlar" name="expWorkers" value={formData.expWorkers} currencyName="expWorkersCurr" />
                  <CurrencyInput label="Samovar va Choyxona" name="expSamovar" value={formData.expSamovar} currencyName="expSamovarCurr" />
                </div>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-800">Qo'shimcha Xarajatlar (Dinamik)</h4>
                    <button onClick={addOtherExpense} className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Qo'shish</button>
                  </div>
                  <div className="space-y-3">
                    {formData.otherExpenses.map((exp) => (
                      <div key={exp.id} className="flex gap-3 items-center">
                        <input type="text" placeholder="Nomi (Bezak, San'atkor)" value={exp.name} onChange={(e) => updateOtherExpense(exp.id, 'name', e.target.value)} className="flex-1 p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white" />
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white w-48">
                          <input type="text" placeholder="0" value={formatNumber(exp.amount).toLocaleString('en-US')} onChange={(e) => updateOtherExpense(exp.id, 'amount', e.target.value)} className="w-full p-2 text-sm outline-none font-bold text-right text-red-600" />
                          <select value={exp.currency} onChange={(e) => updateOtherExpense(exp.id, 'currency', e.target.value)} className="bg-slate-100 px-2 text-xs font-bold border-l border-slate-200 outline-none">
                            <option value="UZS">UZS</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                        <button onClick={() => removeOtherExpense(exp.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    {formData.otherExpenses.length === 0 && <div className="text-xs text-slate-400 text-center py-2">Qo'shimcha xarajatlar kiritilmagan</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 text-white sticky top-24 space-y-6">
              <h3 className="text-xl font-bold border-b border-slate-700 pb-4 flex items-center gap-3"><Calculator size={24} className="text-indigo-400"/> Canli Hisobot</h3>
              <div>
                <span className="text-slate-400 text-sm mb-1 block">Jami Tushum (Kirim)</span>
                <div className="text-lg font-bold text-green-400">{formatUZS(totalIncomeUZS)}</div>
                <div className="text-xs font-bold text-green-500">{formatUSD(totalIncomeUSD)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm mb-1 block">Jami Xarajatlar (Chiqim)</span>
                <div className="text-lg font-bold text-red-400">- {formatUZS(totalExpensesUZS)}</div>
                <div className="text-xs font-bold text-red-500">- {formatUSD(totalExpensesUSD)}</div>
              </div>
              <div className="pt-6 border-t border-slate-700">
                <span className="block text-xs text-indigo-300 uppercase tracking-wider font-bold mb-2">Kutilayotgan Sof Foyda</span>
                <div className="text-xl font-extrabold text-white">{formatUZS(netProfitLiveUZS)}</div>
                <div className="text-sm font-bold text-indigo-300">{formatUSD(netProfitLiveUSD)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4"><Lock className="text-white" size={32} /></div>
            <h1 className="text-3xl font-bold text-white mb-2">{companyInfo.name} CRM</h1>
            <p className="text-slate-400 text-sm">Xavfsiz platforma</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <UserCircle className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Loginni kiriting" required/>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Parol" required/>
            </div>
            {loginError && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{loginError}</div>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2">Tizimga Kirish</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50/80 font-sans overflow-hidden text-slate-900 print:bg-white print:h-auto print:overflow-visible">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-20 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Qidirish..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"/>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {activeTab !== 'new_order' && currentUserRole === 'manager' && (
              <button onClick={() => setActiveTab('new_order')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                <PlusCircle size={18} /> <span>Yangi Buyurtma</span>
              </button>
            )}
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative text-slate-500 p-1"><Bell size={22} />{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">{unreadCount}</span>}</button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-800">Xabarlar</h3></div>
                  <div className="p-4 text-center text-xs text-slate-400">Yangi bildirishnomalar yo'q</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth print:overflow-visible print:p-0 print:m-0">
          <div className="max-w-7xl mx-auto print:max-w-full">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'new_order' && renderNewOrder()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'finance' && renderFinance()}
            {activeTab === 'crm' && renderCRM()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>
    </div>
  );
}
