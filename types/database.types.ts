/**
 * Tipos do banco gerados pelo Supabase CLI.
 *
 * Para gerar a versão real a partir do seu projeto:
 *   npx supabase login
 *   npx supabase link --project-ref SEU_REF
 *   npm run db:types
 *
 * O conteúdo abaixo é um esqueleto inicial — será sobrescrito ao gerar os tipos.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; nome: string | null; papel: string; created_at: string }
        Insert: { id: string; nome?: string | null; papel?: string }
        Update: { nome?: string | null; papel?: string }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefone: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: { nome: string; email?: string | null; telefone?: string | null; owner_id: string }
        Update: { nome?: string; email?: string | null; telefone?: string | null }
      }
    }
  }
}
