import React, { useState, useEffect } from 'react';
import { 
  Calendar, LayoutDashboard, Users, Wallet, Settings, PlusCircle, Bell, Search,
  Menu, X, TrendingUp, CheckCircle, Clock, ArrowLeft, Save, Plus, Trash2,
  Calculator, User, Phone, ChevronLeft, ChevronRight, 
  Shield, Star, ChevronDown, ChevronUp,
  LogOut, Lock, UserCircle, Key
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

  const [newCompExp, setNewCompExp] = useState({ title: '', amount: '' });
  const [expandedFinanceId, setExpandedFinanceId] = useState(null);

  const initialFormState = {
    clientName: '', clientPhone: '', clientAddress: '', eventCategory: 'Nikoh to\'yi', eventDate: '', eventType: 'Kechki',
    orderPrice: '', advancePayment: '', additionalServices: '',
    expElectricity: '', expChef: '', expWorkers: '', expSamovar: '', otherExpenses: []
  };
  const [formData, setFormData] = useState(initialFormState);

  const formatNumber = (num) => parseInt(num?.toString().replace(/\D/g, '')) || 0;
  const formatUZS = (num) => new Intl.NumberFormat('uz-UZ').format(num) + ' UZS';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['orderPrice', 'advancePayment', 'additionalServices', 'expElectricity', 'expChef', 'expWorkers', 'expSamovar'].includes(name)) {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addOtherExpense = () => setFormData({ ...formData, otherExpenses: [...formData.otherExpenses, { id: Date.now(), name: '', amount: '' }] });
  const updateOtherExpense = (id, field, value) => {
    setFormData({ ...formData, otherExpenses: formData.otherExpenses.map(exp => exp.id === id ? { ...exp, [field]: field === 'amount' ? value.replace(/\D/g, '') : value } : exp) });
  };
  const removeOtherExpense = (id) => setFormData({ ...formData, otherExpenses: formData.otherExpenses.filter(exp => exp.id !== id) });

  const totalIncome = formatNumber(formData.orderPrice) + formatNumber(formData.additionalServices);
  const totalOtherExpenses = formData.otherExpenses.reduce((sum, exp) => sum + formatNumber(exp.amount), 0);
  const totalExpenses = formatNumber(formData.expElectricity) + formatNumber(formData.expChef) + formatNumber(formData.expWorkers) + formatNumber(formData.expSamovar) + totalOtherExpenses;
  const netProfit = totalIncome - totalExpenses;

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
    const permission = await Notification.requestPermission();
    setSysNotifPermission(permission);
    if (permission === "granted") {
      new Notification("Tizim sozlandi!", { body: "Endi muhim xabarlar ekranga to'g'ridan-to'g'ri chiqadi." });
    }
  };

  const sendSystemNotification = (title, body) => {
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const handleAddCompanyExpense = () => {
    if (currentUserRole !== 'manager') return;
    if (!newCompExp.title || !newCompExp.amount) return;
    setCompanyExpenses([...companyExpenses, { 
      id: Date.now(), 
      date: new Date().toISOString().split('T')[0], 
      title: newCompExp.title, 
      amount: formatNumber(newCompExp.amount) 
    }]);
    setNewCompExp({ title: '', amount: '' });
  };

  const handleSaveBooking = () => {
    if (currentUserRole !== 'manager') return;
    if(!formData.clientName || !formData.eventDate) return; 
    
    const newBooking = {
      id: Date.now(),
      date: formData.eventDate,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      eventCategory: formData.eventCategory,
      eventType: formData.eventType,
      status: 'Tasdiqlangan',
      orderPrice: formatNumber(formData.orderPrice),
      additionalServices: formatNumber(formData.additionalServices),
      advancePayment: formatNumber(formData.advancePayment),
      expElectricity: formatNumber(formData.expElectricity),
      expChef: formatNumber(formData.expChef),
      expWorkers: formatNumber(formData.expWorkers),
      expSamovar: formatNumber(formData.expSamovar),
      otherExpenses: formData.otherExpenses,
      otherExpensesTotal: totalOtherExpenses,
      totalExpenses: totalExpenses
    };

    setBookings([...bookings, newBooking].sort((a, b) => new Date(a.date) - new Date(b.date)));
    
    const newNotif = {
      id: Date.now(),
      type: 'success',
      title: 'Yangi buyurtma saqlandi',
      message: `${formData.clientName} - ${formData.eventDate} sanasiga tadbir band qildi.`,
      time: 'Hozir',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    sendSystemNotification('Yangi buyurtma saqlandi!', `${formData.clientName} tomonidan ${formData.eventDate} sanasiga tadbir belgilandi.`);

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
    <div className={`bg-slate-900 text-white w-64 flex-shrink-0 fixed h-full z-30 transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col shadow-xl`}>
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
          <button 
             title="Tizimdan chiqish"
             onClick={handleLogout}
             className="p-2.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
             <LogOut size={18}/>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const totalExpected = bookings.reduce((sum, b) => sum + b.orderPrice, 0);
    const activeOrders = bookings.length;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Oylik Kutilayotgan Tushum</p>
                <h3 className="text-2xl font-bold text-slate-800">{formatUZS(totalExpected)}</h3>
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
                          <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">{booking.eventType} navbat</span>
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
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5
                        ${booking.status === 'Tasdiqlangan' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          booking.status === 'Kutilmoqda' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                          'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {booking.status === 'Tasdiqlangan' && <CheckCircle size={14} />}
                        {booking.status === 'Kutilmoqda' && <Clock size={14} />}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-900">{formatUZS(booking.orderPrice)}</span>
                      <span className="text-slate-500 text-xs">Avans: <span className="font-medium text-slate-700">{formatUZS(booking.advancePayment)}</span></span>
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
              <p className="text-sm text-slate-500">Zallarning kunlik holati nazorati</p>
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
                        <div key={b.id} className={`text-[10px] p-1.5 rounded leading-tight font-medium ${b.eventType === 'Kunduzgi' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}`}>
                          <span className="block truncate">{b.clientName.split(' ')[0]}</span>
                          <span className="opacity-75">{b.eventType}</span>
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
      sendSystemNotification('Xavfsizlik', 'Tizim parollari muvaffaqiyatli o\'zgartirildi!');
      setNotifications([{ id: Date.now(), type: 'success', title: 'Xavfsizlik', message: 'Menejer va Boshliq parollari yangilandi.', time: 'Hozir', read: false }, ...notifications]);
      alert("Parollar muvaffaqiyatli o'zgartirildi! Keyingi safar yangi parol bilan kirasiz."); 
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><Settings size={24} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tizim Sozlamalari</h2>
            <p className="text-sm text-slate-500">To'yxona profili va xavfsizlik</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">To'yxona nomi (Brend)</label>
              <input 
                type="text" 
                disabled={currentUserRole !== 'manager'} 
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                placeholder="Masalan: Navro'z To'yxonasi"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Telefon raqam</label>
              <input 
                type="text" 
                disabled={currentUserRole !== 'manager'} 
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500" 
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">Ushbu o'zgarishlar barcha uchun tizim logotipi va hisobotlarida darhol yangilanadi.</p>

          {currentUserRole === 'manager' && (
            <div className="pt-8 border-t border-slate-100 mt-6 animate-in fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tizim parollarini boshqarish</h3>
                  <p className="text-xs text-slate-500">Parollarni istalgan vaqtda o'zgartirishingiz mumkin</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Menejer paroli (Joriy)</label>
                  <input 
                    type="text" 
                    value={passwordsForm.manager}
                    onChange={(e) => setPasswordsForm({...passwordsForm, manager: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Boshliq paroli (Joriy)</label>
                  <input 
                    type="text" 
                    value={passwordsForm.boshliq}
                    onChange={(e) => setPasswordsForm({...passwordsForm, boshliq: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button onClick={handleSavePasswords} className="px-6 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                  <Save size={18}/> Parollarni Saqlash
                </button>
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
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {client.clientName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{client.clientName}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Phone size={12}/> {client.clientPhone}</p>
                </div>
             </div>
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sanasi:</span>
                  <span className="font-medium text-slate-800">{client.date}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Umumiy xarid:</span>
                  <span className="font-bold text-indigo-600">{formatUZS(client.orderPrice)}</span>
                </div>
             </div>
          </div>
        ))
        )}
      </div>
    </div>
  );

  const renderFinance = () => {
    const totalIncomeValue = bookings.reduce((sum, b) => sum + b.orderPrice + (b.additionalServices || 0), 0);
    const totalWeddingExpensesValue = bookings.reduce((sum, b) => sum + b.totalExpenses, 0);
    const totalCompanyExpensesValue = companyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfitValue = totalIncomeValue - (totalWeddingExpensesValue + totalCompanyExpensesValue);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Wallet size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Moliyaviy Hisobotlar</h2>
              <p className="text-sm text-slate-500">Kirim, chiqim va sof foyda nazorati</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 relative z-10">Jami Tushumlar</p>
            <h3 className="text-xl lg:text-2xl font-bold text-green-600 relative z-10">{formatUZS(totalIncomeValue)}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 relative z-10">Tadbirlar Xarajati</p>
            <h3 className="text-xl lg:text-2xl font-bold text-red-500 relative z-10">- {formatUZS(totalWeddingExpensesValue)}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 relative z-10">Maishiy Xarajatlar</p>
            <h3 className="text-xl lg:text-2xl font-bold text-amber-500 relative z-10">- {formatUZS(totalCompanyExpensesValue)}</h3>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden text-white">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 relative z-10">Jami Sof Foyda</p>
            <h3 className="text-xl lg:text-2xl font-bold text-white relative z-10">{formatUZS(netProfitValue)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tadbirlar bo'yicha hisobot (Detalizatsiya)</h2>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
               <div className="p-8 text-center text-slate-500">Hozircha ma'lumotlar yo'q</div>
            ) : (
            bookings.slice().reverse().map(b => {
              const bTotalIncome = b.orderPrice + (b.additionalServices || 0);
              const bNetProfit = bTotalIncome - b.totalExpenses;
              const isExpanded = expandedFinanceId === b.id;

              return (
                <div key={b.id} className="transition-colors hover:bg-slate-50/30">
                  <div 
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4"
                    onClick={() => setExpandedFinanceId(isExpanded ? null : b.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-slate-800 text-lg">{b.clientName}</span>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{b.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tushum</p>
                        <p className="font-bold text-green-600">{formatUZS(bTotalIncome)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Xarajat</p>
                        <p className="font-bold text-red-500">{formatUZS(b.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Foyda</p>
                        <p className={`font-bold text-lg ${bNetProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                          {formatUZS(bNetProfit)}
                        </p>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-green-700 flex items-center gap-2 border-b border-green-200 pb-2">
                            <TrendingUp size={16}/> Tushumlar (Kirim)
                          </h4>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Asosiy Narx:</span>
                            <span className="font-medium text-slate-800">{formatUZS(b.orderPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Qo'shimcha Xizmat:</span>
                            <span className="font-medium text-slate-800">{formatUZS(b.additionalServices || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-200 border-dashed">
                            <span className="text-slate-600 font-bold">Mijoz to'lagan avans:</span>
                            <span className="font-bold text-green-600">{formatUZS(b.advancePayment)}</span>
                          </div>
                          <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg border border-amber-100 mt-2">
                            <span className="text-amber-800 font-medium">Qoldiq qarz:</span>
                            <span className="font-bold text-amber-600">{formatUZS(bTotalIncome - b.advancePayment)}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-red-700 flex items-center gap-2 border-b border-red-200 pb-2">
                            <Wallet size={16}/> Xarajatlar (Chiqim)
                          </h4>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Elektr/Oshpaz/Ishchi/Samovar:</span>
                            <span className="font-medium text-slate-800">
                              {formatUZS((b.expElectricity||0)+(b.expChef||0)+(b.expWorkers||0)+(b.expSamovar||0))}
                            </span>
                          </div>
                          {b.otherExpenses && b.otherExpenses.length > 0 && (
                            <div className="pt-2">
                              <span className="text-slate-600 text-xs font-bold mb-1 block">Qo'shimcha (Dinamik) xarajatlar:</span>
                              <div className="pl-3 border-l-2 border-red-200 space-y-1">
                                {b.otherExpenses.map((exp, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                    <span className="text-slate-500">- {exp.name}:</span>
                                    <span className="text-slate-700 font-medium">{formatUZS(exp.amount || 0)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-200 border-dashed">
                            <span className="text-slate-600 font-bold">Jami sarflangan summa:</span>
                            <span className="font-bold text-red-500">{formatUZS(b.totalExpenses)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
           <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
              <h3 className="font-bold text-amber-900">Umumiy va Maishiy Xarajatlar</h3>
           </div>
           <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {currentUserRole === 'manager' ? (
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
                   <h4 className="text-sm font-bold text-slate-800 mb-4">Yangi xarajat qo'shish</h4>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Xarajat maqsadi</label>
                        <input type="text" placeholder="Masalan: Bino ta'miri" value={newCompExp.title} onChange={(e) => setNewCompExp({...newCompExp, title: e.target.value})} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Summa</label>
                        <input type="text" placeholder="Summa (UZS)" value={formatNumber(newCompExp.amount).toLocaleString('en-US')} onChange={(e) => setNewCompExp({...newCompExp, amount: e.target.value})} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                      </div>
                      <button onClick={handleAddCompanyExpense} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2">
                        <Plus size={18}/> Qo'shish
                      </button>
                   </div>
                </div>
              ) : (
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit flex flex-col items-center justify-center text-center py-10 opacity-70">
                   <Shield size={32} className="text-slate-400 mb-3"/>
                   <h4 className="text-sm font-bold text-slate-600 mb-1">Sizda ruxsat yo'q</h4>
                   <p className="text-xs text-slate-400">Faqat menejer qo'sha oladi.</p>
                </div>
              )}

              <div className="lg:col-span-2 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="p-4 border-b">Sana</th>
                        <th className="p-4 border-b">Maqsad</th>
                        <th className="p-4 border-b text-right">Summa (UZS)</th>
                        <th className="p-4 border-b w-10"></th>
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
                           <td className="p-4 font-bold text-red-500 text-right">{formatUZS(exp.amount)}</td>
                           <td className="p-4 text-right">
                              {currentUserRole === 'manager' && (
                                <button onClick={() => setCompanyExpenses(companyExpenses.filter(e => e.id !== exp.id))} className="text-red-300 hover:text-red-500">
                                  <Trash2 size={16}/>
                                </button>
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

  const renderNewOrder = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Yangi Buyurtma Rasmiylashtirish</h2>
          </div>
        </div>
        <button onClick={handleSaveBooking} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2">
          <Save size={18} /> Saqlash va Tasdiqlash
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <User size={20} className="text-indigo-500"/>
              <h3 className="font-bold text-slate-800">Mijoz va Tadbir</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mijoz Ism-sharifi</label>
                <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Ism (Masalan: Alisher Vahobov)" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
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
                <label className="block text-xs font-bold text-slate-500 mb-1">Tadbir turi</label>
                <select name="eventCategory" value={formData.eventCategory} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Vaqti (Navbat)</label>
                <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Kunduzgi">Kunduzgi (Osh)</option>
                  <option value="Kechki">Kechki</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600"/>
              <h3 className="font-bold text-green-800">Tushumlar (Kirim)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Kelishilgan Asosiy Narx (UZS)</label>
                <input type="text" name="orderPrice" value={formatNumber(formData.orderPrice).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-right font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Olingan Avans (UZS)</label>
                <input type="text" name="advancePayment" value={formatNumber(formData.advancePayment).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 text-right font-bold bg-green-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Qo'shimcha Xizmatlar tushumi (UZS)</label>
                <input type="text" name="additionalServices" value={formatNumber(formData.additionalServices).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-right" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
              <Wallet size={20} className="text-red-500"/>
              <h3 className="font-bold text-red-800">Xarajatlar (Chiqim)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Elektr / Chiroq sarfi (UZS)</label>
                  <input type="text" name="expElectricity" value={formatNumber(formData.expElectricity).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Oshpaz xizmati (UZS)</label>
                  <input type="text" name="expChef" value={formatNumber(formData.expChef).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ishchilar va Ofitsiantlar (UZS)</label>
                  <input type="text" name="expWorkers" value={formatNumber(formData.expWorkers).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Samovar va Choyxona (UZS)</label>
                  <input type="text" name="expSamovar" value={formatNumber(formData.expSamovar).toLocaleString('en-US')} onChange={handleInputChange} placeholder="0" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 text-right" />
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Qo'shimcha Xarajatlar (Dinamik)</h4>
                  <button onClick={addOtherExpense} className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Plus size={14} /> Yangi qo'shish
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.otherExpenses.map((exp) => (
                    <div key={exp.id} className="flex gap-3 items-center">
                      <input type="text" placeholder="Nomi (Bezak, San'atkor)" value={exp.name} onChange={(e) => updateOtherExpense(exp.id, 'name', e.target.value)} className="flex-1 p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" placeholder="Summa (UZS)" value={formatNumber(exp.amount).toLocaleString('en-US')} onChange={(e) => updateOtherExpense(exp.id, 'amount', e.target.value)} className="w-40 p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-right font-medium text-red-600" />
                      <button onClick={() => removeOtherExpense(exp.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  {formData.otherExpenses.length === 0 && <div className="text-xs text-slate-400 text-center py-2">Qo'shimcha xarajatlar yo'q</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 text-white sticky top-24">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-slate-700 pb-4">
              <Calculator size={24} className="text-indigo-400"/> Avtomatik Hisobot
            </h3>
            <div className="space-y-6">
              <div>
                <span className="text-slate-400 text-sm mb-1 block">Jami Tushum (Kirim)</span>
                <div className="text-2xl font-bold text-green-400">{formatUZS(totalIncome)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm mb-1 block">Jami Xarajatlar (Chiqim)</span>
                <div className="text-2xl font-bold text-red-400">- {formatUZS(totalExpenses)}</div>
              </div>
              <div className="pt-6 border-t border-slate-700">
                <span className="block text-xs text-indigo-300 uppercase tracking-wider font-bold mb-2">Kutilayotgan Sof Foyda</span>
                <div className="text-4xl font-extrabold">{formatUZS(netProfit)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md animate-in zoom-in-95">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{companyInfo.name} CRM</h1>
            <p className="text-slate-400 text-sm">Tizimga kirish uchun login va parolni kiriting</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Loginni kiriting" required
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Parol" required
                />
              </div>
            </div>

            {loginError && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{loginError}</div>}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2">
              Tizimga Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50/80 font-sans overflow-hidden text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Qidirish..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"/>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {activeTab !== 'new_order' && currentUserRole === 'manager' && (
              <button onClick={() => setActiveTab('new_order')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all">
                <PlusCircle size={18} /> <span className="hidden sm:inline">Yangi Buyurtma</span>
              </button>
            )}
            
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative text-slate-500 hover:text-indigo-600 p-1">
                <Bell size={22} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
              </button>
              
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-800">Bildirishnomalar</h3>
                      {unreadCount > 0 && <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-xs text-indigo-600 font-bold">O'qildi</button>}
                    </div>
                    {sysNotifPermission !== 'granted' && (
                      <button onClick={requestSystemNotificationPermission} className="w-full bg-indigo-600 text-white text-xs py-1.5 rounded-lg flex justify-center gap-1">
                        <Bell size={12}/> Ekranga chiqarishni yoqish
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                       <div className="p-4 text-center text-xs text-slate-400">Yangi xabarlar yo'q</div>
                    ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`px-4 py-3 border-b border-slate-50 cursor-pointer ${!notif.read ? 'bg-indigo-50/50' : ''}`} onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n))}>
                        <div className="flex justify-between">
                          <span className={`text-sm font-bold ${!notif.read ? 'text-indigo-900' : 'text-slate-700'}`}>{notif.title}</span>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                      </div>
                    ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
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
