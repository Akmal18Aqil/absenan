"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function submitQadha(ticketId: string) {
  const { error } = await supabase
    .from("qadha_tickets")
    .update({ status: "completed" })
    .eq("id", ticketId);

  if (error) {
    console.error("Failed to submit qadha:", error);
    return { success: false, error: error.message };
  }

  // Revalidate the mahasantri dashboard so it updates immediately
  revalidatePath("/mahasantri");
  return { success: true };
}
