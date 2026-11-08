import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vkcdgztzsfoqznbbrmof.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LE6JwR1ncFYSFwc5y0c-fg_4UiVf8Y9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const fetchCloudLineage = async () => {
  try {
    const { data, error } = await supabase
      .from('lineage')
      .select('data')
      .eq('id', 'root')
      .maybeSingle();

    if (error) {
      console.warn('[Okpori Supabase] fetchCloudLineage error:', error);
      return null;
    }
    return data?.data || null;
  } catch (err) {
    console.warn('[Okpori Supabase] fetchCloudLineage exception:', err);
    return null;
  }
};

export const saveCloudLineage = async (lineageTree) => {
  try {
    const { error } = await supabase.from('lineage').upsert(
      {
        id: 'root',
        data: lineageTree,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('[Okpori Supabase] saveCloudLineage error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Okpori Supabase] saveCloudLineage exception:', err);
    return false;
  }
};

export const fetchCloudGallery = async () => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Okpori Supabase] fetchCloudGallery error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[Okpori Supabase] fetchCloudGallery exception:', err);
    return null;
  }
};

export const saveCloudGalleryItem = async (item) => {
  try {
    const { error } = await supabase.from('gallery').upsert(
      {
        id: item.id || `photo_${Date.now()}`,
        occasion: item.occasion || '',
        year: item.year || '',
        subjects: item.subjects || '',
        location: item.location || '',
        url: item.url,
        created_at: item.created_at || new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('[Okpori Supabase] saveCloudGalleryItem error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Okpori Supabase] saveCloudGalleryItem exception:', err);
    return false;
  }
};

export const removeCloudGalleryItem = async (id) => {
  try {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) {
      console.error('[Okpori Supabase] removeCloudGalleryItem error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Okpori Supabase] removeCloudGalleryItem exception:', err);
    return false;
  }
};
