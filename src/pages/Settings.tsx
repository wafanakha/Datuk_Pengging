import React, { useState, useEffect, useRef } from "react";
import { db } from "../database/db";
import { useForm, Controller } from "react-hook-form";
import {
  Save,
  Upload,
  Download,
  HardDrive,
  FileUp,
  FileDown,
  Image,
  FileSignature as Signature,
} from "lucide-react";
import { villageService } from "../database/villageService";
import { exportService } from "../services/exportService";
import { VillageInfo } from "../types";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { toast } from "react-toastify";

interface SettingsProps {
  onResidentsImported?: () => Promise<void> | void;
}

const normalizeText = (value: unknown) => String(value ?? "").trim();

const normalizeGender = (value: unknown) => {
  const normalized = normalizeText(value).toLowerCase();
  if (["l", "laki-laki", "laki laki", "male", "pria"].includes(normalized)) {
    return "Laki-laki";
  }
  if (["p", "perempuan", "female", "wanita"].includes(normalized)) {
    return "Perempuan";
  }
  return "Laki-laki";
};

const normalizeReligion = (value: unknown) => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "islam") return "Islam";
  if (["protestan", "kristen", "kristen protestan"].includes(normalized)) {
    return "Protestan";
  }
  if (["katolik", "kristen katolik"].includes(normalized)) return "Katolik";
  if (normalized === "hindu") return "Hindu";
  if (normalized === "buddha") return "Buddha";
  if (normalized === "konghucu") return "Konghucu";
  return "Islam";
};

const normalizeBloodType = (value: unknown) => {
  const normalized = normalizeText(value).toUpperCase();
  const validBloodTypes = [
    "A",
    "B",
    "AB",
    "O",
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
    "TIDAK TAHU",
  ];

  return validBloodTypes.includes(normalized) ? normalized : "TIDAK TAHU";
};

const normalizeEducation = (value: unknown) => {
  const normalized = normalizeText(value);
  const mapping: Record<string, string> = {
    "SD/Sederajat": "Tamat SD/Sederajat",
    "Diploma I/II/III": "Akademi/Diploma III/S. Muda",
    Strata2: "Strata II",
    Strata3: "Strata III",
  };

  return mapping[normalized] || normalized || "Tidak/belum sekolah";
};

const normalizeMaritalStatus = (value: unknown) => {
  const normalized = normalizeText(value).toLowerCase();
  if (["belum kawin", "single"].includes(normalized)) return "Belum Kawin";
  if (["kawin", "menikah", "married"].includes(normalized)) return "Kawin";
  if (["cerai hidup", "cerai"].includes(normalized)) return "Cerai Hidup";
  if (["cerai mati", "janda", "duda", "widowed"].includes(normalized)) {
    return "Cerai Mati";
  }
  return "Belum Kawin";
};

const normalizeShdk = (value: unknown) => {
  const normalized = normalizeText(value).toLowerCase();
  if (["kepala keluarga", "kk"].includes(normalized)) return "Kepala Keluarga";
  if (["anak"].includes(normalized)) return "Anak";
  if (["istri", "suami"].includes(normalized)) return "Istri";
  return "Lainnya";
};

const normalizeRtRw = (value: unknown) => {
  const normalized = normalizeText(value);
  const digitsOnly = normalized.replace(/\D/g, "");
  const source = digitsOnly || normalized;
  return (source || "000").padStart(3, "0");
};

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};

const toDate = (value: unknown, fallback = new Date()) => {
  const parsed = new Date(normalizeText(value));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const calculateAge = (birthDate: string, today: Date) => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const Settings: React.FC<SettingsProps> = ({ onResidentsImported }) => {
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUploadLogoModalOpen, setIsUploadLogoModalOpen] = useState(false);
  const [isUploadSignatureModalOpen, setIsUploadSignatureModalOpen] =
    useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<VillageInfo>();

  useEffect(() => {
    loadVillageInfo();
  }, []);

  const loadVillageInfo = async () => {
    setIsLoading(true);
    try {
      const info = await villageService.getVillageInfo();
      setVillageInfo(info);

      if (info) {
        // Set form values
        setValue("name", info.name);
        setValue("address", info.address);
        setValue("districtName", info.districtName);
        setValue("regencyName", info.regencyName);
        setValue("provinceName", info.provinceName);
        setValue("phoneNumber", info.phoneNumber);
        setValue("leaderName", info.leaderName);
        setValue("VillageCode", info.VillageCode);
        setValue("bpsCode", info.bpsCode);
        setValue("kasipemerintah", info.kasipemerintah);
        setValue("sekretaris", info.sekretaris);
        setValue("kaurUmumNTataUsaha", info.kaurUmumNTataUsaha);
        setValue("kaurKeuangan", info.kaurKeuangan);
        setValue("kaurPerencanaan", info.kaurPerencanaan);
        setValue("kasiKesejahteraan", info.kasiKesejahteraan);
        setValue("kasiPelayanan", info.kasiPelayanan);
        setValue("kadus1", info.kadus1);
        setValue("kadus2", info.kadus2);
        setValue("kadus3", info.kadus3);
      }
    } catch (error: any) {
      console.error("Error loading village info:", error);
      const errMsg = error?.message || error?.details || JSON.stringify(error);
      toast.error(`Gagal memuat informasi kelurahan: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VillageInfo) => {
    setIsSubmitting(true);

    try {
      await villageService.updateVillageInfo(data);
      toast.success("Informasi kelurahan berhasil diperbarui");
      loadVillageInfo();
    } catch (error: any) {
      console.error("Error updating village info:", error);
      const errMsg = error?.message || error?.details || JSON.stringify(error);
      toast.error(`Gagal memperbarui informasi kelurahan: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportService.exportDatabase();
      toast.success("Data berhasil diekspor");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportedFile(file);
    }
  };

  const confirmImport = async () => {
    if (!importedFile) {
      toast.error("Tidak ada file yang dipilih");
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error("Gagal membaca file JSON");
      setIsImporting(false);
    };

    reader.readAsText(importedFile);
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (!json.residents || !Array.isArray(json.residents)) {
          toast.error("Format file tidak valid (tidak ada field 'residents')");
          return;
        }

        // Optional: Bersihkan database dulu
        await db.residents.clear();

        // Normalisasi nilai agar kompatibel dengan perhitungan monografi
        const today = new Date();
        const parsedResidents = json.residents.map((resident: any) => {
          const { id, ...residentWithoutId } = resident;
          const birthDate = normalizeText(resident.birthDate);
          const createdAt = toDate(resident.createdAt, today);
          const updatedAt = toDate(resident.updatedAt, createdAt);

          return {
            ...residentWithoutId,
            kk: normalizeText(resident.kk),
            nik: normalizeText(resident.nik),
            name: normalizeText(resident.name),
            birthPlace: normalizeText(resident.birthPlace),
            birthDate,
            age: calculateAge(birthDate, today),
            gender: normalizeGender(resident.gender),
            address: normalizeText(resident.address),
            rt: normalizeRtRw(resident.rt),
            rw: normalizeRtRw(resident.rw),
            shdk: normalizeShdk(resident.shdk),
            maritalStatus: normalizeMaritalStatus(resident.maritalStatus),
            education: normalizeEducation(resident.education),
            religion: normalizeReligion(resident.religion),
            bloodType: normalizeBloodType(resident.bloodType),
            occupation: normalizeText(resident.occupation),
            fatherName: normalizeText(resident.fatherName),
            motherName: normalizeText(resident.motherName),
            ktpEl: toBoolean(resident.ktpEl),
            marriageCertificate: toBoolean(resident.marriageCertificate),
            divorceCertificate: toBoolean(resident.divorceCertificate),
            birthCertificate: toBoolean(resident.birthCertificate),
            createdAt,
            updatedAt,
          };
        });

        await db.residents.bulkAdd(parsedResidents);
        await onResidentsImported?.();

        toast.success("Impor data berhasil");
        setIsImportModalOpen(false);
        setImportedFile(null);
        if (importInputRef.current) {
          importInputRef.current.value = "";
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengimpor file JSON");
      } finally {
        setIsImporting(false);
      }
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan</h2>

        <div className="animate-pulse space-y-6">
          <Card>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Pengaturan</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card title="Informasi Kelurahan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Kelurahan"
              {...register("name", { required: "Nama kelurahan wajib diisi" })}
              error={errors.name?.message}
              fullWidth
            />

            <Input
              label="Alamat"
              {...register("address", {
                required: "Alamat kelurahan wajib diisi",
              })}
              error={errors.address?.message}
              fullWidth
            />

            <Input
              label="Kecamatan"
              {...register("districtName", {
                required: "Nama kecamatan wajib diisi",
              })}
              error={errors.districtName?.message}
              fullWidth
            />

            <Input
              label="Kabupaten/Kota"
              {...register("regencyName", {
                required: "Nama kabupaten wajib diisi",
              })}
              error={errors.regencyName?.message}
              fullWidth
            />

            <Input
              label="Provinsi"
              {...register("provinceName", {
                required: "Nama provinsi wajib diisi",
              })}
              error={errors.provinceName?.message}
              fullWidth
            />

            <Input
              label="Kode Kemendagri"
              {...register("VillageCode", {
                required: "Kode Kemendagri wajib diisi",
              })}
              error={errors.VillageCode?.message}
              fullWidth
            />

            <Input
              label="Kode BPS"
              {...register("bpsCode")}
              error={errors.bpsCode?.message}
              fullWidth
            />

            <Input
              label="Nomor Telepon"
              {...register("phoneNumber", {
                required: "Nomor telepon wajib diisi",
              })}
              error={errors.phoneNumber?.message}
              fullWidth
            />
          </div>
        </Card>

        <Card title="Informasi Pemerintah Kelurahan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Lurah"
              {...register("leaderName", {
                required: "Nama lurah wajib diisi",
              })}
              error={errors.leaderName?.message}
              fullWidth
            />

            <Input
              label="Nama Sekretaris Kelurahan (Seklur)"
              {...register("sekretaris", {
                required: "Nama Sekretaris Kelurahan (Seklur) wajib diisi",
              })}
              error={errors.sekretaris?.message}
              fullWidth
            />

            <Input
              label="Nama Kasi Pemerintahan dan Pembangunan"
              {...register("kasipemerintah", {
                required: "Nama Kasi Pemerintahan dan Pembangunan wajib diisi",
              })}
              error={errors.kasipemerintah?.message}
              fullWidth
            />

            <Input
              label="Nama Kasi Kesejahteraan Sosial (Kesos)"
              {...register("kasiKesejahteraan", {
                required: "Nama Kasi Kesejahteraan Sosial (Kesos) wajib diisi",
              })}
              error={errors.kasiKesejahteraan?.message}
              fullWidth
            />

            <Input
              label="Nama Kasi Ketentraman dan Ketertiban Umum (Trantib)"
              {...register("kasiPelayanan", {
                required:
                  "Nama Kasi Ketentraman dan Ketertiban Umum (Trantib) wajib diisi",
              })}
              error={errors.kasiPelayanan?.message}
              fullWidth
            />

            <Input
              label="Nama Staf Administrasi/Tenaga IT"
              {...register("kaurUmumNTataUsaha", {
                required: "Nama Staf Administrasi/Tenaga IT wajib diisi",
              })}
              error={errors.kaurUmumNTataUsaha?.message}
              fullWidth
            />

            <Input
              label="Nama Tenaga Kebersihan/Umum"
              {...register("kaurKeuangan", {
                required: "Nama Tenaga Kebersihan/Umum wajib diisi",
              })}
              error={errors.kaurKeuangan?.message}
              fullWidth
            />

            <Input
              label="Nama Staf Pendukung Kelurahan"
              {...register("kaurPerencanaan", {
                required: "Nama Staf Pendukung Kelurahan wajib diisi",
              })}
              error={errors.kaurPerencanaan?.message}
              fullWidth
            />

            <Input
              label="Nama Staf Pendukung Kelurahan 1"
              {...register("kadus1", {
                required: "Nama Staf Pendukung Kelurahan 1 wajib diisi",
              })}
              error={errors.kadus1?.message}
              fullWidth
            />

            <Input
              label="Nama Staf Pendukung Kelurahan 2"
              {...register("kadus2", {
                required: "Nama Staf Pendukung Kelurahan 2 wajib diisi",
              })}
              error={errors.kadus2?.message}
              fullWidth
            />

            <Input
              label="Nama Staf Pendukung Kelurahan 3"
              {...register("kadus3", {
                required: "Nama Staf Pendukung Kelurahan 3 wajib diisi",
              })}
              error={errors.kadus3?.message}
              fullWidth
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            icon={<Save size={18} />}
            isLoading={isSubmitting}
          >
            Simpan Pengaturan
          </Button>
        </div>
      </form>

      {/* Data Backup */}
      <Card title="Backup & Restore Data">
        <p className="text-sm text-gray-700 mb-6">
          Backup data kelurahan secara berkala untuk menghindari kehilangan data.
          Data yang dibackup mencakup semua informasi warga, surat, dan
          pengaturan kelurahan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-md p-6 flex flex-col items-center text-center">
            <div className="bg-teal-100 p-3 rounded-full mb-4">
              <FileDown size={24} className="text-teal-700" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ekspor Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ekspor seluruh data ke file JSON untuk disimpan sebagai backup
            </p>
            <Button
              type="button"
              variant="primary"
              icon={<Download size={18} />}
              onClick={handleExportData}
              isLoading={isExporting}
            >
              Ekspor Data
            </Button>
          </div>

          <div className="border rounded-md p-6 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <FileUp size={24} className="text-blue-700" />
            </div>
            <h3 className="text-lg font-medium mb-2">Impor Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pulihkan data dari file backup JSON yang telah dibuat sebelumnya
            </p>
            <Button
              type="button"
              variant="primary"
              icon={<Upload size={18} />}
              onClick={() => setIsImportModalOpen(true)}
              isLoading={isImporting}
            >
              Impor Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Impor Data"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <p className="text-amber-700 text-sm font-medium">Perhatian!</p>
            <p className="text-amber-600 text-sm mt-1">
              Mengimpor data akan <strong>menimpa semua data yang ada</strong>.
              Pastikan Anda telah membuat backup sebelum melakukan impor.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <HardDrive size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">
              Pilih file backup JSON untuk diimpor
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => importInputRef.current?.click()}
            >
              Pilih File Backup
            </Button>

            <input
              type="file"
              ref={importInputRef}
              onChange={handleImportFile}
              accept=".json,application/json"
              className="hidden"
            />

            {importedFile && (
              <p className="mt-4 text-sm text-gray-700">
                File terpilih: {importedFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmImport}
              isLoading={isImporting}
              disabled={!importedFile}
            >
              Konfirmasi Impor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
