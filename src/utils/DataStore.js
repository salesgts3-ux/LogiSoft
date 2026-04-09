// src/utils/DataStore.js

const getData = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading ${key}`, error);
        return [];
    }
};

const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const getSingle = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        return {};
    }
};

const setSingle = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Helper: Enforce Company Isolation (Used for data retrieval inside the app)
const getScoped = (key) => {
    const session = getSingle('session');
    const allData = getData(key);
    
    // If Super Admin, return everything
    if (session.role === 'Super Admin') return allData;

    // If Company User, STRICTLY filter by Company ID
    if (session.companyId) {
        return allData.filter(item => String(item.companyId) === String(session.companyId));
    }
    
    return []; // If no company ID, return nothing (safety)
};

export default {
    // --- Super Admin Constants ---
    SUPER_ADMIN: {
        email: 'admin@logisoft.com',
        password: 'Qwerty@123',
        name: 'Super Admin',
        role: 'Super Admin'
    },

    // --- Session Management ---
    getSession: () => getSingle('session'),
    saveSession: (session) => setSingle('session', session),
    clearSession: () => localStorage.removeItem('session'),

    // --- Logo Management ---
    getLogo: () => localStorage.getItem('app_logo'),
    saveLogo: (base64) => localStorage.setItem('app_logo', base64),

    // --- Company Management ---
    getCompanies: () => getData('companies'),
    saveCompany: (company) => setData('companies', [...getData('companies'), company]),
    updateCompany: (company) => setData('companies', getData('companies').map(c => c.id === company.id ? company : c)),
    deleteCompany: (id) => setData('companies', getData('companies').filter(c => c.id !== id)),
    getCompanyByCode: (code) => getData('companies').find(c => c.code === code),

    // --- Users (FIXED FOR LOGIN) ---
    getUsers: (companyId) => {
        // If companyId is passed (during Login), use it
        if (companyId) {
            return getData('users').filter(u => String(u.companyId) === String(companyId));
        }
        // Otherwise, use the session scope (for inside the app)
        return getScoped('users');
    },
    saveUser: (user) => {
        const session = getSingle('session');
        if (!user.companyId && session.companyId) user.companyId = session.companyId;
        setData('users', [...getData('users'), { ...user, id: Date.now() }]);
    },
    updateUser: (user) => setData('users', getData('users').map(u => u.id === user.id ? user : u)),
    deleteUser: (id) => setData('users', getData('users').filter(u => u.id !== id)),

    // --- Data Getters (ALL AUTO-SCOPED) ---
    getCustomers: () => getScoped('customers'),
    saveCustomer: (cust) => {
        const session = getSingle('session');
        if (!cust.companyId && session.companyId) cust.companyId = session.companyId;
        setData('customers', [...getData('customers'), cust]);
    },
    updateCustomer: (cust) => setData('customers', getData('customers').map(c => c.id === cust.id ? cust : c)),

    getVehicles: () => getScoped('vehicles'),
    saveVehicle: (veh) => {
        const session = getSingle('session');
        if (!veh.companyId && session.companyId) veh.companyId = session.companyId;
        setData('vehicles', [...getData('vehicles'), veh]);
    },
    updateVehicle: (veh) => setData('vehicles', getData('vehicles').map(v => v.id === veh.id ? veh : v)),

    getDrivers: () => getScoped('drivers'),
    saveDriver: (drv) => {
        const session = getSingle('session');
        if (!drv.companyId && session.companyId) drv.companyId = session.companyId;
        setData('drivers', [...getData('drivers'), drv]);
    },
    updateDriver: (drv) => setData('drivers', getData('drivers').map(d => d.id === drv.id ? drv : d)),

    getRoutes: () => getScoped('routes'),
    saveRoute: (route) => {
        const session = getSingle('session');
        if (!route.companyId && session.companyId) route.companyId = session.companyId;
        setData('routes', [...getData('routes'), route]);
    },

    getBookings: () => getScoped('bookings'),
    saveBooking: (book) => {
        const session = getSingle('session');
        if (!book.companyId && session.companyId) book.companyId = session.companyId;
        setData('bookings', [...getData('bookings'), book]);
    },
    updateBooking: (book) => setData('bookings', getData('bookings').map(b => b.id === book.id ? book : b)),

    getInvoices: () => getScoped('invoices'),
    saveInvoice: (inv) => {
        const session = getSingle('session');
        if (!inv.id) inv.id = Date.now(); 
        if (!inv.companyId && session.companyId) inv.companyId = session.companyId;
        setData('invoices', [...getData('invoices'), inv]);
    },
    updateInvoice: (inv) => setData('invoices', getData('invoices').map(i => i.id === inv.id ? inv : i)),
    deleteInvoice: (id, reason) => {
        const deleted = getData('deleted_invoices') || [];
        const item = getData('invoices').find(i => i.id === id);
        if (item) {
            deleted.push({ ...item, deleteReason: reason, deletedAt: new Date().toLocaleString() });
            setData('deleted_invoices', deleted);
            setData('invoices', getData('invoices').filter(i => i.id !== id));
        }
    },

    getRepairs: () => getScoped('repairs'),
    saveRepair: (rep) => {
        const session = getSingle('session');
        if (!rep.companyId && session.companyId) rep.companyId = session.companyId;
        setData('repairs', [...getData('repairs'), rep]);
    },
    updateRepair: (rep) => setData('repairs', getData('repairs').map(r => r.id === rep.id ? rep : r)),

    getFinances: () => getScoped('finances'),
    saveFinance: (txn) => {
        const session = getSingle('session');
        if (!txn.companyId && session.companyId) txn.companyId = session.companyId;
        setData('finances', [...getData('finances'), txn]);
    },

    getInventory: () => getScoped('inventory'),
    saveInventory: (item) => {
        const session = getSingle('session');
        if (!item.companyId && session.companyId) item.companyId = session.companyId;
        setData('inventory', [...getData('inventory'), item]);
    },
    updateInventory: (item) => setData('inventory', getData('inventory').map(i => i.id === item.id ? item : i)),

    getIncidents: () => getScoped('incidents'),
    saveIncident: (inc) => {
        const session = getSingle('session');
        if (!inc.companyId && session.companyId) inc.companyId = session.companyId;
        setData('incidents', [...getData('incidents'), inc]);
    },

    getTickets: () => getScoped('tickets'),
    saveTicket: (ticket) => {
        const session = getSingle('session');
        if (!ticket.companyId && session.companyId) ticket.companyId = session.companyId;
        setData('tickets', [...getData('tickets'), ticket]);
    },

    // --- Settings (Scoped) ---
    getSettings: () => {
        const session = getSingle('session');
        const allSettings = getData('app_settings');
        if (!session.companyId) return allSettings.find(s => !s.companyId) || {};
        return allSettings.find(s => String(s.companyId) === String(session.companyId)) || {};
    },
    saveSettings: (settings) => {
        const session = getSingle('session');
        if (!settings.companyId && session.companyId) settings.companyId = session.companyId;
        let allSettings = getData('app_settings');
        if (!Array.isArray(allSettings)) allSettings = [];
        allSettings = allSettings.filter(s => s.companyId !== settings.companyId);
        allSettings.push(settings);
        setData('app_settings', allSettings);
    },
    
    // --- SaaS Backup Manager ---
    getBackupForCompany: (companyId) => {
        const keys = ['customers', 'vehicles', 'drivers', 'routes', 'bookings', 'invoices', 'finances', 'repairs', 'inventory', 'incidents', 'tickets', 'app_settings'];
        const backup = { companyId: companyId, timestamp: new Date().toISOString() };
        keys.forEach(key => {
            backup[key] = getData(key).filter(item => String(item.companyId) === String(companyId));
        });
        return backup;
    },
    restoreBackupForCompany: (backupData, targetCompanyId) => {
        const keys = Object.keys(backupData).filter(k => k !== 'companyId' && k !== 'timestamp');
        keys.forEach(key => {
            let existing = getData(key);
            existing = existing.filter(item => String(item.companyId) !== String(targetCompanyId));
            const newItems = (backupData[key] || []).map(item => ({ ...item, companyId: targetCompanyId }));
            setData(key, [...existing, ...newItems]);
        });
    },
    
    // --- Helpers ---
    toBase64: (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    }),
    
    exportData: (keys) => {
        const exportObj = {};
        keys.forEach(key => { exportObj[key] = getData(key); });
        return exportObj;
    },
    importData: (data) => {
        Object.keys(data).forEach(key => { setData(key, data[key]); });
    }
};