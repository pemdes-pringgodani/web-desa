"use server";

import { createClient } from "../lib/supabase/server";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal harus 6 karakter"),
  name: z.string().min(2, "Nama minimal harus 2 karakter"),
});

const signInSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export async function signUp(values: z.infer<typeof signUpSchema>) {
  // 1. Strict server-side validation
  const validation = signUpSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password, name } = validation.data;
  const supabase = await createClient();

  // 2. Sign up with Supabase Auth (passing name in metadata)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data.user };
}

export async function signIn(values: z.infer<typeof signInSchema>) {
  // 1. Strict server-side validation
  const validation = signInSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password } = validation.data;
  const supabase = await createClient();

  // 2. Login with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
