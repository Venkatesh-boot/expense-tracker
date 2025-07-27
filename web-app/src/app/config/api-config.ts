
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:9001',
  LOGIN: '/login',
  LOGIN_MOBILE: '/login/mobile',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  ACCOUNT: '/account',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password',
  GROUP_INVITE: '/group/invite',
  GROUP_MEMBERS: '/group/members',
  GROUP_MEMBER: (id: string) => `/group/members/${id}`,
  SETTINGS: '/settings',
  EXPENSES: '/expenses',
  STRIPE_SESSION: '/api/create-stripe-session',
};

export default API_CONFIG;
