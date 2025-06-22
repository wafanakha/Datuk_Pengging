import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import jsPDF from "jspdf";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
import { residentService } from "../../services/residentService";

const initialPerson = {
  name: "",
  nik: "",
  birthPlace: "",
  birthDate: "",
  kewarganegaraan: "Indonesia",
  agama: "",
  pekerjaan: "",
  alamat: "",
  binOrBinti: "",
};

const initialForm = {
  suami: { ...initialPerson },
  istri: { ...initialPerson },
  tanggalSurat: new Date().toISOString().slice(0, 10),
};

function generatePersetujuanCalonPengantinN4(form: any) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Model N 4", 170, 15);
  doc.setFontSize(14);
  doc.text("PERSETUJUAN CALON PENGANTIN", 60, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Yang bertanda tangan di bawah ini", 10, 35);
  // Calon Suami
  doc.setFont("helvetica", "bold");
  doc.text("A. Calon Suami", 10, 43);
  doc.setFont("helvetica", "normal");
  let y = 49;
  doc.text("1. Nama", 14, y);
  doc.text(`: ${form.suami.name}`, 80, y);
  doc.text("2. Bin", 14, y + 6);
  doc.text(`: ${form.suami.binOrBinti}`, 80, y + 6);
  doc.text("3. Nomor Induk Kependudukan", 14, y + 12);
  doc.text(`: ${form.suami.nik}`, 80, y + 12);
  doc.text("4. Tempat dan tanggal lahir", 14, y + 18);
  doc.text(`: ${form.suami.birthPlace}, ${form.suami.birthDate}`, 80, y + 18);
  doc.text("5. Kewarganegaraan", 14, y + 24);
  doc.text(`: ${form.suami.kewarganegaraan}`, 80, y + 24);
  doc.text("6. Agama", 14, y + 30);
  doc.text(`: ${form.suami.agama}`, 80, y + 30);
  doc.text("7. Pekerjaan", 14, y + 36);
  doc.text(`: ${form.suami.pekerjaan}`, 80, y + 36);
  doc.text("8. Alamat", 14, y + 42);
  doc.text(`: ${form.suami.alamat}`, 80, y + 42);
  // Calon Istri
  doc.setFont("helvetica", "bold");
  doc.text("B. Calon Istri", 10, y + 50);
  doc.setFont("helvetica", "normal");
  doc.text("Alamat", 15, y + 56);
  doc.text(`: ${form.istri.alamat}`, 80, y + 56);
  let yI = y + 62;
  doc.text("1. Nama", 14, yI);
  doc.text(`: ${form.istri.name}`, 80, yI);
  doc.text("2. Binti", 14, yI + 6);
  doc.text(`: ${form.istri.binOrBinti}`, 80, yI + 6);
  doc.text("3. Nomor Induk Kependudukan", 14, yI + 12);
  doc.text(`: ${form.istri.nik}`, 80, yI + 12);
  doc.text("4. Tempat dan tanggal lahir", 14, yI + 18);
  doc.text(`: ${form.istri.birthPlace}, ${form.istri.birthDate}`, 80, yI + 18);
  doc.text("5. Kewarganegaraan", 14, yI + 24);
  doc.text(`: ${form.istri.kewarganegaraan}`, 80, yI + 24);
  doc.text("6. Agama", 14, yI + 30);
  doc.text(`: ${form.istri.agama}`, 80, yI + 30);
  doc.text("7. Pekerjaan", 14, yI + 36);
  doc.text(`: ${form.istri.pekerjaan}`, 80, yI + 36);
  doc.text("8. Alamat", 14, yI + 42);
  doc.text(`: ${form.istri.alamat}`, 80, yI + 42);
  // Baris tambahan alamat jika perlu
  // Pernyataan
  let yStatement = yI + 58;
  let yStatement2 = yI + 63;
  doc.setFontSize(12);
  let statement1 =
    "Menyatakan dengan sesungguhnya bahwa atas dasar suka rela , dengan kesadaran sendiri,";
  let statement2 =
    "tanpa ada paksaan siapapun juga, setuju untuk melangsungkan pernikahan.";

  doc.text(statement1, 10, yStatement);
  doc.text(statement2, 10, yStatement2);
  // Penutup
  doc.text(
    "Demikian surat persetujuan ini di buat untuk digunakan seperlunya.",
    10,
    yStatement2 + 10
  );
  doc.text(
    `Kedungwiringin, ${
      form.tanggalSurat &&
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    }`,
    120,
    yStatement2 + 20
  );
  doc.setFont("helvetica", "bold");
  doc.text("Calon Suami", 30, yStatement2 + 30);
  doc.text("Calon Isteri", 135, yStatement2 + 30);
  doc.setFont("helvetica", "normal");
  doc.text(form.suami.name || "", 32, yStatement2 + 60);
  doc.text(form.istri.name || "", 143, yStatement2 + 60);
  return doc;
}

const CreatePersetujuanCalonPengantinLetter: React.FC = () => {
  const [form, setForm] = useState<any>(initialForm);
  const [search, setSearch] = useState({ suami: "", istri: "" });
  const [results, setResults] = useState({ suami: [], istri: [] });
  const [previewOpen, setPreviewOpen] = useState(false);

  // Search handlers
  const handleSearch = async (role: "suami" | "istri") => {
    const value = search[role];
    if (value.length < 3) {
      setResults((r) => ({ ...r, [role]: [] }));
      return;
    }
    const found = await residentService.searchByNikOrName(value);
    setResults((r) => ({ ...r, [role]: found }));
  };

  // Select suami/istri and make editable
  const handleSelectPerson = (role: "suami" | "istri", person: any) => {
    setForm((f: any) => ({
      ...f,
      [role]: {
        name: person.name,
        nik: person.nik,
        birthPlace: person.birthPlace,
        birthDate: person.birthDate,
        kewarganegaraan: "Indonesia",
        agama: person.religion,
        pekerjaan: person.occupation,
        alamat: person.address,
        binOrBinti: role === "suami" ? person.fatherName : person.motherName,
      },
    }));
    setResults((r) => ({ ...r, [role]: [] }));
    setSearch((s) => ({ ...s, [role]: "" }));
  };

  // Handle field change for suami/istri
  const handlePersonFieldChange = (
    role: "suami" | "istri",
    field: string,
    value: string
  ) => {
    setForm((f: any) => ({
      ...f,
      [role]: { ...f[role], [field]: value },
    }));
  };

  const handleExportPdf = () => {
    const doc = generatePersetujuanCalonPengantinN4(form);
    doc.save("persetujuan_calon_pengantin_n4.pdf");

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "persetujuan-calon-pengantin", // Since this is the usaha letter component
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => {
        console.log("Letter history saved");
      })
      .catch((error) => {
        console.error("Failed to save letter history:", error);
      });
  };

  const handlePrintPdf = () => {
    const doc = generatePersetujuanCalonPengantinN4(form);
    window.open(doc.output("bloburl"), "_blank");

    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "persetujuan-calon-pengantin", // Since this is the usaha letter component
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => {
        console.log("Letter history saved");
      })
      .catch((error) => {
        console.error("Failed to save letter history:", error);
      });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Persetujuan Calon Pengantin (N4)</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow mb-4">
        {/* Cari & edit suami */}
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Cari NIK/Nama Calon Suami</label>
          <div className="flex gap-2">
            <Input
              value={search.suami}
              onChange={(e) => setSearch((s) => ({ ...s, suami: e.target.value }))}
              placeholder="Ketik NIK atau nama..."
            />
            <Button type="button" variant="secondary" onClick={() => handleSearch("suami")}>Cari</Button>
          </div>
          {results.suami.length > 0 && (
            <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
              {results.suami.map((r: any) => (
                <div
                  key={r.id}
                  className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                  onClick={() => handleSelectPerson("suami", r)}
                >
                  {r.nik} - {r.name}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <Input label="Nama Calon Suami" value={form.suami.name} onChange={e => handlePersonFieldChange("suami", "name", e.target.value)} required />
            <Input label="Bin Calon Suami" value={form.suami.binOrBinti} onChange={e => handlePersonFieldChange("suami", "binOrBinti", e.target.value)} required />
            <Input label="NIK Calon Suami" value={form.suami.nik} onChange={e => handlePersonFieldChange("suami", "nik", e.target.value)} required />
            <Input label="Tempat Lahir Suami" value={form.suami.birthPlace} onChange={e => handlePersonFieldChange("suami", "birthPlace", e.target.value)} required />
            <Input label="Tanggal Lahir Suami" type="date" value={form.suami.birthDate} onChange={e => handlePersonFieldChange("suami", "birthDate", e.target.value)} required />
            <Input label="Kewarganegaraan Suami" value={form.suami.kewarganegaraan} onChange={e => handlePersonFieldChange("suami", "kewarganegaraan", e.target.value)} required />
            <Input label="Agama Suami" value={form.suami.agama} onChange={e => handlePersonFieldChange("suami", "agama", e.target.value)} required />
            <Input label="Pekerjaan Suami" value={form.suami.pekerjaan} onChange={e => handlePersonFieldChange("suami", "pekerjaan", e.target.value)} required />
            <Input label="Alamat Suami" value={form.suami.alamat} onChange={e => handlePersonFieldChange("suami", "alamat", e.target.value)} required />
          </div>
        </div>
        {/* Cari & edit istri */}
        <div className="md:col-span-2 mt-4">
          <label className="block font-semibold mb-1">Cari NIK/Nama Calon Istri</label>
          <div className="flex gap-2">
            <Input
              value={search.istri}
              onChange={(e) => setSearch((s) => ({ ...s, istri: e.target.value }))}
              placeholder="Ketik NIK atau nama..."
            />
            <Button type="button" variant="secondary" onClick={() => handleSearch("istri")}>Cari</Button>
          </div>
          {results.istri.length > 0 && (
            <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
              {results.istri.map((r: any) => (
                <div
                  key={r.id}
                  className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                  onClick={() => handleSelectPerson("istri", r)}
                >
                  {r.nik} - {r.name}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <Input label="Nama Calon Istri" value={form.istri.name} onChange={e => handlePersonFieldChange("istri", "name", e.target.value)} required />
            <Input label="Binti Calon Istri" value={form.istri.binOrBinti} onChange={e => handlePersonFieldChange("istri", "binOrBinti", e.target.value)} required />
            <Input label="NIK Calon Istri" value={form.istri.nik} onChange={e => handlePersonFieldChange("istri", "nik", e.target.value)} required />
            <Input label="Tempat Lahir Istri" value={form.istri.birthPlace} onChange={e => handlePersonFieldChange("istri", "birthPlace", e.target.value)} required />
            <Input label="Tanggal Lahir Istri" type="date" value={form.istri.birthDate} onChange={e => handlePersonFieldChange("istri", "birthDate", e.target.value)} required />
            <Input label="Kewarganegaraan Istri" value={form.istri.kewarganegaraan} onChange={e => handlePersonFieldChange("istri", "kewarganegaraan", e.target.value)} required />
            <Input label="Agama Istri" value={form.istri.agama} onChange={e => handlePersonFieldChange("istri", "agama", e.target.value)} required />
            <Input label="Pekerjaan Istri" value={form.istri.pekerjaan} onChange={e => handlePersonFieldChange("istri", "pekerjaan", e.target.value)} required />
            <Input label="Alamat Istri" value={form.istri.alamat} onChange={e => handlePersonFieldChange("istri", "alamat", e.target.value)} required />
          </div>
        </div>
        <Input
          label="Tanggal Surat"
          name="tanggalSurat"
          type="date"
          value={form.tanggalSurat}
          onChange={e => setForm((f: any) => ({ ...f, tanggalSurat: e.target.value }))}
          required
        />
        <div className="md:col-span-2 flex space-x-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button type="button" variant="secondary" onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button type="button" variant="secondary" onClick={handlePrintPdf}>
            Print PDF
          </Button>
        </div>
      </form>
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Preview Surat"
      >
        <div className="p-4 bg-white">
          <pre className="whitespace-pre-wrap font-sans text-base">
            {JSON.stringify(form, null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePersetujuanCalonPengantinLetter;
