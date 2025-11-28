import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LogOut, Menu, X, Flame, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { path: "/dashboard", label: "Discover", icon: Flame },
        { path: "/profile", label: "Profile", icon: UserIcon },
    ];

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "bg-white/80 backdrop-blur-md border-b shadow-sm"
                    : "bg-white/50 backdrop-blur-sm border-b border-transparent"
            )}
        >
            <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="rounded-full bg-gradient-to-br from-[#fd267a] to-[#ff6036] p-1.5 transition-transform group-hover:scale-110 duration-300">
                        <Flame className="h-5 w-5 text-white fill-white" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#fd267a] to-[#ff6036]">
                        Loco
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                        isActive
                                            ? "text-[#fd267a] bg-red-50"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon size={18} className={cn(isActive && "fill-current")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="h-6 w-px bg-gray-200" />

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3 pl-2">
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-2 ring-gray-100">
                                    <AvatarImage src={user.photos?.[0]} alt={user.name} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 font-medium">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:block text-sm">
                                    <p className="font-medium text-gray-900 leading-none">{user.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Free Plan</p>
                                </div>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={logout}
                            className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t bg-white/95 backdrop-blur-md overflow-hidden"
                    >
                        <div className="container flex flex-col gap-2 p-4">
                            {user && (
                                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarImage src={user.photos?.[0]} alt={user.name} className="object-cover" />
                                        <AvatarFallback className="bg-orange-100 text-orange-600">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-gradient-to-r from-[#fd267a] to-[#ff6036] text-white shadow-md"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon size={20} className={cn(isActive ? "text-white fill-white" : "text-gray-500")} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="h-px bg-gray-100 my-2" />

                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
