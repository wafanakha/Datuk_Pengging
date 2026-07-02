import { Resident, LetterHistory } from "../types";
import { residentService as dbResidentService } from "../database/residentService";
import { supabase, toCamel, toSnake } from "../database/supabaseClient";

export const getAllResidents = async (): Promise<Resident[]> => {
  return await dbResidentService.getAllResidents();
};

export const saveLetterHistory = async (
  history: LetterHistory
): Promise<void> => {
  const historySnake = toSnake(history);
  delete historySnake.id;

  const { error } = await supabase
    .from("letter_history")
    .insert(historySnake);
  if (error) throw error;
};

export const getLetterHistory = async (): Promise<LetterHistory[]> => {
  const { data, error } = await supabase
    .from("letter_history")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return toCamel(data) || [];
};

export const deleteLetterHistory = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("letter_history")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

export const residentService = {
  ...dbResidentService,
  searchByNikOrName: dbResidentService.searchResidents,
};
