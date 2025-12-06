import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ name, email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4b1248] via-[#53227a] to-[#3b2fa3] p-4">
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-10 w-full max-w-md shadow-xl overflow-hidden"
            >
                {/* Glowing circle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 1 }}
                    className="absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-[#ff8ff3] via-[#c778ff] to-[#8e44ff] blur-[65px]"
                />

                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-4xl font-bold text-[#f3e5ff] mb-8 relative z-10"
                >
                    Create Account
                </motion.h1>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-gray-300 mb-2" htmlFor="name">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 focus:border-[#ff9cff] focus:ring-1 focus:ring-[#ff9cff] text-gray-200 px-4 py-3 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-300 mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 focus:border-[#ff9cff] focus:ring-1 focus:ring-[#ff9cff] text-gray-200 px-4 py-3 outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-300 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 focus:border-[#ff9cff] focus:ring-1 focus:ring-[#ff9cff] text-gray-200 px-4 py-3 outline-none"
                        />
                    </div>

                    {/* Register Button */}
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 18px rgba(220, 140, 255, 0.6)" }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c471f5] to-[#fa71cd] text-white font-medium text-lg transition-all"
                    >
                        Register
                    </motion.button>

                    {/* Login Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-gray-300 mt-2 relative z-10"
                    >
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#f48aff] font-semibold">
                            Login here
                        </Link>
                    </motion.p>
                </form>
            </motion.div>
        </div>
    );
}
