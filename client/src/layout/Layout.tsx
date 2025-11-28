import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LogOut, Menu, X, Flame } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout() {
    const { logout } = useAuthStore();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { path: "/dashboard", label: "Discover", icon: Flame },
        // Add more Tinder-like nav items here later (e.g., Matches, Messages, Profile)
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="text-primary" /> : <Menu className="text-primary" />}
            </button>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {(isMobileMenuOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className={cn(
                            "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col transition-transform duration-300 ease-in-out",
                            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                        )}
                    >
                        <div className="p-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-tinder-gradient">
                                Loco
                            </h1>
                        </div>

                        <nav className="flex-1 px-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                            isActive
                                                ? "bg-tinder-gradient text-white shadow-md"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                        )}
                                    >
                                        <Icon size={20} className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
