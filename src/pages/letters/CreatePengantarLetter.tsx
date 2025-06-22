import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { Letter } from "../../types";
import { residentService } from "../../database/residentService";
import { villageService } from "../../database/villageService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
interface PengantarFormData {
  nama: string;
  nik: string;
  kk: string;
  statusKawin: string;
  berlaku?: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  keperluan: string;
  letterNumber?: string;
  keteranganLain: string;
  NoReg: string;
  tanggal?: string;
  camat: string;
}

const initialForm: PengantarFormData = {
  nama: "",
  nik: "",
  kk: "",
  statusKawin: "",
  tempatLahir: "",
  tanggalLahir: "",
  jenisKelamin: "",
  agama: "",
  pekerjaan: "",
  alamat: "",
  keperluan: "",
  letterNumber: "",
  keteranganLain: "",
  NoReg: "",
  camat: "",
};

const CreatePengantarLetter: React.FC<{
  editData?: Letter;
  isEditMode?: boolean;
}> = ({ editData, isEditMode }) => {
  const [form, setForm] = useState<PengantarFormData>(initialForm);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [villageInfo, setVillageInfo] = useState<any>(null);
  const [signer, setSigner] = useState<{ nama: string; jabatan: string } | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editData) {
      let parsed: Partial<PengantarFormData> = {};
      try {
        parsed = JSON.parse(editData.content || "{}");
      } catch {}
      setForm({ ...initialForm, ...parsed });
    }
  }, [editData]);

  React.useEffect(() => {
    villageService.getVillageInfo().then((info) => {
      setVillageInfo(info);
      if (info?.perangkat?.length) {
        // Default: Kepala Desa jika ada, jika tidak perangkat pertama
        const kepalaDesa = info.perangkat.find((p: any) =>
          p.jabatan.toLowerCase().includes("kepala desa")
        );
        setSigner(kepalaDesa || info.perangkat[0]);
      } else if (info?.kasipemerintah) {
        setSigner({ nama: info.kasipemerintah, jabatan: "Kasi Pemerintah" });
      }
    });
  }, []);

  // Helper: fallback perangkat jika tidak ada array perangkat
  const perangkatFallback: { nama: string; jabatan: string }[] = [];
  if (villageInfo) {
    // Mapping field Settings.tsx ke jabatan
    const perangkatMap: Record<string, string> = {
      leaderName: 'Kepala Desa',
      sekretaris: 'Sekretaris Desa',
      kaurUmumNTataUsaha: 'Kaur Umum & Tata Usaha',
      kaurKeuangan: 'Kaur Keuangan',
      kaurPerencanaan: 'Kaur Perencanaan',
      kasipemerintah: 'Kasi Pemerintahan',
      kasiKesejahteraan: 'Kasi Kesejahteraan',
      kasiPelayanan: 'Kasi Pelayanan',
      kadus1: 'Kepala Dusun I',
      kadus2: 'Kepala Dusun II',
      kadus3: 'Kepala Dusun III',
    };
    Object.entries(perangkatMap).forEach(([field, jabatan]) => {
      const nama = villageInfo[field];
      if (typeof nama === 'string' && nama.trim()) {
        perangkatFallback.push({ nama: nama.trim(), jabatan });
      }
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await residentService.searchResidents(e.target.value);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSelectResident = (resident: any) => {
    setForm({
      ...form,
      nama: resident.name,
      nik: resident.nik,
      kk: resident.kk,
      statusKawin: resident.maritalStatus,
      tempatLahir: resident.birthPlace,
      tanggalLahir: resident.birthDate,
      jenisKelamin: resident.gender,
      agama: resident.religion,
      pekerjaan: resident.occupation,
      alamat: resident.address,
    });
    setSearch(resident.nik + " - " + resident.name);
    setSearchResults([]);
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;
    // Logo
    doc.addImage(logo, "PNG", 15, 10, 24, 24);
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PEMERINTAHAN DESA KEDUNGWRINGIN", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
    doc.text("KECAMATAN PATIKRAJA KABUPATEN BANYUMAS", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;
    doc.text("SEKRETARIAT DESA", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text(
      "Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 5;
    doc.text("Telp. (0281) 638395", pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.setLineWidth(0.8);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Kode Desa: 02122013", 15, y);
    y += 8;
    // Judul
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SURAT PENGANTAR", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Nomor: ${
        form.letterNumber || "........................................"
      }`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 8;
    // Pembuka
    doc.text(
      "     Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin Kecamatan Patikraja Kabupaten Banyumas Provinsi Jawa Tengah, menerangkan bahwa:",
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 12;
    // Data warga
    const data = [
      ["1. Nama", form.nama],
      [
        "2. Tempat/Tgl Lahir",
        `${form.tempatLahir}, ${
          form.tanggalLahir &&
          new Date(form.tanggalLahir).toLocaleDateString("id-ID")
        }`,
      ],
      ["3. Warganegara", "Indonesia"],
      ["4. Agama", form.agama],
      ["5. Pekerjaan", form.pekerjaan],
      ["6. Status Perkawinan", `${form.statusKawin}`],
      ["7. Tempat Tinggal", `${form.alamat}`],
      ["8. Surat Bukti diri", `NIK.${form.nik}`],
      ["", `No. KK.${form.kk}`],
      ["9. Keperluan", `${form.keperluan}`],
      ["10. Berlaku", `${form.berlaku}`],
      ["11. Keterangan Lain", `${form.keteranganLain}`],
    ];
    data.forEach(([label, value]) => {
      doc.text(label, 18, y);
      doc.text(":", 65, y);
      doc.text(value || "-", 70, y);
      y += 7;
    });
    y += 10;
    doc.text(
      "Demikian surat pengantar ini dibuat untuk dapat dipergunakan seperlunya.",
      15,
      y,
      { maxWidth: pageWidth - 30 }
    );
    y += 10;
    // Footer info
    doc.text("No. Reg", 90, y);
    doc.text(":", 105, y);
    doc.text(form.NoReg || "_________", 110, y);
    y += 7;
    doc.text("Tanggal", 90, y);
    doc.text(":", 105, y);
    doc.text(
      form.tanggal
        ? new Date(form.tanggal).toLocaleDateString("id-ID")
        : "__________",
      110,
      y
    );
    let ttdY = y + 14;
    // Pemohon kiri
    // Camat tengah
    // Pejabat kanan
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      pageWidth - 23,
      ttdY,
      { align: "right" }
    );
    // Jika bukan kepala desa, tambahkan An. KEPALA DESA KEDUNGWRINGIN
    if (signer && !signer.jabatan.toLowerCase().includes("kepala desa")) {
      doc.text("An. KEPALA DESA KEDUNGWRINGIN", pageWidth - 15, ttdY + 6, {
        align: "right",
      });
    }
    doc.text(
      (signer?.jabatan?.toUpperCase() || "KASI PEMERINTAH"),
      pageWidth - 30,
      (ttdY += 12),
      { align: "right" }
    );
    doc.text("Pemohon", 30, ttdY);
    // TTD space
    ttdY += 32;
    doc.text(form.nama || "(................................)", 37, ttdY, {
      align: "center",
    });
    doc.text(
      signer?.nama || villageInfo?.kasipemerintah?.trim() || "(................................)",
      pageWidth - 35,
      ttdY,
      { align: "right" }
    );
    doc.text("Mengetahui,", pageWidth / 2, (ttdY -= 12), { align: "center" });
    doc.text("Camat Patikraja", pageWidth / 2, ttdY + 6, { align: "center" });
    ttdY += 35;
    doc.text(
      form.camat || "(................................)",
      pageWidth / 2,
      ttdY,
      { align: "center" }
    );
    return doc;
  };
  const handleExportPDF = () => {
    const doc = generatePDF();

    doc.save("surat-pengantar.pdf");
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar", // Since this is the usaha letter component
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

  const handlePrintPDF = () => {
    const doc = generatePDF();
    window.open(doc.output("bloburl"), "_blank");

    doc.save("surat-pengantar.pdf");
    const historyEntry: LetterHistory = {
      name: form.nama,
      letter: "pengantar", // Since this is the usaha letter component
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
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">
        Surat Pengantar
      </h1>
      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Cari warga (NIK/Nama)..."
          value={search}
          onChange={handleSearch}
        />
        {searching && <div className="text-sm text-gray-500">Mencari...</div>}
        {searchResults.length > 0 && (
          <div className="border rounded bg-white shadow max-h-48 overflow-y-auto z-10 relative">
            {searchResults.map((r) => (
              <div
                key={r.id}
                className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                onClick={() => handleSelectResident(r)}
              >
                {r.nik} - {r.name} ({r.address})
              </div>
            ))}
          </div>
        )}
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Pilih Penandatangan */}
        <div className="md:col-span-2 mb-2">
          <label className="block font-semibold mb-1">Tanda Tangan Oleh</label>
          <select
            className="input w-full"
            value={signer?.nama || ""}
            onChange={e => {
              let selected: { nama: string; jabatan: string } | null = null;
              if (villageInfo?.perangkat?.length) {
                selected = villageInfo.perangkat.find((p: any) => p.nama === e.target.value);
              } else {
                const found = perangkatFallback.find((p) => p.nama === e.target.value);
                selected = found ? { nama: found.nama, jabatan: found.jabatan } : null;
              }
              setSigner(selected);
            }}
          >
            {villageInfo?.perangkat?.length
              ? villageInfo.perangkat.map((p: any) => (
                  <option key={p.nama} value={p.nama}>
                    {p.jabatan} - {p.nama}
                  </option>
                ))
              : perangkatFallback.map((p) => (
                  <option key={p.nama} value={p.nama}>
                    {p.jabatan} - {p.nama}
                  </option>
                ))}
          </select>
        </div>
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          placeholder="Nama Lengkap"
          className="input"
        />
        <input
          name="nik"
          value={form.nik}
          onChange={handleChange}
          placeholder="NIK"
          className="input"
        />
        <input
          name="kk"
          value={form.kk}
          onChange={handleChange}
          placeholder="KK"
          className="input"
        />
        <input
          name="tempatLahir"
          value={form.tempatLahir}
          onChange={handleChange}
          placeholder="Tempat Lahir"
          className="input"
        />

        <div className="flex gap-2">
          <div className="flex flex-col flex-1">
            <label className="text-xs text-gray-600 mb-1">Tanggal Lahir</label>
            <input
              name="tanggalLahir"
              value={form.tanggalLahir}
              onChange={handleChange}
              placeholder="Tanggal Lahir"
              type="date"
              className="input"
            />
            <label className="text-xs text-gray-600 mb-1">Berlaku sampai</label>
            <input
              name="berlaku"
              value={form.berlaku}
              onChange={handleChange}
              placeholder="Berlaku sampai"
              type="date"
              className="input"
            />
            <label className="text-xs text-gray-600 mb-1">Tanggal</label>
            <input
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              placeholder="Tanggal"
              type="date"
              className="input"
            />
          </div>
        </div>
        <textarea
          name="keperluan"
          value={form.keperluan}
          onChange={handleChange}
          placeholder="Keperluan"
          className="input"
        />
        <input
          name="jenisKelamin"
          value={form.jenisKelamin}
          onChange={handleChange}
          placeholder="Jenis Kelamin"
          className="input"
        />
        <input
          name="agama"
          value={form.agama}
          onChange={handleChange}
          placeholder="Agama"
          className="input"
        />
        <input
          name="pekerjaan"
          value={form.pekerjaan}
          onChange={handleChange}
          placeholder="Pekerjaan"
          className="input"
        />
        <input
          name="statusKawin"
          value={form.statusKawin}
          onChange={handleChange}
          placeholder="Status Perkawinan"
          className="input"
        />
        <input
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          placeholder="Alamat"
          className="input"
        />

        <input
          name="keteranganLain"
          value={form.keteranganLain}
          onChange={handleChange}
          placeholder="Keterangan lain"
          className="input"
        />
        <input
          name="letterNumber"
          value={form.letterNumber}
          onChange={handleChange}
          placeholder="Nomor Surat"
          className="input"
        />
        <input
          name="NoReg"
          value={form.NoReg}
          onChange={handleChange}
          placeholder="No Reg"
          className="input"
        />
        <input
          name="camat"
          value={form.camat}
          onChange={handleChange}
          placeholder="Nama Camat"
          className="input"
        />
      </form>
      <div className="flex gap-2 mb-6">
        <Button variant="primary" onClick={handleExportPDF}>
          Export PDF
        </Button>
        <Button variant="primary" onClick={handlePrintPDF}>
          Print Surat
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
      <div
        id="pengantar-preview"
        className="bg-white p-8 border shadow max-w-[800px] mx-auto"
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Desa" className="h-16 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold text-lg">
              PEMERINTAHAN DESA KEDUNGWRINGIN
            </div>
            <div className="font-bold text-lg">
              KECAMATAN PATIKRAJA KABUPATEN BANYUMAS
            </div>
            <div className="font-bold">SEKRETARIAT DESA</div>
            <div className="text-sm">
              Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171
            </div>
            <div className="text-sm">Telp. (0281) 638395</div>
            <div className="text-sm">Kode Desa: 02122013</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT PENGANTAR</div>
          <div className="text-sm">
            Nomor:{" "}
            {form.letterNumber || "........................................"}
          </div>
        </div>
        <div className="mb-2">
          Yang bertanda tangan di bawah ini, kami Kepala Desa Kedungwringin
          Kecamatan Patikraja Kabupaten Banyumas Provinsi Jawa Tengah,
          menerangkan bahwa:
        </div>
        <table className="mb-2">
          <tbody>
            <tr>
              <td>1. Nama Lengkap</td>
              <td className="px-2">:</td>
              <td>{form.nama}</td>
            </tr>
            <tr>
              <td>2. Jenis Kelamin</td>
              <td className="px-2">:</td>
              <td>{form.jenisKelamin}</td>
            </tr>
            <tr>
              <td>3. Tempat/Tgl Lahir</td>
              <td className="px-2">:</td>
              <td>
                {form.tempatLahir},{" "}
                {form.tanggalLahir &&
                  new Date(form.tanggalLahir).toLocaleDateString("id-ID")}
              </td>
            </tr>
            <tr>
              <td>4. Agama</td>
              <td className="px-2">:</td>
              <td>{form.agama}</td>
            </tr>
            <tr>
              <td>5. No. KTP/NIK</td>
              <td className="px-2">:</td>
              <td>{form.nik}</td>
            </tr>
            <tr>
              <td>6. Pekerjaan</td>
              <td className="px-2">:</td>
              <td>{form.pekerjaan}</td>
            </tr>
            <tr>
              <td>7. Alamat</td>
              <td className="px-2">:</td>
              <td>{form.alamat}</td>
            </tr>
          </tbody>
        </table>
        <div className="mb-2">
          Adalah benar warga Desa Kedungwringin dan surat ini dibuat untuk
          keperluan:{" "}
          <span className="font-semibold">{form.keperluan || "..."}</span>
        </div>
        <div className="mb-2">
          Demikian surat pengantar ini dibuat untuk dapat dipergunakan
          sebagaimana mestinya.
        </div>
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div>
              Kedungwringin,{" "}
              {form.tanggal
                ? new Date(form.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
            </div>
            {/* Jika bukan kepala desa, tampilkan An. KEPALA DESA KEDUNGWRINGIN */}
            {signer && !signer.jabatan.toLowerCase().includes('kepala desa') && (
              <div className="font-bold">An. KEPALA DESA KEDUNGWRINGIN</div>
            )}
            <div className="font-bold">{signer?.jabatan ? signer.jabatan.toUpperCase() : (signer?.nama ? '' : '(................................)')}</div>
            <div style={{ height: '60px' }}></div>
            <div className="font-bold underline">
              {signer?.nama || villageInfo?.kasipemerintah?.trim() || '(................................)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePengantarLetter;
