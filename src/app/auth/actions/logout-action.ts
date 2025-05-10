"use server";
import { cookies } from "next/headers";


export async function logoutAction() {
  (await cookies()).delete('auth_token');
  (await cookies()).delete('username');
  return { success: true };
}