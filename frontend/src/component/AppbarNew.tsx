import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"

export const Appbar = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState<{name: string; email: string} | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                headers: {
                    Authorization: token
                }
            })
            .then(response => {
                setUser(response.data.user);
            })
            .catch(() => {
                localStorage.removeItem("token");
            });
        }

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin");
    };

    return <div className="border-b flex justify-between px-10 py-4 shadow-sm bg-white sticky top-0 z-50">
        <Link to={'/blogs'} className="flex flex-col justify-center cursor-pointer text-2xl font-bold text-gray-900 hover:text-gray-700">
            Medium
        </Link>
        <div className="flex items-center gap-4">
            <Link to={'/publish'}>
                <button type="button" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center transition-all">
                    New Post
                </button>
            </Link>

            {user ? (
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <Avatar name={user.name || "Anonymous"} size="big" />
                    </button>
                    
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-900">{user.name || "Anonymous"}</p>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Link 
                                to="/my-posts" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(false)}
                            >
                                My Posts
                            </Link>
                            <Link 
                                to="/saved-posts" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(false)}
                            >
                                Saved Posts
                            </Link>
                            <Link 
                                to="/profile" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowDropdown(false)}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <Link to="/signin">
                    <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center">
                        Sign In
                    </button>
                </Link>
            )}
        </div>
    </div>
}

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    const sizeClass = size === "small" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
    
    return <div className={`relative inline-flex items-center justify-center ${sizeClass} overflow-hidden bg-gradient-to-br from-purple-600 to-blue-500 rounded-full ring-2 ring-white`}>
        <span className="font-semibold text-white">{name[0]?.toUpperCase()}</span>
    </div>
}
