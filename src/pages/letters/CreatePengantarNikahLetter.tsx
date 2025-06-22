import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";
import { residentService } from "../../services/residentService";
import { villageService } from "../../database/villageService";
import { toast } from "react-toastify";
import { Resident, VillageInfo } from "../../types";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";

const initialPerson = {
  nik: "",
  name: "",
  gender: "",
  birthPlace: "",
  birthDate: "",
  religion: "",
  occupation: "",
  address: "",
  maritalStatus: "",
  nationality: "Indonesia",
};

const initialForm = {
  letterNumber: "",
  issuedDate: new Date().toISOString().slice(0, 10),
  resident: { ...initialPerson },
  ayah: { ...initialPerson },
  ibu: { ...initialPerson },
};

function generateFormulirPengantarNikahN1(
  form: any,
  village: VillageInfo
) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("FORMULIR PENGANTAR NIKAH", 65, 12);
  doc.setFontSize(9);
  doc.text(`KANTOR DESA/KEL    : ${village.name}`, 10, 20);
  doc.text(
    `KECAMATAN          : ${village.districtName || "Patikraja"}`,
    10,
    26
  );
  doc.text(`KABUPATEN          : ${village.regencyName || "Banyumas"}`, 10, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Model N 1", 170, 16);
  doc.setFont("helvetica", "bold");
  doc.text("PENGANTAR NIKAH", 80, 43);
  doc.setFont("helvetica", "normal");
  doc.text(`Nomor : ${form.letterNumber || "............"}`, 80, 49);
  doc.setFontSize(10);
  doc.text(
    "Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya bahwa :",
    10,
    58
  );
  let y = 66;
  const r = form.resident;
  doc.text("1. Nama", 14, y);
  doc.text(`: ${r.name}`, 90, y);
  doc.text("2. Nomor Induk Kependudukan (NIK)", 14, y + 6);
  doc.text(`: ${r.nik}`, 90, y + 6);
  doc.text("3. Jenis Kelamin", 14, y + 12);
  doc.text(`: ${r.gender}`, 90, y + 12);
  doc.text("4. Tempat dan tanggal lahir", 14, y + 18);
  doc.text(`: ${r.birthPlace}, ${r.birthDate}`, 90, y + 18);
  doc.text("5. Kewarganegaraan", 14, y + 24);
  doc.text(`: ${r.nationality || "Indonesia"}`, 90, y + 24);
  doc.text("6. Agama", 14, y + 30);
  doc.text(`: ${r.religion}`, 90, y + 30);
  doc.text("7. Pekerjaan", 14, y + 36);
  doc.text(`: ${r.occupation}`, 90, y + 36);
  doc.text("8. Alamat", 14, y + 42);
  doc.text(`: ${r.address}`, 90, y + 42);
  doc.text("9. Status Perkawinan", 14, y + 50);
  doc.text(
    `   a. Laki-laki : Jejaka / Duda / beristri ke     : ${
      r.gender === "Laki-laki"
        ? r.maritalStatus === "Belum Kawin"
          ? "Jejaka"
          : "Duda"
        : "-"
    }`,
    16,
    y + 56
  );
  doc.text(
    `   b. Perempuan : Perawan / Janda                : ${
      r.gender === "Perempuan"
        ? r.maritalStatus === "Belum Kawin"
          ? "Perawan"
          : "Janda"
        : "-"
    }`,
    16,
    y + 62
  );
  doc.text("   Adalah benar anak dari pernikahan seorang pria", 16, y + 68);
  // Data ayah
  const ayah = form.ayah;
  doc.text("   Nama lengkap dan alias", 18, y + 74);
  doc.text(`: ${ayah.name || "-"}`, 90, y + 74);
  doc.text("   Nomor Induk Kependudukan (NIK)", 18, y + 80);
  doc.text(`: ${ayah.nik || "-"}`, 90, y + 80);
  doc.text("   Tempat dan tanggal lahir", 18, y + 86);
  doc.text(
    `: ${ayah.birthPlace || "-"}, ${ayah.birthDate || "-"}`,
    90,
    y + 86
  );
  doc.text("   Kewarganegaraan", 18, y + 92);
  doc.text(`: ${ayah.nationality || "Indonesia"}`, 90, y + 92);
  doc.text("   Agama", 18, y + 98);
  doc.text(`: ${ayah.religion || "-"}`, 90, y + 98);
  doc.text("   Pekerjaan", 18, y + 104);
  doc.text(`: ${ayah.occupation || "-"}`, 90, y + 104);
  doc.text("   Alamat", 18, y + 110);
  doc.text(`: ${ayah.address || "-"}`, 90, y + 110);
  // Data ibu
  const ibu = form.ibu;
  doc.setFont("helvetica", "bold");
  doc.text("   Dengan seorang wanita", 16, y + 120);
  doc.setFont("helvetica", "normal");
  doc.text("   Nama lengkap dan alias", 18, y + 126);
  doc.text(`: ${ibu.name || "-"}`, 90, y + 126);
  doc.text("   Nomor Induk Kependudukan (NIK)", 18, y + 132);
  doc.text(`: ${ibu.nik || "-"}`, 90, y + 132);
  doc.text("   Tempat dan tanggal lahir", 18, y + 138);
  doc.text(
    `: ${ibu.birthPlace || "-"}, ${ibu.birthDate || "-"}`,
    90,
    y + 138
  );
  doc.text("   Kewarganegaraan", 18, y + 144);
  doc.text(`: ${ibu.nationality || "Indonesia"}`, 90, y + 144);
  doc.text("   Agama", 18, y + 150);
  doc.text(`: ${ibu.religion || "-"}`, 90, y + 150);
  doc.text("   Pekerjaan", 18, y + 156);
  doc.text(`: ${ibu.occupation || "-"}`, 90, y + 156);
  doc.text("   Alamat", 18, y + 162);
  doc.text(`: ${ibu.address || "-"}`, 90, y + 162);
  // Penutup
  doc.text(
    "Demikianlah, surat pengantar ini dibuat dengan mengingat sumpah Jabatan dan untuk dipergunakan sebagaimana mestinya",
    10,
    y + 175
  );
  doc.text(
    `Kedungwiringin, ${
      form.issuedDate && new Date(form.issuedDate).toLocaleDateString("id-ID")
    }`,
    130,
    y + 185
  );
  doc.text("Kepala Desa Kedungwiringin", 130, y + 190);
  doc.text(village.leaderName || "", 140, y + 210);
  return doc;
}

const CreatePengantarNikahLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [search, setSearch] = useState({ resident: "", ayah: "", ibu: "" });
  const [results, setResults] = useState({ resident: [], ayah: [], ibu: [] });
  const [village, setVillage] = useState<VillageInfo | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    villageService.getVillageInfo().then(setVillage);
  }, []);

  // Search handlers
  const handleSearch = async (role: "resident" | "ayah" | "ibu") => {
    const value = search[role];
    if (value.length < 3) {
      setResults((r) => ({ ...r, [role]: [] }));
      return;
    }
    const found = await residentService.searchByNikOrName(value);
    setResults((r) => ({ ...r, [role]: found }));
  };

  // Select resident/ayah/ibu and make editable
  const handleSelectPerson = (role: "resident" | "ayah" | "ibu", person: Resident) => {
    setForm((f: any) => ({ ...f, [role]: { ...person } }));
    setResults((r) => ({ ...r, [role]: [] }));
    setSearch((s) => ({ ...s, [role]: "" }));
  };

  // Handle field change for resident/ayah/ibu
  const handlePersonFieldChange = (
    role: "resident" | "ayah" | "ibu",
    field: string,
    value: string
  ) => {
    setForm((f: any) => ({
      ...f,
      [role]: { ...f[role], [field]: value },
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExportPdf = async () => {
    if (!form.resident.nik || !form.ayah.nik || !form.ibu.nik)
      return toast.error("Lengkapi data yang menikah, ayah, dan ibu!");
    if (!village) return toast.error("Data desa belum lengkap");
    const doc = generateFormulirPengantarNikahN1(form, village);
    doc.save("surat-pengantar-nikah");
    const historyEntry: LetterHistory = {
      name: form.resident.name,
      letter: "pengantar-nikah",
      date: new Date().toISOString(),
    };
    saveLetterHistory(historyEntry).catch(() => {});
  };

  const handlePrintPdf = async () => {
    if (!form.resident.nik || !form.ayah.nik || !form.ibu.nik)
      return toast.error("Lengkapi data yang menikah, ayah, dan ibu!");
    if (!village) return toast.error("Data desa belum lengkap");
    const doc = generateFormulirPengantarNikahN1(form, village);
    window.open(doc.output("bloburl"), "_blank");
    const historyEntry: LetterHistory = {
      name: form.resident.name,
      letter: "pengantar-nikah",
      date: new Date().toISOString(),
    };
    saveLetterHistory(historyEntry).catch(() => {});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <h2 className="text-2xl font-bold">Formulir Pengantar Nikah (N1)</h2>
      <div className="mb-4">
        <Input
          label="Nomor Surat"
          name="letterNumber"
          value={form.letterNumber}
          onChange={handleChange}
          placeholder="Nomor surat..."
        />
      </div>
      {/* Yang menikah */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Cari NIK/Nama yang mau nikah</label>
        <div className="flex gap-2">
          <Input
            value={search.resident}
            onChange={(e) => setSearch((s) => ({ ...s, resident: e.target.value }))}
            placeholder="Ketik NIK atau nama..."
          />
          <Button type="button" variant="secondary" onClick={() => handleSearch("resident")}>Cari</Button>
        </div>
        {results.resident.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {results.resident.map((r: Resident) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectPerson("resident", r)}
              >
                {r.nik} - {r.name}
              </div>
            ))}
          </div>
        )}
        {/* Editable fields for yang menikah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <Input label="NIK" value={form.resident.nik} onChange={e => handlePersonFieldChange("resident", "nik", e.target.value)} />
          <Input label="Nama" value={form.resident.name} onChange={e => handlePersonFieldChange("resident", "name", e.target.value)} />
          <Input label="Jenis Kelamin" value={form.resident.gender} onChange={e => handlePersonFieldChange("resident", "gender", e.target.value)} />
          <Input label="Tempat Lahir" value={form.resident.birthPlace} onChange={e => handlePersonFieldChange("resident", "birthPlace", e.target.value)} />
          <Input label="Tanggal Lahir" value={form.resident.birthDate} onChange={e => handlePersonFieldChange("resident", "birthDate", e.target.value)} type="date" />
          <Input label="Agama" value={form.resident.religion} onChange={e => handlePersonFieldChange("resident", "religion", e.target.value)} />
          <Input label="Pekerjaan" value={form.resident.occupation} onChange={e => handlePersonFieldChange("resident", "occupation", e.target.value)} />
          <Input label="Alamat" value={form.resident.address} onChange={e => handlePersonFieldChange("resident", "address", e.target.value)} />
          <Input label="Status Perkawinan" value={form.resident.maritalStatus} onChange={e => handlePersonFieldChange("resident", "maritalStatus", e.target.value)} />
        </div>
      </div>
      {/* Ayah */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Cari NIK/Nama Ayah</label>
        <div className="flex gap-2">
          <Input
            value={search.ayah}
            onChange={(e) => setSearch((s) => ({ ...s, ayah: e.target.value }))}
            placeholder="Ketik NIK atau nama ayah..."
          />
          <Button type="button" variant="secondary" onClick={() => handleSearch("ayah")}>Cari</Button>
        </div>
        {results.ayah.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {results.ayah.map((r: Resident) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectPerson("ayah", r)}
              >
                {r.nik} - {r.name}
              </div>
            ))}
          </div>
        )}
        {/* Editable fields for ayah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <Input label="NIK" value={form.ayah.nik} onChange={e => handlePersonFieldChange("ayah", "nik", e.target.value)} />
          <Input label="Nama" value={form.ayah.name} onChange={e => handlePersonFieldChange("ayah", "name", e.target.value)} />
          <Input label="Jenis Kelamin" value={form.ayah.gender} onChange={e => handlePersonFieldChange("ayah", "gender", e.target.value)} />
          <Input label="Tempat Lahir" value={form.ayah.birthPlace} onChange={e => handlePersonFieldChange("ayah", "birthPlace", e.target.value)} />
          <Input label="Tanggal Lahir" value={form.ayah.birthDate} onChange={e => handlePersonFieldChange("ayah", "birthDate", e.target.value)} type="date" />
          <Input label="Agama" value={form.ayah.religion} onChange={e => handlePersonFieldChange("ayah", "religion", e.target.value)} />
          <Input label="Pekerjaan" value={form.ayah.occupation} onChange={e => handlePersonFieldChange("ayah", "occupation", e.target.value)} />
          <Input label="Alamat" value={form.ayah.address} onChange={e => handlePersonFieldChange("ayah", "address", e.target.value)} />
        </div>
      </div>
      {/* Ibu */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Cari NIK/Nama Ibu</label>
        <div className="flex gap-2">
          <Input
            value={search.ibu}
            onChange={(e) => setSearch((s) => ({ ...s, ibu: e.target.value }))}
            placeholder="Ketik NIK atau nama ibu..."
          />
          <Button type="button" variant="secondary" onClick={() => handleSearch("ibu")}>Cari</Button>
        </div>
        {results.ibu.length > 0 && (
          <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
            {results.ibu.map((r: Resident) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectPerson("ibu", r)}
              >
                {r.nik} - {r.name}
              </div>
            ))}
          </div>
        )}
        {/* Editable fields for ibu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <Input label="NIK" value={form.ibu.nik} onChange={e => handlePersonFieldChange("ibu", "nik", e.target.value)} />
          <Input label="Nama" value={form.ibu.name} onChange={e => handlePersonFieldChange("ibu", "name", e.target.value)} />
          <Input label="Jenis Kelamin" value={form.ibu.gender} onChange={e => handlePersonFieldChange("ibu", "gender", e.target.value)} />
          <Input label="Tempat Lahir" value={form.ibu.birthPlace} onChange={e => handlePersonFieldChange("ibu", "birthPlace", e.target.value)} />
          <Input label="Tanggal Lahir" value={form.ibu.birthDate} onChange={e => handlePersonFieldChange("ibu", "birthDate", e.target.value)} type="date" />
          <Input label="Agama" value={form.ibu.religion} onChange={e => handlePersonFieldChange("ibu", "religion", e.target.value)} />
          <Input label="Pekerjaan" value={form.ibu.occupation} onChange={e => handlePersonFieldChange("ibu", "occupation", e.target.value)} />
          <Input label="Alamat" value={form.ibu.address} onChange={e => handlePersonFieldChange("ibu", "address", e.target.value)} />
        </div>
      </div>
      <div className="flex space-x-2 mt-2">
        <Button type="button" variant="secondary" onClick={handleExportPdf}>
          Export PDF
        </Button>
        <Button type="button" variant="secondary" onClick={handlePrintPdf}>
          Print PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPreviewOpen(true)}
        >
          Preview
        </Button>
      </div>
      {/* Preview Surat Pengantar Nikah (N1) */}
      {village && (
        <div className="bg-white p-6 border shadow max-w-[900px] mx-auto mb-8 mt-6 text-left">
          <div className="text-center font-bold text-lg mb-2">
            FORMULIR PENGANTAR NIKAH
          </div>
          <div className="text-center text-sm mb-2">Model N1</div>
          <div className="mb-2">KANTOR DESA/KEL: {village.name}</div>
          <div className="mb-2">KECAMATAN: {village.districtName}</div>
          <div className="mb-2">KABUPATEN: {village.regencyName}</div>
          <div className="mb-2">Nomor Surat: {form.letterNumber}</div>
          <div className="mb-4">
            Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya bahwa:
          </div>
          <table className="mb-2">
            <tbody>
              <tr><td>1. Nama</td><td>:</td><td>{form.resident.name}</td></tr>
              <tr><td>2. NIK</td><td>:</td><td>{form.resident.nik}</td></tr>
              <tr><td>3. Jenis Kelamin</td><td>:</td><td>{form.resident.gender}</td></tr>
              <tr><td>4. Tempat & Tanggal Lahir</td><td>:</td><td>{form.resident.birthPlace}, {form.resident.birthDate}</td></tr>
              <tr><td>5. Kewarganegaraan</td><td>:</td><td>{form.resident.nationality}</td></tr>
              <tr><td>6. Agama</td><td>:</td><td>{form.resident.religion}</td></tr>
              <tr><td>7. Pekerjaan</td><td>:</td><td>{form.resident.occupation}</td></tr>
              <tr><td>8. Alamat</td><td>:</td><td>{form.resident.address}</td></tr>
              <tr><td>9. Status Perkawinan</td><td>:</td><td>{form.resident.maritalStatus}</td></tr>
            </tbody>
          </table>
          <div className="mb-2">
            a. Laki-laki: Jejaka / Duda / beristri ke: {form.resident.gender === "Laki-laki" ? (form.resident.maritalStatus === "Belum Kawin" ? "Jejaka" : "Duda") : "-"}
          </div>
          <div className="mb-2">
            b. Perempuan: Perawan / Janda: {form.resident.gender === "Perempuan" ? (form.resident.maritalStatus === "Belum Kawin" ? "Perawan" : "Janda") : "-"}
          </div>
          <div className="mb-2">Adalah benar anak dari pernikahan seorang pria:</div>
          <table className="mb-2">
            <tbody>
              <tr><td>Nama lengkap dan alias</td><td>:</td><td>{form.ayah.name}</td></tr>
              <tr><td>NIK</td><td>:</td><td>{form.ayah.nik}</td></tr>
              <tr><td>Tempat & Tanggal Lahir</td><td>:</td><td>{form.ayah.birthPlace}, {form.ayah.birthDate}</td></tr>
              <tr><td>Kewarganegaraan</td><td>:</td><td>{form.ayah.nationality}</td></tr>
              <tr><td>Agama</td><td>:</td><td>{form.ayah.religion}</td></tr>
              <tr><td>Pekerjaan</td><td>:</td><td>{form.ayah.occupation}</td></tr>
              <tr><td>Alamat</td><td>:</td><td>{form.ayah.address}</td></tr>
            </tbody>
          </table>
          <div className="mb-2">Dengan seorang wanita:</div>
          <table className="mb-2">
            <tbody>
              <tr><td>Nama lengkap dan alias</td><td>:</td><td>{form.ibu.name}</td></tr>
              <tr><td>NIK</td><td>:</td><td>{form.ibu.nik}</td></tr>
              <tr><td>Tempat & Tanggal Lahir</td><td>:</td><td>{form.ibu.birthPlace}, {form.ibu.birthDate}</td></tr>
              <tr><td>Kewarganegaraan</td><td>:</td><td>{form.ibu.nationality}</td></tr>
              <tr><td>Agama</td><td>:</td><td>{form.ibu.religion}</td></tr>
              <tr><td>Pekerjaan</td><td>:</td><td>{form.ibu.occupation}</td></tr>
              <tr><td>Alamat</td><td>:</td><td>{form.ibu.address}</td></tr>
            </tbody>
          </table>
          <div className="mb-4">
            Demikianlah, surat pengantar ini dibuat dengan mengingat sumpah jabatan dan untuk dipergunakan sebagaimana mestinya.
          </div>
          <div className="flex justify-end mt-8">
            <div className="text-center">
              <div>
                Kedungwiringin, {form.issuedDate && new Date(form.issuedDate).toLocaleDateString("id-ID")}
              </div>
              <div className="font-bold">Kepala Desa {village.name}</div>
              <div style={{ height: "60px" }}></div>
              <div className="font-bold underline">
                {village.leaderName || "(................................)"}
              </div>
            </div>
          </div>
          <div className="text-xs mt-8">
            Lampiran X Keputusan Direktur Jendral Bimbingan Masyarakat Islam Nomor 473 Tahun 2020
          </div>
        </div>
      )}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Surat"
      >
        <div className="p-4 bg-white">
          {village ? (
            <pre className="whitespace-pre-wrap font-sans text-base">
              {JSON.stringify(
                {
                  ...form,
                  desa: village,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p>Lengkapi data untuk preview.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreatePengantarNikahLetter;
