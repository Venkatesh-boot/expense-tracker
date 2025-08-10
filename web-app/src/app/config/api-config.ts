const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  LOGIN: '/api/auth/login',
  LOGIN_MOBILE: '/login/mobile',
  REGISTER: '/api/auth/register',
  VERIFY_OTP: '/verify-otp',
  ACCOUNT: '/api/user/me',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password',
  GROUP_INVITE: '/group/invite',
  GROUP_MEMBERS: '/group/members',
  GROUP_MEMBER: (id: string) => `/group/members/${id}`,
  SETTINGS: '/api/settings',
  EXPENSES: '/api/expenses',
  EXPENSES_SUMMARY: '/api/expenses/summary',
  EXPENSES_MONTHLY_DETAILS: '/api/expenses/monthly-details',
  EXPENSES_YEARLY_DETAILS: '/api/expenses/yearly-details',
  EXPENSES_DAILY_DETAILS: '/api/expenses/daily-details',
  EXPENSES_CUSTOM_RANGE_DETAILS: '/api/expenses/custom-range-details',
  STRIPE_SESSION: '/api/create-stripe-session',
  USER_EXISTS: '/api/auth/exists',
};

export default API_CONFIG;
