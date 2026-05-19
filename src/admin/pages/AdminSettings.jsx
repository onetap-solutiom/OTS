import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    Globe, Shield, Bell, 
    Smartphone, Database, Save, CheckCircle2, 
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings = () => {
    const { user, updateCollection } = useAdmin();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const calculateYearsOfExperience = () => {
        const startDate = new Date(2025, 3); // April 2025 (Month is 0-indexed: 3 is April)
        const today = new Date();
        let years = today.getFullYear() - startDate.getFullYear();
        const m = today.getMonth() - startDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
            years--;
        }
        return Math.max(1, years);
    };

    // Persisted General Settings States (Website Name is read-only from code)
    const [siteName] = useState('OneTap Solution');
    const [companyEmail, setCompanyEmail] = useState('info@onetapsolution.com');
    const [contactPhone, setContactPhone] = useState('+252 61 9586339');
    const [officeLocation, setOfficeLocation] = useState('Mogadishu, Somalia');

    // Public Stats Settings States
    const [projectsDone, setProjectsDone] = useState(1);
    const [trustedPartners, setTrustedPartners] = useState(20);
    const [servicesProvided, setServicesProvided] = useState(2);
    const [satisfactionRate, setSatisfactionRate] = useState(3);

    // Fetch site settings from MySQL database on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/settings/');
                const result = await res.json();
                if (result.success && result.data) {
                    setCompanyEmail(result.data.company_email);
                    setContactPhone(result.data.contact_phone);
                    setOfficeLocation(result.data.office_location);
                    setProjectsDone(result.data.projects_done ?? 1);
                    setTrustedPartners(result.data.trusted_partners ?? 20);
                    setServicesProvided(result.data.services_provided ?? 7);
                    setSatisfactionRate(result.data.satisfaction_rate ?? 99);
                }
            } catch (err) {
                console.error("Failed to fetch settings from database:", err);
            }
        };
        fetchSettings();
    }, []);

    // Security / Password Update States
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Theme State
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('ots-theme') || 'system';
    });

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('ots-theme', newTheme);
        
        const root = document.documentElement;
        if (newTheme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
        } else if (newTheme === 'dark') {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            // System
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.remove('light');
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
                root.classList.add('light');
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/settings/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    company_email: companyEmail,
                    contact_phone: contactPhone,
                    office_location: officeLocation,
                    projects_done: Number(projectsDone),
                    trusted_partners: Number(trustedPartners),
                    services_provided: Number(servicesProvided),
                    satisfaction_rate: Number(satisfactionRate)
                })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                // Settings saved successfully
                window.dispatchEvent(new Event('app-settings-updated'));
            } else {
                alert(result.message || 'Failed to save settings.');
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Cannot connect to database. Make sure backend is running.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('Please fill out all password fields.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        if (oldPassword === newPassword) {
            setPasswordError('New password must be different from your current password.');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await updateCollection('users', { old_password: oldPassword, password: newPassword }, user.id);
            if (res.success) {
                setPasswordSuccess('Password updated successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(res.message || 'Failed to update password.');
            }
        } catch (err) {
            console.error('Password update failed:', err);
            setPasswordError('Cannot connect to database. Make sure backend is running.');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage global configurations and security</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10 disabled:opacity-50"
                >
                    {isSaving ? <span className="flex items-center gap-2 italic"><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Saving...</span> : <><Save size={18} /><span>Save Configuration</span></>}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs */}
                <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 lg:w-64 shrink-0 no-scrollbar">
                    {[
                        { id: 'general', label: 'General', icon: <Globe size={18} /> },
                        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
                        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                        { id: 'appearance', label: 'Appearance', icon: <Smartphone size={18} /> },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all shrink-0
                                ${activeTab === tab.id 
                                    ? 'bg-[#04C244]/10 text-[#04C244] border border-[#04C244]/20' 
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 space-y-8">
                    {activeTab === 'general' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 space-y-8"
                        >
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Globe className="text-[#04C244]" size={20} />
                                    Company Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mr-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Website Name</label>
                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/20">Code Only</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteName} 
                                            readOnly
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-400 dark:text-slate-500 focus:outline-none cursor-not-allowed text-sm" 
                                            title="Website name can only be changed via the source code."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Company Email</label>
                                        <input 
                                            type="email" 
                                            value={companyEmail} 
                                            onChange={(e) => setCompanyEmail(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                                        <input 
                                            type="text" 
                                            value={contactPhone} 
                                            onChange={(e) => setContactPhone(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Office Location</label>
                                        <input 
                                            type="text" 
                                            value={officeLocation} 
                                            onChange={(e) => setOfficeLocation(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-black/10 dark:border-white/5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Database className="text-[#04C244]" size={20} />
                                    Public Statistics
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Projects Done (+)</label>
                                        <input 
                                            type="number" 
                                            value={projectsDone} 
                                            onChange={(e) => setProjectsDone(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Trusted Partners (+)</label>
                                        <input 
                                            type="number" 
                                            value={trustedPartners} 
                                            onChange={(e) => setTrustedPartners(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Regions Served (+)</label>
                                        <input 
                                            type="number" 
                                            value={servicesProvided} 
                                            onChange={(e) => setServicesProvided(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mr-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Years Experience (+)</label>
                                            <span className="text-[9px] bg-[#04C244]/10 text-[#04C244] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#04C244]/20">Automatic (Apr 2025)</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={calculateYearsOfExperience()} 
                                            readOnly
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-400 dark:text-slate-500 focus:outline-none cursor-not-allowed text-sm" 
                                            title="Years of experience is automatically calculated starting from April 2025."
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-[#04C244]/10 dark:border-white/5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact Channels</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/1 border border-black/10 dark:border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle2 size={18} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Integration</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active · Connected to {contactPhone}</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-red-500 hover:underline">Disconnect</button>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 space-y-8"
                        >
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Lock className="text-[#04C244]" size={20} />
                                    Password Management
                                </h3>
                                <form onSubmit={handleUpdatePassword} className="max-w-md space-y-6">
                                    {passwordError && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl flex items-start gap-2">
                                            <span className="mt-0.5">⚠</span>
                                            <span>{passwordError}</span>
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-2xl flex items-start gap-2">
                                            <span className="mt-0.5">✓</span>
                                            <span>{passwordSuccess}</span>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Enter your current password" 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="h-px bg-black/10 dark:bg-white/5" />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 8 characters" 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password" 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="px-6 py-3 bg-[#04C244] text-black disabled:opacity-50 rounded-2xl text-xs font-bold hover:bg-[#03a837] transition-all shadow-md shadow-[#04C244]/10"
                                    >
                                        {passwordLoading ? 'Updating…' : 'Update Password'}
                                    </button>
                                </form>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 space-y-8"
                        >
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Bell className="text-[#04C244]" size={20} />
                                    Notification Preferences
                                </h3>
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</p>
                                            <p className="text-xs text-slate-500 mt-1">Receive an email when a new contact message is received</p>
                                        </div>
                                        <button className="w-12 h-6 rounded-full bg-[#04C244] relative transition-colors cursor-not-allowed opacity-80" title="Coming soon">
                                            <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Security Alerts</p>
                                            <p className="text-xs text-slate-500 mt-1">Get notified about new logins and password changes</p>
                                        </div>
                                        <button className="w-12 h-6 rounded-full bg-[#04C244] relative transition-colors cursor-not-allowed opacity-80" title="Coming soon">
                                            <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm"></div>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 space-y-8"
                        >
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Smartphone className="text-[#04C244]" size={20} />
                                    Appearance Settings
                                </h3>
                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Theme (Preview)</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <button 
                                                onClick={() => handleThemeChange('light')}
                                                className={`p-4 border-2 ${theme === 'light' ? 'border-[#04C244] bg-black/5 dark:bg-white/5' : 'border-transparent hover:border-black/10 dark:hover:border-white/10 bg-black/5 dark:bg-white/5'} rounded-2xl text-center transition-all`}
                                            >
                                                <div className="w-full h-16 bg-slate-100 rounded-lg mb-2 border border-black/5"></div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">Light</span>
                                            </button>
                                            <button 
                                                onClick={() => handleThemeChange('dark')}
                                                className={`p-4 border-2 ${theme === 'dark' ? 'border-[#04C244] bg-black/5 dark:bg-white/5' : 'border-transparent hover:border-black/10 dark:hover:border-white/10 bg-black/5 dark:bg-white/5'} rounded-2xl text-center transition-all`}
                                            >
                                                <div className="w-full h-16 bg-[#0A0C10] rounded-lg mb-2 border border-white/5"></div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">Dark</span>
                                            </button>
                                            <button 
                                                onClick={() => handleThemeChange('system')}
                                                className={`p-4 border-2 ${theme === 'system' ? 'border-[#04C244] bg-black/5 dark:bg-white/5' : 'border-transparent hover:border-black/10 dark:hover:border-white/10 bg-black/5 dark:bg-white/5'} rounded-2xl text-center transition-all`}
                                            >
                                                <div className="w-full h-16 bg-linear-to-r from-slate-100 to-[#0A0C10] rounded-lg mb-2 border border-black/5"></div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">System</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
