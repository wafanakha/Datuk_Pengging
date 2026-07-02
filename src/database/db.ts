import Dexie, { Table } from "dexie";
import {
  Resident,
  CustomField,
  ResidentCustomField,
  Letter,
  LetterTemplate,
  VillageInfo,
  LetterType,
  LetterHistory,
  Official,
} from "../types";
import { supabase, toCamel, toSnake } from "./supabaseClient";

class VillageAdministrationDB extends Dexie {
  residents!: Table<Resident, number>;
  customFields!: Table<CustomField, number>;
  residentCustomFields!: Table<ResidentCustomField, number>;
  letters!: Table<Letter, number>;
  letterTemplates!: Table<LetterTemplate, number>;
  villageInfo!: Table<VillageInfo, number>;
  letterHistory!: Table<LetterHistory, number>;
  officials!: Table<Official, number>;

  constructor() {
    super("VillageAdministrationDB");

    const schema = {
      residents:
        "++id, kk, nik, name, birthDate, gender, address, rt, rw, religion, occupation, maritalStatus, createdAt, updatedAt",
      customFields: "++id, name, type, required",
      residentCustomFields: "++id, residentId, customFieldId, value",
      letters:
        "++id, letterNumber, letterType, residentId, title, issuedDate, status, createdAt, updatedAt",
      letterTemplates: "++id, name, type, isDefault, createdAt, updatedAt",
      villageInfo: "++id, name",
      letterHistory: "++id, name, letter, date, nik",
      officials: "++id, name, title",
    };

    this.version(1).stores(schema);

    // Bump schema version so older IndexedDB snapshots can upgrade safely.
    this.version(2).stores(schema);

    // Initialize default templates
    this.on("ready", async () => {
      const count = await this.letterTemplates.count();
      if (count === 0) {
        await this.initializeDefaultTemplates();
      }

      const villageCount = await this.villageInfo.count();
      if (villageCount === 0) {
        await this.initializeVillageInfo();
      }
    });
  }

  async initializeDefaultTemplates() {
    const now = new Date();
    const defaultTemplates = [
      {
        name: "Surat Keterangan Domisili",
        type: "domicile" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
        
Adalah benar warga yang berdomisili di [RESIDENT_ADDRESS], Kelurahan [VILLAGE_NAME], Kecamatan [VILLAGE_DISTRICT], Kabupaten [VILLAGE_REGENCY], Provinsi [VILLAGE_PROVINCE].
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Keterangan Tidak Mampu",
        type: "poverty" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
Alamat: [RESIDENT_ADDRESS]
        
Berdasarkan pengamatan kami, yang bersangkutan adalah benar termasuk keluarga tidak mampu/prasejahtera di Kelurahan [VILLAGE_NAME], Kecamatan [VILLAGE_DISTRICT], Kabupaten [VILLAGE_REGENCY], Provinsi [VILLAGE_PROVINCE].
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Pengantar",
        type: "introduction" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini memberikan pengantar kepada:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
Alamat: [RESIDENT_ADDRESS]
        
Untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Keterangan Usaha",
        type: "business" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Nama: [RESIDENT_NAME]
NIK: [RESIDENT_NIK]
Tempat/Tanggal Lahir: [RESIDENT_BIRTHDATE]
Jenis Kelamin: [RESIDENT_GENDER]
Agama: [RESIDENT_RELIGION]
Pekerjaan: [RESIDENT_OCCUPATION]
Status Perkawinan: [RESIDENT_MARITAL_STATUS]
Alamat: [RESIDENT_ADDRESS]
        
Adalah benar memiliki usaha [BUSINESS_TYPE] yang berlokasi di [BUSINESS_ADDRESS], Kelurahan [VILLAGE_NAME], Kecamatan [VILLAGE_DISTRICT], Kabupaten [VILLAGE_REGENCY], Provinsi [VILLAGE_PROVINCE].
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Surat Keterangan Kelahiran",
        type: "birth" as LetterType,
        template: `Yang bertanda tangan di bawah ini:

Nama: [VILLAGE_LEADER_NAME]
Jabatan: [VILLAGE_LEADER_TITLE]
        
Dengan ini menerangkan bahwa:
        
Telah lahir seorang anak:
        
Nama: [CHILD_NAME]
Tempat/Tanggal Lahir: [BIRTH_PLACE], [BIRTH_DATE]
Jenis Kelamin: [CHILD_GENDER]
        
Dari pasangan suami istri:
        
Nama Ayah: [FATHER_NAME]
NIK Ayah: [FATHER_NIK]
Nama Ibu: [MOTHER_NAME]
NIK Ibu: [MOTHER_NIK]
Alamat: [PARENTS_ADDRESS]
        
Surat Keterangan ini dibuat untuk keperluan [LETTER_PURPOSE].
        
Demikian Surat Keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await this.letterTemplates.bulkAdd(defaultTemplates);
  }

  async initializeVillageInfo() {
    const defaultVillageInfo: VillageInfo = {
      name: "Arcawinangun",
      address:
        "Jl. Balai Kelurahan No.32, Arcawinangun, Kec. Purwokerto Tim., Kabupaten Banyumas, Jawa Tengah 53113",
      districtName: "Purwokerto Timur",
      regencyName: "Banyumas",
      provinceName: "Jawa Tengah",
      VillageCode: "33.02.26.1006",
      bpsCode: "3302730006",
      phoneNumber: "-",
      leaderName: "Nama Lurah Arcawinangun",
      sekretaris: "Nama Sekretaris Kelurahan (Seklur)",
      kasipemerintah: "Nama Kasi Pemerintahan dan Pembangunan",
      kasiKesejahteraan: "Nama Kasi Kesejahteraan Sosial (Kesos)",
      kasiPelayanan: "Nama Kasi Ketentraman dan Ketertiban Umum (Trantib)",
      kaurUmumNTataUsaha: "Nama Staf Administrasi/Tenaga IT",
      kaurKeuangan: "Nama Tenaga Kebersihan/Umum",
      kaurPerencanaan: "Nama Staf Pendukung Kelurahan",
      kadus1: "Nama Staf Pendukung Kelurahan 1",
      kadus2: "Nama Staf Pendukung Kelurahan 2",
      kadus3: "Nama Staf Pendukung Kelurahan 3",
      leaderTitle: "Lurah",
    };

    await this.villageInfo.add(defaultVillageInfo);
  }

  async exportData() {
    const { data: residents } = await supabase.from("residents").select("*");
    const { data: customFields } = await supabase.from("custom_fields").select("*");
    const { data: residentCustomFields } = await supabase.from("resident_custom_fields").select("*");
    const { data: letters } = await supabase.from("letters").select("*");
    const { data: letterTemplates } = await supabase.from("letter_templates").select("*");
    const { data: villageInfo } = await supabase.from("village_info").select("*");

    return {
      residents: toCamel(residents || []),
      customFields: toCamel(customFields || []),
      residentCustomFields: toCamel(residentCustomFields || []),
      letters: toCamel(letters || []),
      letterTemplates: toCamel(letterTemplates || []),
      villageInfo: toCamel(villageInfo || []),
    };
  }

  async importData(data: any) {
    // Clean all existing data from Supabase tables
    await supabase.from("resident_custom_fields").delete().neq("id", -1);
    await supabase.from("letters").delete().neq("id", -1);
    await supabase.from("residents").delete().neq("id", -1);
    await supabase.from("custom_fields").delete().neq("id", -1);
    await supabase.from("letter_templates").delete().neq("id", -1);
    await supabase.from("village_info").delete().neq("id", -1);

    // Import new data in order to respect foreign key constraints
    if (data.villageInfo && data.villageInfo.length > 0) {
      const { error } = await supabase.from("village_info").insert(toSnake(data.villageInfo));
      if (error) console.error("Error importing villageInfo:", error.message);
    }
    if (data.customFields && data.customFields.length > 0) {
      const { error } = await supabase.from("custom_fields").insert(toSnake(data.customFields));
      if (error) console.error("Error importing customFields:", error.message);
    }
    if (data.residents && data.residents.length > 0) {
      const { error } = await supabase.from("residents").insert(toSnake(data.residents));
      if (error) console.error("Error importing residents:", error.message);
    }
    if (data.residentCustomFields && data.residentCustomFields.length > 0) {
      const { error } = await supabase.from("resident_custom_fields").insert(toSnake(data.residentCustomFields));
      if (error) console.error("Error importing residentCustomFields:", error.message);
    }
    if (data.letterTemplates && data.letterTemplates.length > 0) {
      const { error } = await supabase.from("letter_templates").insert(toSnake(data.letterTemplates));
      if (error) console.error("Error importing letterTemplates:", error.message);
    }
    if (data.letters && data.letters.length > 0) {
      const { error } = await supabase.from("letters").insert(toSnake(data.letters));
      if (error) console.error("Error importing letters:", error.message);
    }
    return true;
  }
}

export const db = new VillageAdministrationDB();
