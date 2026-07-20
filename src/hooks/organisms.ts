import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Organism, OrganismInsert } from '@/lib/supabase';

export function useOrganisms(filters: { search: string, kingdom: string, phylum: string, imagesOnly: boolean, noImagesOnly: boolean }) {
  return useQuery({
    queryKey: ['organisms', filters],
    queryFn: async () => {
      let query = supabase.from('species').select('*').order('name_ar', { ascending: true });

      if (filters.search) {
        query = query.or(`name_ar.ilike.%${filters.search}%,scientific_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.kingdom && filters.kingdom !== 'All') {
        // ilike: case-insensitive exact match; trim handles any whitespace in the state value
        query = query.ilike('kingdom', filters.kingdom.trim());
      }
      if (filters.phylum && filters.phylum !== 'All') {
        query = query.eq('phylum', filters.phylum);
      }
      if (filters.imagesOnly) {
        query = query.not('image_url', 'is', null).neq('image_url', '');
      }
      if (filters.noImagesOnly) {
        query = query.or('image_url.is.null,image_url.eq.');
      }

      const { data, error } = await query;
      if (error) {
        console.error('[useOrganisms] Supabase error:', error);
        throw error;
      }
      console.log(`[useOrganisms] Returned ${data?.length ?? 0} rows from species`);
      if (data && data.length > 0) console.log('[useOrganisms] First row sample:', data[0]);
      return (data ?? []) as Organism[];
    }
  });
}

export function usePhylums() {
  return useQuery({
    queryKey: ['phylums'],
    queryFn: async () => {
      const { data, error } = await supabase.from('species').select('phylum');
      if (error) {
        console.error('[usePhylums] Supabase error:', error);
        throw error;
      }
      const phylums = Array.from(new Set((data ?? []).map((d: any) => d.phylum).filter(Boolean)));
      return phylums as string[];
    }
  });
}

export function useKingdoms() {
  return useQuery({
    queryKey: ['kingdoms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('species').select('kingdom');
      if (error) {
        console.error('[useKingdoms] Supabase error:', error);
        throw error;
      }
      const kingdoms = Array.from(
        new Set((data ?? []).map((d: any) => (d.kingdom ?? '').trim()).filter(Boolean))
      ).sort();
      return kingdoms as string[];
    }
  });
}

export function useAddOrganism() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OrganismInsert) => {
      const { error } = await supabase.from('species').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisms'] });
      queryClient.invalidateQueries({ queryKey: ['phylums'] });
    }
  });
}

export function useUpdateOrganism() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<OrganismInsert> }) => {
      const { error } = await supabase.from('species').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisms'] });
      queryClient.invalidateQueries({ queryKey: ['phylums'] });
    }
  });
}

export function useDeleteOrganism() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('species').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisms'] });
      queryClient.invalidateQueries({ queryKey: ['phylums'] });
    }
  });
}

