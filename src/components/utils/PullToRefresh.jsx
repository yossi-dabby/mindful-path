import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PullToRefresh({ children, queryKeys = [], onRefresh }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const mainElRef = useRef(null);
  const queryClient = useQueryClient();

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  // Cache the main scroll container reference once on mount
  useEffect(() => {
    mainElRef.current = document.querySelector('main');
  }, []);

  const handleTouchStart = useCallback((e) => {
    // Only activate if the main scroll container exists and is scrolled to the top
    if (mainElRef.current && mainElRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === 0 || !mainElRef.current || mainElRef.current.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0 && distance < MAX_PULL) {
      setIsPulling(true);
      setPullDistance(distance);
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      
      try {
        // Invalidate all active React Query keys
        await queryClient.invalidateQueries();
        
        // Call custom refresh handler if provided
        if (onRefresh) {
          await onRefresh();
        }
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = 0;
  }, [isPulling, pullDistance, queryClient, onRefresh]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator - fixed so it appears at the top of the viewport */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-0 right-0 flex justify-center items-center z-50"
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <Loader2 
                className={`w-4 h-4 ${isRefreshing || shouldTrigger ? 'animate-spin' : ''}`}
                style={{ 
                  color: '#26A69A',
                  transform: isRefreshing ? 'rotate(0deg)' : `rotate(${pullProgress * 360}deg)`,
                  transition: isRefreshing ? 'none' : 'transform 0.1s linear'
                }}
              />
              <span className="text-xs font-medium" style={{ color: '#1A3A34' }}>
                {isRefreshing ? 'Refreshing...' : shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ 
        transform: isPulling ? `translateY(${Math.min(pullDistance * 0.5, MAX_PULL * 0.5)}px)` : 'translateY(0)',
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}>
        {children}
      </div>
    </div>
  );
}