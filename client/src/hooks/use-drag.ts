import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { reorderWidgets } from '@/store/slices/widgetsSlice';

export function useDrag(
  ref: React.RefObject<HTMLElement>,
  widgetId: string
) {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Only allow dragging from the header
      const target = e.target as HTMLElement;
      const isHeader = target.closest('[class*="header"]') !== null;
      
      if (!isHeader) return;
      
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      
      // Add dragging class to the element
      element.classList.add('dragging');
      
      // Create and append a clone for the "ghost" effect
      const rect = element.getBoundingClientRect();
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.top = `${rect.top}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.zIndex = '9999';
      clone.style.opacity = '0.8';
      clone.style.pointerEvents = 'none';
      clone.id = 'dragging-ghost';
      document.body.appendChild(clone);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setDragOffset({ x: dx, y: dy });
      
      // Update ghost position
      const ghost = document.getElementById('dragging-ghost');
      if (ghost) {
        ghost.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Get all widget elements
      const widgets = Array.from(document.querySelectorAll('[data-widget-id]'));
      const sourceIndex = widgets.findIndex(w => w.getAttribute('data-widget-id') === widgetId);
      
      // Find the widget we're hovering over
      let targetIndex = -1;
      
      widgets.forEach((widget, index) => {
        const rect = widget.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom &&
          index !== sourceIndex
        ) {
          targetIndex = index;
        }
      });
      
      // If found a valid target, swap the widgets
      if (targetIndex !== -1 && sourceIndex !== -1) {
        dispatch(reorderWidgets({ sourceIndex, targetIndex }));
      }
      
      // Clean up
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      element.classList.remove('dragging');
      
      // Remove ghost
      const ghost = document.getElementById('dragging-ghost');
      if (ghost) {
        document.body.removeChild(ghost);
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up ghost if it exists
      const ghost = document.getElementById('dragging-ghost');
      if (ghost) {
        document.body.removeChild(ghost);
      }
    };
  }, [ref, isDragging, startPos, widgetId, dispatch]);

  return {
    isDragging,
    dragOffset,
    dragProps: {
      'data-widget-id': widgetId,
      'data-dragging': isDragging ? 'true' : 'false'
    }
  };
}

export default useDrag;
