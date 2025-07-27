import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InviteState {
  loading: boolean;
  error: string | null;
  success: boolean;
  invitedEmail: string | null;
  invitedName: string | null;
}

const initialState: InviteState = {
  loading: false,
  error: null,
  success: false,
  invitedEmail: null,
  invitedName: null,
};

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    inviteMemberRequest(state, action: PayloadAction<{ name: string; email: string }>) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.invitedName = action.payload.name;
      state.invitedEmail = action.payload.email;
    },
    inviteMemberSuccess(state) {
      state.loading = false;
      state.success = true;
    },
    inviteMemberFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    resetInvite(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.invitedEmail = null;
      state.invitedName = null;
    },
  },
});

export const { inviteMemberRequest, inviteMemberSuccess, inviteMemberFailure, resetInvite } = inviteSlice.actions;
export default inviteSlice.reducer;
