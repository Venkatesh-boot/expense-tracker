import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Member = {
  id: string;
  name: string;
  email: string;
};

export interface GroupMembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupMembersState = {
  members: [],
  loading: false,
  error: null,
};

const groupMembersSlice = createSlice({
  name: 'groupMembers',
  initialState,
  reducers: {
    fetchMembersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMembersSuccess(state, action: PayloadAction<Member[]>) {
      state.loading = false;
      state.members = action.payload;
      state.error = null;
    },
    fetchMembersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeMemberRequest(state, _action: PayloadAction<{ id: string }>) {
      state.loading = true;
      state.error = null;
    },
    removeMemberSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.members = state.members.filter(m => m.id !== action.payload);
    },
    removeMemberFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchMembersRequest,
  fetchMembersSuccess,
  fetchMembersFailure,
  removeMemberRequest,
  removeMemberSuccess,
  removeMemberFailure,
} = groupMembersSlice.actions;
export default groupMembersSlice.reducer;
