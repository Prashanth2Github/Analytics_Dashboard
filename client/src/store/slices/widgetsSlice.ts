import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WidgetsState {
  widgetsOrder: string[];
  isEditMode: boolean;
}

const initialState: WidgetsState = {
  widgetsOrder: ['weather', 'news', 'finance', 'summary', 'activity'],
  isEditMode: false,
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    initWidgets: (state) => {
      // Load widget order from localStorage if available
      const savedOrder = localStorage.getItem('widgetsOrder');
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          if (Array.isArray(parsed) && parsed.length > 0) {
            state.widgetsOrder = parsed;
          }
        } catch (e) {
          // If parsing fails, use default order
          state.widgetsOrder = initialState.widgetsOrder;
        }
      }
    },
    reorderWidgets: (state, action: PayloadAction<{ sourceIndex: number; targetIndex: number }>) => {
      const { sourceIndex, targetIndex } = action.payload;
      const newOrder = [...state.widgetsOrder];
      const [movedWidget] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, movedWidget);
      state.widgetsOrder = newOrder;
      
      // Save to localStorage
      localStorage.setItem('widgetsOrder', JSON.stringify(newOrder));
    },
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgetsOrder = state.widgetsOrder.filter(id => id !== action.payload);
      
      // Save to localStorage
      localStorage.setItem('widgetsOrder', JSON.stringify(state.widgetsOrder));
    },
    addWidget: (state, action: PayloadAction<{ widgetId: string; position?: number }>) => {
      const { widgetId, position } = action.payload;
      
      // Don't add if it already exists
      if (state.widgetsOrder.includes(widgetId)) return;
      
      const newOrder = [...state.widgetsOrder];
      if (position !== undefined) {
        newOrder.splice(position, 0, widgetId);
      } else {
        newOrder.push(widgetId);
      }
      
      state.widgetsOrder = newOrder;
      
      // Save to localStorage
      localStorage.setItem('widgetsOrder', JSON.stringify(newOrder));
    },
  },
});

export const { 
  initWidgets,
  reorderWidgets, 
  toggleEditMode, 
  removeWidget, 
  addWidget 
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
