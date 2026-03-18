import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOBILE_HEADER_HEIGHT } from '../layout/MobileHeader';
import { getScrollContainer } from '@/lib/scrollContainer';

export default function PullToRefresh({ children, queryKeys = [], onRefresh }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const mainElRef = useRef(null);
  const isPullingRef = useRef(false);  // used in event callbacks to avoid stale closures
  const pullDistanceRef = useRef(0);   // mirrors pullDistance state for event callbacks
  const queryClient = useQueryClient();

  const PULL_THRESHOLD = 60;
  const MAX_PULL = 120;

  // Cache the real app scroll container once on mount
  useEffect(() => {
    mainElRef.current = getScrollContainer();
  }, []);

  const handleTouchStart = useCallback((e) => {
    const scrollEl = mainElRef.current || getScrollContainer();
    if (scrollEl && scrollEl.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    const scrollEl = mainElRef.current || getScrollContainer();
    if (touchStartY.current === 0 || !scrollEl || scrollEl.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0) {
      const clampedDistance = Math.min(distance, MAX_PULL);
      isPullingRef.current = true;
      pullDistanceRef.current = clampedDistance;
      setIsPulling(true);
      setPullDistance(clampedDistance);
      // preventDefault requires a non-passive listener (registered via useEffect below)
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    touchStartY.current = 0;
    if (!isPullingRef.current) return;

    const currentPullDistance = pullDistanceRef.current;
    isPullingRef.current = false;
    pullDistanceRef.current = 0;

    if (currentPullDistance >= PULL_THRESHOLD) {
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
  }, [queryClient, onRefresh]);

  // Register touch listeners on the app scroll container with { passive: false } so
  // e.preventDefault() works without triggering browser warnings about passive event
  // listeners. Attaching to the scroll container (rather than a child div) ensures
  // events dispatched on any element within the viewport — including empty areas of
  // the scroll container — are captured reliably.
  useEffect(() => {
    const el = mainElRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      className="relative"
    >
      {/* Pull indicator - fixed so it appears at the top of the viewport */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed left-0 right-0 flex justify-center items-center z-50"
            style={{ top: `calc(${MOBILE_HEADER_HEIGHT}px + env(safe-area-inset-top, 0px) + 8px)`, pointerEvents: 'none' }}
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