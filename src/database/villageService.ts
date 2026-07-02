import { supabase, toCamel, toSnake } from "./supabaseClient";
import { VillageInfo } from "../types";

export const villageService = {
  getVillageInfo: async () => {
    const { data, error } = await supabase
      .from("village_info")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toCamel(data) : undefined;
  },

  updateVillageInfo: async (info: Partial<VillageInfo>) => {
    const existingInfo = await supabase
      .from("village_info")
      .select("*")
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();
    const payloadSnake = toSnake({
      ...info,
      updatedAt: now,
    });
    delete payloadSnake.id;

    if (existingInfo.data) {
      const id = existingInfo.data.id;
      const { data, error } = await supabase
        .from("village_info")
        .update(payloadSnake)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return toCamel(data);
    } else {
      const defaultVillageInfo = toSnake({
        name: info.name || "Arcawinangun",
        address:
          info.address ||
          "Jl. Balai Kelurahan No.32, Arcawinangun, Kec. Purwokerto Tim., Kabupaten Banyumas, Jawa Tengah 53113",
        districtName: info.districtName || "Purwokerto Timur",
        regencyName: info.regencyName || "Banyumas",
        provinceName: info.provinceName || "Jawa Tengah",
        VillageCode: info.VillageCode || "33.02.26.1006",
        bpsCode: info.bpsCode || "3302730006",
        postalCode: info.postalCode || "53113",
        phoneNumber: info.phoneNumber || "-",
        email: info.email || "kelurahan.arcawinangun@example.com",
        website: info.website || "-",
        leaderName: info.leaderName || "Nama Lurah Arcawinangun",
        leaderTitle: info.leaderTitle || "Lurah",
        sekretaris: info.sekretaris || "Nama Sekretaris Kelurahan (Seklur)",
        kasipemerintah:
          info.kasipemerintah || "Nama Kasi Pemerintahan dan Pembangunan",
        kasiKesejahteraan:
          info.kasiKesejahteraan || "Nama Kasi Kesejahteraan Sosial (Kesos)",
        kasiPelayanan:
          info.kasiPelayanan ||
          "Nama Kasi Ketentraman dan Ketertiban Umum (Trantib)",
        kaurUmumNTataUsaha:
          info.kaurUmumNTataUsaha || "Nama Staf Administrasi/Tenaga IT",
        kaurKeuangan: info.kaurKeuangan || "Nama Tenaga Kebersihan/Umum",
        kaurPerencanaan:
          info.kaurPerencanaan || "Nama Staf Pendukung Kelurahan",
        kadus1: info.kadus1 || "Nama Staf Pendukung Kelurahan 1",
        kadus2: info.kadus2 || "Nama Staf Pendukung Kelurahan 2",
        kadus3: info.kadus3 || "Nama Staf Pendukung Kelurahan 3",
        createdAt: now,
        updatedAt: now,
        ...info,
      });

      const { data, error } = await supabase
        .from("village_info")
        .insert(defaultVillageInfo)
        .select()
        .single();
      if (error) throw error;
      return toCamel(data);
    }
  },

  setVillageLogo: async (logoUrl: string) => {
    const existingInfo = await supabase
      .from("village_info")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existingInfo.data) {
      const id = existingInfo.data.id;
      const { data, error } = await supabase
        .from("village_info")
        .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return toCamel(data);
    } else {
      throw new Error("Informasi kelurahan belum ada");
    }
  },

  setLeaderSignature: async (signatureUrl: string) => {
    const existingInfo = await supabase
      .from("village_info")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existingInfo.data) {
      const id = existingInfo.data.id;
      const { data, error } = await supabase
        .from("village_info")
        .update({
          signature_url: signatureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return toCamel(data);
    } else {
      throw new Error("Informasi kelurahan belum ada");
    }
  },
};