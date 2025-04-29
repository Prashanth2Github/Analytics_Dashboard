import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  sidebarOpen: boolean;
}

const initialState: ThemeState = {
  sidebarOpen: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = themeSlice.actions;
export default themeSlice.reducer;
