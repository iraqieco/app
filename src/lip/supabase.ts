import { createClient } from '@supabase/supabase-js';

// We might not have these env vars during the test, so provide a fallback URL and key for now just so it doesn't crash on boot.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Organism = {
  id: string;
  name_ar: string;
  scientific_name: string;
  kingdom: string;
  phylum: string | null;
  'class': string | null;
  family: string | null;
  conservation_status: string | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
};

export type OrganismInsert = Omit<Organism, 'id' | 'created_at'>;
// Column name reference: the actual DB column is name_ar (not arabic_name)
