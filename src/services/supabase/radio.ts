/**
 * Holy Culture Radio - Radio Schedule Service
 * Get radio schedule from Supabase
 */

import { supabase } from '../../lib/supabase';
import type { RadioSchedule } from '../../lib/database.types';

export interface CurrentShow extends RadioSchedule {
  isLive: boolean;
  timeRemaining: number; // minutes
}

class RadioService {
  /**
   * Get full radio schedule
   */
  async getSchedule() {
    const { data, error } = await supabase
      .from('radio_schedule')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Get schedule error:', error);
      throw error;
    }

    return data as RadioSchedule[];
  }

  /**
   * Get schedule for a specific day
   */
  async getDaySchedule(dayOfWeek: number) {
    const { data, error } = await supabase
      .from('radio_schedule')
      .select('*')
      .eq('is_active', true)
      .eq('day_of_week', dayOfWeek)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Get day schedule error:', error);
      throw error;
    }

    return data as RadioSchedule[];
  }

  /**
   * Get today's schedule
   */
  async getTodaySchedule() {
    const today = new Date().getDay(); // 0 = Sunday
    return this.getDaySchedule(today);
  }

  /**
   * Get current show (what's playing now)
   */
  async getCurrentShow(): Promise<CurrentShow | null> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const { data, error } = await supabase
      .from('radio_schedule')
      .select('*')
      .eq('is_active', true)
      .eq('day_of_week', dayOfWeek)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)
      .single();

    if (error) {
      // No show currently airing
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Get current show error:', error);
      throw error;
    }

    if (!data) return null;

    // Calculate time remaining
    const endTimeParts = data.end_time.split(':');
    const endDate = new Date();
    endDate.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 0);
    const timeRemaining = Math.max(0, Math.round((endDate.getTime() - now.getTime()) / 60000));

    return {
      ...data,
      isLive: true,
      timeRemaining,
    };
  }

  /**
   * Get upcoming shows
   */
  async getUpcomingShows(limit: number = 5): Promise<RadioSchedule[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    // Get shows later today
    const { data: todayShows, error: todayError } = await supabase
      .from('radio_schedule')
      .select('*')
      .eq('is_active', true)
      .eq('day_of_week', dayOfWeek)
      .gt('start_time', currentTime)
      .order('start_time', { ascending: true })
      .limit(limit);

    if (todayError) {
      console.error('Get upcoming shows error:', todayError);
      throw todayError;
    }

    const upcoming = todayShows || [];

    // If we need more, get shows from tomorrow
    if (upcoming.length < limit) {
      const nextDay = (dayOfWeek + 1) % 7;
      const { data: tomorrowShows } = await supabase
        .from('radio_schedule')
        .select('*')
        .eq('is_active', true)
        .eq('day_of_week', nextDay)
        .order('start_time', { ascending: true })
        .limit(limit - upcoming.length);

      upcoming.push(...(tomorrowShows || []));
    }

    return upcoming;
  }

  /**
   * Get show by ID
   */
  async getShow(id: string) {
    const { data, error } = await supabase
      .from('radio_schedule')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get show error:', error);
      throw error;
    }

    return data as RadioSchedule;
  }
}

export const radioService = new RadioService();
export default radioService;
