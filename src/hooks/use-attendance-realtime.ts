'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClientSupabase } from '@/lib/supabase/default';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { AttendanceRecord } from '@/types/attendance';

/**
 * Connection status for the realtime subscription
 */
export type RealtimeConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

/**
 * Return type for the useAttendanceRealtime hook
 */
export interface UseAttendanceRealtimeReturn {
  connectionStatus: RealtimeConnectionStatus;
  error: Error | null;
  isConnected: boolean;
}

/**
 * Options for configuring the useAttendanceRealtime hook
 */
export interface UseAttendanceRealtimeOptions {
  /**
   * Whether to enable the realtime subscription
   * @default true
   */
  enabled?: boolean;

  /**
   * Query keys to invalidate when attendance records change
   * @default ['admin-attendance']
   */
  queryKeys?: string[][];

  /**
   * Callback function when a new attendance record is inserted
   */
  onInsert?: (payload: RealtimePostgresChangesPayload<AttendanceRecord>) => void;

  /**
   * Callback function when an attendance record is updated
   */
  onUpdate?: (payload: RealtimePostgresChangesPayload<AttendanceRecord>) => void;

  /**
   * Callback function when an attendance record is deleted
   */
  onDelete?: (payload: RealtimePostgresChangesPayload<AttendanceRecord>) => void;

  /**
   * Callback function when connection status changes
   */
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
}

/**
 * Custom hook for subscribing to realtime attendance record changes
 *
 * This hook:
 * - Creates a Supabase realtime client
 * - Subscribes to INSERT, UPDATE, and DELETE events on the attendance_records table
 * - Automatically invalidates React Query cache when changes occur
 * - Manages connection status and error states
 * - Properly cleans up subscriptions on unmount
 *
 * @param options - Configuration options for the realtime subscription
 * @returns Object containing connection status, error state, and connection flag
 *
 * @example
 * ```tsx
 * function AttendanceList() {
 *   const { connectionStatus, error, isConnected } = useAttendanceRealtime({
 *     queryKeys: [['admin-attendance'], ['attendance-reports']],
 *     onInsert: (payload) => console.log('New record:', payload.new),
 *   });
 *
 *   return (
 *     <div>
 *       Status: {connectionStatus}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAttendanceRealtime(
  options: UseAttendanceRealtimeOptions = {}
): UseAttendanceRealtimeReturn {
  const {
    enabled = true,
    queryKeys = [['admin-attendance']],
    onInsert,
    onUpdate,
    onDelete,
    onStatusChange,
  } = options;

  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('connecting');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if not enabled
    if (!enabled) {
      setConnectionStatus('disconnected');
      return;
    }

    let mounted = true;
    const supabase = createClientSupabase();

    console.log('[useAttendanceRealtime] 🚀 Initializing realtime subscription...');
    console.log('[useAttendanceRealtime] 📋 Query keys to invalidate:', queryKeys);

    /**
     * Update connection status and notify callback
     */
    const updateStatus = (status: RealtimeConnectionStatus) => {
      if (!mounted) return;

      console.log('[useAttendanceRealtime] 📡 Status changed:', status);
      setConnectionStatus(status);
      onStatusChange?.(status);
    };

    /**
     * Handle errors during subscription
     */
    const handleError = (err: Error) => {
      if (!mounted) return;

      setError(err);
      updateStatus('error');
      console.error('[useAttendanceRealtime] ❌ Error:', err);
    };

    /**
     * Invalidate React Query cache for specified query keys
     */
    const invalidateQueries = () => {
      console.log('[useAttendanceRealtime] 🔄 Invalidating queries...');

      queryKeys.forEach((queryKey) => {
        console.log('[useAttendanceRealtime] 🔑 Invalidating key:', queryKey);
        queryClient.invalidateQueries({ queryKey });
      });

      console.log('[useAttendanceRealtime] ✅ All queries invalidated');
    };

    try {
      // Create a unique channel name with timestamp to avoid conflicts
      const channelName = `attendance-records-${Date.now()}`;
      console.log('[useAttendanceRealtime] 📺 Creating channel:', channelName);

      // Create the realtime channel
      const channel = supabase.channel(channelName);

      // Subscribe to INSERT events
      channel.on<AttendanceRecord>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
        },
        (payload) => {
          if (!mounted) return;

          console.log('[useAttendanceRealtime] 🆕 INSERT event received!');
          console.log('[useAttendanceRealtime] 📦 Payload:', payload);

          // Invalidate queries to refetch data
          invalidateQueries();

          // Call custom callback if provided
          onInsert?.(payload);
        }
      );

      // Subscribe to UPDATE events
      channel.on<AttendanceRecord>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attendance_records',
        },
        (payload) => {
          if (!mounted) return;

          console.log('[useAttendanceRealtime] ✏️ UPDATE event received!');
          console.log('[useAttendanceRealtime] 📦 Payload:', payload);

          // Invalidate queries to refetch data
          invalidateQueries();

          // Call custom callback if provided
          onUpdate?.(payload);
        }
      );

      // Subscribe to DELETE events
      channel.on<AttendanceRecord>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'attendance_records',
        },
        (payload) => {
          if (!mounted) return;

          console.log('[useAttendanceRealtime] 🗑️ DELETE event received!');
          console.log('[useAttendanceRealtime] 📦 Payload:', payload);

          // Invalidate queries to refetch data
          invalidateQueries();

          // Call custom callback if provided
          onDelete?.(payload);
        }
      );

      // Subscribe to the channel
      channel
        .subscribe((status, err) => {
          if (!mounted) return;

          console.log('[useAttendanceRealtime] 📡 Subscription status:', status);

          if (err) {
            console.error('[useAttendanceRealtime] ❌ Subscription error:', err);
            handleError(new Error(`Subscription error: ${err.message || 'Unknown error'}`));
            return;
          }

          switch (status) {
            case 'SUBSCRIBED':
              updateStatus('connected');
              console.log('[useAttendanceRealtime] ✅ Successfully subscribed to attendance_records');
              console.log('[useAttendanceRealtime] 🎉 Realtime is now active and listening for changes!');
              break;
            case 'CHANNEL_ERROR':
              console.error('[useAttendanceRealtime] ❌ Channel error occurred');
              handleError(new Error('Channel error occurred'));
              break;
            case 'TIMED_OUT':
              console.error('[useAttendanceRealtime] ⏱️ Subscription timed out');
              handleError(new Error('Subscription timed out'));
              break;
            case 'CLOSED':
              updateStatus('disconnected');
              console.log('[useAttendanceRealtime] 🔌 Channel closed');
              break;
            default:
              console.log('[useAttendanceRealtime] ℹ️ Unknown status:', status);
              break;
          }
        });

      // Store channel reference for cleanup
      channelRef.current = channel;
    } catch (err) {
      console.error('[useAttendanceRealtime] ❌ Failed to create subscription:', err);
      handleError(err instanceof Error ? err : new Error('Failed to create realtime subscription'));
    }

    // Cleanup function
    return () => {
      mounted = false;

      if (channelRef.current) {
        console.log('[useAttendanceRealtime] 🧹 Cleaning up subscription');

        // Unsubscribe from the channel
        supabase
          .removeChannel(channelRef.current)
          .then(() => {
            console.log('[useAttendanceRealtime] ✅ Channel removed successfully');
          })
          .catch((err) => {
            console.error('[useAttendanceRealtime] ❌ Error removing channel:', err);
          });

        channelRef.current = null;
      }
    };
  }, [enabled, queryClient, onInsert, onUpdate, onDelete, onStatusChange, queryKeys]);

  return {
    connectionStatus,
    error,
    isConnected: connectionStatus === 'connected',
  };
}
