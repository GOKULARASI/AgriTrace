import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Truck, 
    Store, 
    Search, 
    User, 
    LogOut, 
    Leaf,
    Settings,
    ShieldCheck,
    QrCode
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['Admin', 'Farmer', 'Industry', 'Transport', 'Retail'] },
        { name: 'Scan Product', icon: <QrCode size={20} />, path: '/scan', roles: ['Admin', 'Farmer', 'Industry', 'Transport', 'Retail', 'Consumer'] },
        { name: 'Trace Details', icon: <Search size={20} />, path: '/trace/1', roles: ['Admin', 'Farmer', 'Industry', 'Transport', 'Retail', 'Consumer'] },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings', roles: ['Admin'] },
    ];

    const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(user?.user?.role));

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg text-white">
                    <Leaf size={20} />
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">AgriTrace</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                            ${isActive 
                                ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-600/10' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                        `}
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-gray-50 mt-auto">
                <NavLink 
                    to="/profile"
                    className={({ isActive }) => `
                        bg-gray-50 rounded-2xl p-4 mb-4 flex items-center gap-3 transition-all hover:bg-gray-100 ring-1 ring-transparent
                        ${isActive ? 'ring-green-500/30' : ''}
                    `}
                >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200">
                        {user?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{user?.user?.role}</p>
                    </div>
                    <ShieldCheck size={16} className="text-blue-500 ml-auto shrink-0" />
                </NavLink>

                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
