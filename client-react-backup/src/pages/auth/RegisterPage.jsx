import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Validate Indian Phone format (starts with 6, 7, 8, 9 and exactly 10 digits)
  const validateIndianPhone = (rawPhone) => {
    const clean = rawPhone.trim().replace(/^(\+91|0)/, '').replace(/\D/g, '');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return {
      isValid: indianPhoneRegex.test(clean),
      cleanPhone: clean
    };
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (phoneWarning) {
      const { isValid } = validateIndianPhone(val);
      if (isValid) {
        setPhoneWarning('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneWarning('');

    // Check Indian phone number validation
    const { isValid, cleanPhone } = validateIndianPhone(phone);
    if (!isValid) {
      const warningMsg = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).';
      setPhoneWarning(warningMsg);
      addToast(warningMsg, 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, phone: cleanPhone, password });
      // Do NOT log in directly; redirect to login page with success prompt
      navigate('/login', {
        state: {
          registeredEmail: email,
          registrationSuccessMsg: 'Registration successful, now you can login to Tez Thaila.'
        }
      });
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-2">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Tez Thaila Account</h2>
          <p className="text-xs text-gray-500">Sign up for express delivery, order tracking &amp; instant coupons</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-gray-700">Mobile Phone Number</label>
              <span className="text-[10px] text-gray-400 font-medium">10 digits (starts with 6, 7, 8, 9)</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-gray-500 select-none">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={13}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className={`w-full pl-12 pr-3 py-2.5 border rounded-xl focus:outline-none transition-colors ${
                  phoneWarning
                    ? 'border-amber-500 bg-amber-50/40 text-gray-900 focus:border-amber-600'
                    : 'border-gray-200 focus:border-brand-500'
                }`}
              />
            </div>
            {phoneWarning && (
              <div className="mt-1.5 flex items-start space-x-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px] font-medium leading-tight">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>{phoneWarning}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Confirm</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 pt-2"
          >
            <span>Register Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-brand-700 hover:text-brand-800">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
