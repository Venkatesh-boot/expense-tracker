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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-4 md:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-700 dark:text-green-200">Account Details</h2>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Name</label>
            <input type="text" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={account.name} disabled />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input type="email" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={account.email} disabled />
          </div>
          <div className="mb-3 sm:mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Mobile</label>
            <input type="text" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={account.mobile} disabled />
          </div>
          <div className="mb-5 sm:mb-6">
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Country</label>
            <input type="text" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={account.country} disabled />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-blue-600 dark:text-blue-200">Change Password</h3>
          <form className="space-y-2 sm:space-y-3" onSubmit={handlePasswordChange}>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Current Password</label>
              <input type="password" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">New Password</label>
              <input type="password" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Confirm New Password</label>
              <input type="password" className="w-full px-2 py-2 sm:px-3 border border-gray-300 rounded-lg text-sm sm:text-base" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-sm sm:text-base">Change Password</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
