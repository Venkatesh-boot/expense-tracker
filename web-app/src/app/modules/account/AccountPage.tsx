import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchAccountStart, changePasswordStart, clearPasswordChangeStatus } from '../../store/accountSlice';
import Header from '../../components/Header';
import Footer from '../../components/Footer';


export default function AccountPage() {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.account);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    dispatch(fetchAccountStart());
  }, [dispatch]);

  useEffect(() => {
    if (account.passwordChangeSuccess) {
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      dispatch(clearPasswordChangeStatus());
    }
  }, [account.passwordChangeSuccess, dispatch]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    dispatch(changePasswordStart({ currentPassword, newPassword }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Account Details</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Name</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={account.name} disabled />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={account.email} disabled />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Mobile</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={account.mobile} disabled />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Country</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={account.country} disabled />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Change Password</h3>
          <form className="space-y-3" onSubmit={handlePasswordChange}>
            <div>
              <label className="block text-gray-700 mb-1">Current Password</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">Change Password</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
