import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Package, 
  Heart, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AccountPage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);

  // Address form
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const loadAddresses = async () => {
      try {
        const res = await api.addresses.list();
        setAddresses(res.data || []);
      } catch (err) {
        console.error('Failed loading addresses', err);
      }
    };

    loadAddresses();
  }, [isAuthenticated, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.auth.updateProfile({ name: profileName, phone: profilePhone });
      updateUser({ name: profileName, phone: profilePhone });
      setIsEditingProfile(false);
      addToast('Profile details updated successfully');
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addresses.create(newAddr);
      setAddresses((prev) => [...prev, res.data]);
      setIsNewAddressModalOpen(false);
      addToast('New delivery address saved');
    } catch (err) {
      addToast(err.message || 'Failed saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.addresses.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      addToast('Address deleted');
    } catch (err) {
      addToast(err.message || 'Failed deleting address', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-600 font-medium mt-0.5">{user.phone || '+91 98765 43211'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center space-x-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-600" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => logout('/')}
            className="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditingProfile && (
        <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Update Profile Details</h3>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/orders"
          className="p-5 bg-white rounded-2xl border border-gray-200/80 hover:border-brand-300 shadow-xs flex items-center space-x-4 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Your Orders &amp; Tracking</h4>
            <p className="text-xs text-gray-500">Track shipments, cancel or request returns</p>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="p-5 bg-white rounded-2xl border border-gray-200/80 hover:border-brand-300 shadow-xs flex items-center space-x-4 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Saved Wishlist</h4>
            <p className="text-xs text-gray-500">View saved products and price drops</p>
          </div>
        </Link>
      </div>

      {/* SAVED ADDRESSES SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-gray-900">Saved Delivery Addresses</h3>
          </div>

          <button
            onClick={() => setIsNewAddressModalOpen(true)}
            className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-gray-900">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {addr.house}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                {addr.landmark && (
                  <p className="text-[11px] text-gray-400 mt-0.5">Landmark: {addr.landmark}</p>
                )}
                <p className="text-xs font-bold text-gray-800 mt-2">Ph: {addr.phone}</p>
              </div>

              <div className="pt-2 border-t border-gray-200/70 flex justify-end">
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW ADDRESS MODAL */}
      {isNewAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Address</h3>
              <button onClick={() => setIsNewAddressModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">House / Flat / Apartment</label>
                <input
                  type="text"
                  required
                  value={newAddr.house}
                  onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Street &amp; Area</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAddressModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
