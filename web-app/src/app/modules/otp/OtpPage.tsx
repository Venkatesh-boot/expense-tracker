
import React, { useRef, useState } from 'react';
import { OTP_LENGTH } from '../../config/otp-config';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtpRequest, resetOtp } from '../../store/otpSlice';
import type { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const OtpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state: RootState) => state.otp);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  // Always create 10 refs to support OTP_LENGTH 3-10, but do it dynamically
  const allRefs = Array.from({ length: 10 }, () => useRef<HTMLInputElement>(null));
  const inputRefs = allRefs.slice(0, OTP_LENGTH);
  
  // Validate OTP_LENGTH
  const isOtpLengthValid = OTP_LENGTH >= 3 && OTP_LENGTH <= 10;

  React.useEffect(() => {
    if (success) {
      alert('Mobile number verified!');
      dispatch(resetOtp());
      navigate('/login');
    }
  }, [success, dispatch, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs[index + 1].current?.focus();
    }
    if (!value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted);
      inputRefs[OTP_LENGTH - 1].current?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) return;
    dispatch(verifyOtpRequest({ otp: otpValue }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-yellow-700">Verify OTP</h2>
        {!isOtpLengthValid ? (
          <div className="text-red-500 text-center">OTP length must be between 3 and 10.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            {otp.join('').length !== OTP_LENGTH && (
              <span className="text-red-500 text-sm block text-center">Please enter the {OTP_LENGTH}-digit OTP</span>
            )}
            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg transition-colors" disabled={loading || otp.join('').length !== OTP_LENGTH}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default OtpPage;
