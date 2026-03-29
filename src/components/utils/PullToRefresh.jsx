import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { MOBILE_HEADER_HEIGHT } from '../layout/MobileHeader';
import { useTranslation } from 'react-i18next';

export default function PullToRefresh({ children, queryKeys = [], onRefresh }) {
  const { t } = useTranslation();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const mainElRef = useRef(null);
  const containerRef = useRef(null);
  const isPullingRef = useRef(false);  // used in event callbacks to avoid stale closures
  const pullDistanceRef = useRef(0);   // mirrors pullDistance state for event callbacks
  const queryClient = useQueryClient();

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  // Cache the scroll container reference once on mount
  useEffect(() => {
    mainElRef.current = document.getElementById('app-scroll-container') || document.querySelector('main');
  }, []);

  const handleTouchStart = useCallback((e) => {
    // Activate if we are scrolled to the top, or if there is no scroll container
    // (e.g. Playwright / JSDOM test environments where the element is absent).
    const atTop = !mainElRef.current || mainElRef.current.scrollTop === 0;
    if (atTop) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    // Skip if we never recorded a start position.
    // Allow when there is no scroll container (test environments).
    if (touchStartY.current === 0) return;
    if (mainElRef.current && mainElRef.current.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0) {
      const clampedDistance = Math.min(distance, MAX_PULL);
      pullDistanceRef.current = clampedDistance;
      setPullDistance(clampedDistance);

      // Set isPulling true as soon as the drag passes the release threshold,
      // regardless of whether the movement was gradual or a fast swipe that
      // jumped past MAX_PULL in a single touchmove event.
      // Only call setState when the value actually changes to avoid unnecessary re-renders.
      const shouldBePulling = distance >= PULL_THRESHOLD;
      if (shouldBePulling !== isPullingRef.current) {
        isPullingRef.current = shouldBePulling;
        setIsPulling(shouldBePulling);
      }

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

  // Register touch listeners with { passive: false } so e.preventDefault() works
  // without triggering browser warnings about passive event listeners.
  // Capture `el` at setup time so the cleanup removes listeners from the same
  // element they were added to, even if containerRef.current changes later.
  useEffect(() => {
    const el = containerRef.current;
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

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Pull indicator - fixed so it appears at the top of the viewport */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed left-0 right-0 flex justify-center items-center z-50"
          style={{ top: `calc(${MOBILE_HEADER_HEIGHT}px + env(safe-area-inset-top, 0px) + 8px)`, pointerEvents: 'none' }}
        >
          <div className="bg-card/90 backdrop-blur-sm border border-border/60 rounded-full px-4 py-2 shadow-[var(--shadow-md)] flex items-center gap-2">
            <Loader2
              className={`w-4 h-4 text-primary ${isRefreshing || isPulling ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? 'rotate(0deg)' : `rotate(${pullProgress * 360}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.1s linear'
              }}
            />
            <span className="text-xs font-medium text-foreground">
              {isRefreshing ? t('pull_to_refresh.refreshing', 'Refreshing…') : t('pull_to_refresh.release', 'Release to refresh')}
            </span>
          </div>
        </div>
      )}

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