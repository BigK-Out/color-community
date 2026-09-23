// Shape of the Supabase tables, in the format `supabase gen types` produces.
// @nuxtjs/supabase picks this file up automatically, so queries like
// client.from('palettes').insert({...}) are checked against real columns.
// Keep in sync with supabase/schema.sql (or regenerate with the Supabase CLI).

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string, username: string, created_at: string }
        Insert: never // created by the on_auth_user_created trigger only
        Update: never
        Relationships: []
      }
      palettes: {
        Row: {
          id: string
          author_id: string
          name: string
          colors: string[]
          like_count: number
          created_at: string
        }
        Insert: { author_id: string, name: string, colors: string[] }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'palettes_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      likes: {
        Row: { user_id: string, palette_id: string, created_at: string }
        Insert: { user_id: string, palette_id: string }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'likes_palette_id_fkey'
            columns: ['palette_id']
            isOneToOne: false
            referencedRelation: 'palettes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
