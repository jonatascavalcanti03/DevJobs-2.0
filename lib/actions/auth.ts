"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string; // 'CANDIDATE' or 'COMPANY'

  if (!email || !password || !role) {
    return { error: "Todos os campos são obrigatórios." };
  }

  if (role !== "CANDIDATE" && role !== "COMPANY") {
    return { error: "Tipo de conta inválido." };
  }

  const supabase = await createClient();

  // Criação do usuário na auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role, // Armazena na metadata
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Insere na tabela public.users
    const { error: dbError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: authData.user.email,
      role: role,
    });

    if (dbError) {
      // Se der erro ao inserir na public.users, idealmente deveria reverter a auth,
      // mas por enquanto apenas retornamos o erro.
      console.error("Erro ao inserir na tabela users:", dbError);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
