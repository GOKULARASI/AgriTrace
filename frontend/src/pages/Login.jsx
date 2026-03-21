import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Lock, Mail, User, MapPin, Phone, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Farmer', location: '', phone: ''
    });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ FIXED ENDPOINT (NO duplicate /api/auth)
            const endpoint = isLogin ? '/login' : '/register';

            const res = await api.post(endpoint, formData);

            localStorage.setItem('token', res.data.token);
            login(res.data);

            // Redirect based on role
            const roleRedirects = {
                Admin: '/dashboard',
                Farmer: '/dashboard',
                Industry: '/dashboard',
                Transport: '/dashboard',
                Retail: '/dashboard',
                Consumer: '/trace/1',
            };

            navigate(roleRedirects[res.data.user.role] || '/dashboard');

        } catch (err) {
            const response = err.response;
            const status = response?.status;
            const serverMsg = response?.data?.msg || response?.statusText;
            const fallback = err.message;

            if (response) {
                setError(`Error (${status}): ${serverMsg || 'Unexpected API response'}`);
            } else {
                setError(`Network error: ${fallback}. Make sure backend URL is set and reachable.`);
            }

            console.error('Login/register error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-700 to-teal-900 overflow-y-auto">
            <div className="w-full max-w-lg p-6 my-8">
                <div className="bg-white/95 rounded-3xl shadow-2xl p-8">

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold">AgriTrace</h1>
                        <p className="text-gray-500">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {!isLogin && (
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded"
                            />
                        )}

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded"
                        />

                        {!isLogin && (
                            <>
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Location"
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border rounded"
                                />

                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 border rounded"
                                />
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white p-3 rounded"
                        >
                            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? "Create account" : "Already have account?"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;