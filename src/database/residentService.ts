import { supabase, toCamel, toSnake } from "./supabaseClient";
import { Resident, CustomField, ResidentCustomField } from "../types";

export const residentService = {
  getAllResidents: async () => {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamel(data) || [];
  },

  getResidentById: async (id: number) => {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return undefined;
    return toCamel(data);
  },

  getResidentByNik: async (nik: string) => {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .eq("nik", nik)
      .maybeSingle();
    if (error) return undefined;
    return toCamel(data);
  },

  searchResidents: async (query: string) => {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .or(`name.ilike.%${query}%,nik.ilike.%${query}%,address.ilike.%${query}%`)
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamel(data) || [];
  },

  addResident: async (resident: Resident) => {
    const existingResident = await residentService.getResidentByNik(
      resident.nik
    );
    if (existingResident) {
      throw new Error("NIK sudah terdaftar");
    }

    const now = new Date().toISOString();
    const residentSnake = toSnake({
      ...resident,
      createdAt: now,
      updatedAt: now,
    });
    delete residentSnake.id;

    const { data, error } = await supabase
      .from("residents")
      .insert(residentSnake)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data).id;
  },

  updateResident: async (id: number, resident: Partial<Resident>) => {
    if (resident.nik) {
      const existingResident = await residentService.getResidentByNik(
        resident.nik
      );
      if (existingResident && existingResident.id !== id) {
        throw new Error("NIK sudah terdaftar oleh warga lain");
      }
    }

    const now = new Date().toISOString();
    const residentSnake = toSnake({
      ...resident,
      updatedAt: now,
    });
    delete residentSnake.id;

    const { data, error } = await supabase
      .from("residents")
      .update(residentSnake)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  deleteResident: async (id: number) => {
    const { count, error: countError } = await supabase
      .from("letters")
      .select("*", { count: "exact", head: true })
      .eq("resident_id", id);
    if (countError) throw countError;
    if (count && count > 0) {
      throw new Error(
        "Tidak dapat menghapus warga karena masih memiliki dokumen surat terkait"
      );
    }

    await supabase
      .from("resident_custom_fields")
      .delete()
      .eq("resident_id", id);

    const { error } = await supabase.from("residents").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  getCustomFields: async () => {
    const { data, error } = await supabase
      .from("custom_fields")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return toCamel(data) || [];
  },

  addCustomField: async (field: CustomField) => {
    const { data, error } = await supabase
      .from("custom_fields")
      .insert(toSnake(field))
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Nama field sudah ada");
      }
      throw error;
    }
    return toCamel(data).id;
  },

  updateCustomField: async (id: number, field: Partial<CustomField>) => {
    const { data, error } = await supabase
      .from("custom_fields")
      .update(toSnake(field))
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("Nama field sudah ada");
      }
      throw error;
    }
    return toCamel(data);
  },

  deleteCustomField: async (id: number) => {
    await supabase
      .from("resident_custom_fields")
      .delete()
      .eq("custom_field_id", id);

    const { error } = await supabase.from("custom_fields").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  getResidentCustomFields: async (residentId: number) => {
    const { data, error } = await supabase
      .from("resident_custom_fields")
      .select("*")
      .eq("resident_id", residentId);
    if (error) throw error;
    return toCamel(data) || [];
  },

  setResidentCustomField: async (
    residentId: number,
    customFieldId: number,
    value: string
  ) => {
    const { data, error } = await supabase
      .from("resident_custom_fields")
      .upsert(
        toSnake({
          residentId,
          customFieldId,
          value,
        }),
        { onConflict: "resident_id,custom_field_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return toCamel(data).id;
  },

  searchKk: async (query: string) => {
    const { data, error } = await supabase
      .from("residents")
      .select("*")
      .ilike("kk", `%${query}%`);
    if (error) throw error;
    const residents: Resident[] = toCamel(data) || [];

    const grouped: Record<string, Resident[]> = {};
    residents.forEach((r) => {
      const kk = String(r.kk ?? "");
      if (!grouped[kk]) grouped[kk] = [];
      grouped[kk].push(r);
    });

    return Object.entries(grouped).map(([kk, members]) => ({
      kk,
      headName:
        members.find((m) => m.shdk === "Kepala Keluarga")?.name ||
        members[0]?.name ||
        "-",
      members,
    }));
  },
};