import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log(
  'SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL,
  'KEY EXISTS:', !!import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Tipos baseados no seu schema
// export interface Aluno {
//   Aluno_ID: number;
//   Familia_ID: number | null;
//   Nome: string;
//   Data_nascimento: string | null;
//   Serie: string | null;
//   Status: string | null;
//   created_at?: string;
//   updated_at?: string;
// }

// // export interface Familias {
// //   Familia_ID: number;
// //   Nome_responsavel: string;
// //   Telefone: string;
// //   Email: string | null;
// //   Endereco: string | null;
// // }

// export interface Escola {
//   Escola_ID: number;
//   Nome: string;
//   CNPJ: number | null;
//   Email: string | null;
//   Telefone: string | null;
//   Endereco: string | null;
// }

// export interface AlunoFormData {
//   Nome: string;
//   Data_nascimento: string;
//   Serie: string;
//   Status: string;
//   Familia_ID?: number | null;
//   Escola_ID?: number | null;
// }

// export interface FamiliaFormData {
//   Nome_responsavel: string;
//   Telefone: string;
//   Email: string;
//   Endereco: string;
// }

