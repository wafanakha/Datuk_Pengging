import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../../logo-bms.png";
import { residentService } from "../../services/residentService";
import { LetterHistory } from "../../types";
import { saveLetterHistory } from "../../services/residentService";
interface PewarisData {
  nama: string;
  umur: string;
  alamat: string;
  hariWafat: string;
  tanggalWafat: string;
  tempatWafat: string;
  aktaKematian: string;
  tanggalAkta: string;
}

interface AhliWarisData {
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  alamat: string;
  hubungan: string;
}

const initialPewaris: PewarisData = {
  nama: "",
  umur: "",
  alamat: "",
  hariWafat: "",
  tanggalWafat: "",
  tempatWafat: "",
  aktaKematian: "",
  tanggalAkta: "",
};

const initialAhliWaris: AhliWarisData[] = [];

const CreateAhliWarisLetter: React.FC = () => {
  const [pewarisSearch, setPewarisSearch] = useState("");
  const [pewarisSearchResults, setPewarisSearchResults] = useState<any[]>([]);
  const [searchingPewaris, setSearchingPewaris] = useState(false);
  const [pewaris, setPewaris] = useState<PewarisData>(initialPewaris);
  const [ahliWaris, setAhliWaris] = useState<AhliWarisData[]>([]);
  const [letterNumber, setLetterNumber] = useState("");
  const navigate = useNavigate();

  // Cari Pewaris berdasarkan NIK/Nama
  const handlePewarisSearch = async () => {
    setSearchingPewaris(true);
    const results = await residentService.searchByNikOrName(pewarisSearch); // Anda perlu menyesuaikan residentService
    setPewarisSearchResults(results);
    setSearchingPewaris(false);
  };

  // Pilih Pewaris dari hasil pencarian
  const handleSelectPewaris = (pewarisRes: any) => {
    setPewaris({
      nama: pewarisRes.name,
      umur: pewarisRes.age + " Tahun",
      alamat: pewarisRes.address,
      hariWafat: "",
      tanggalWafat: "",
      tempatWafat: "",
      aktaKematian: "",
      tanggalAkta: "",
    });
    setPewarisSearchResults([]);
    setPewarisSearch("");
  };

  // Tambah Ahli Waris (otomatis jika ditemukan, manual jika tidak)
  const handleAddAhliWaris = async (search: string) => {
    let data: import("../../types").Resident | null = null;
    if (search) {
      const results = await residentService.searchByNikOrName(search);
      if (results && results.length > 0) {
        data = results[0];
      }
    }
    setAhliWaris([
      ...ahliWaris,
      data
        ? {
            nama: data.name,
            tempatLahir: data.birthPlace,
            tanggalLahir: data.birthDate,
            nik: data.nik,
            alamat: data.address,
            hubungan: data.shdk || "",
          }
        : {
            nama: "",
            tempatLahir: "",
            tanggalLahir: "",
            nik: "",
            alamat: "",
            hubungan: "",
          },
    ]);
  };

  // Edit field ahli waris manual
  const handleEditAhliWaris = (idx: number, field: keyof AhliWarisData, value: string) => {
    const updated = [...ahliWaris];
    updated[idx][field] = value;
    setAhliWaris(updated);
  };

  // Hapus ahli waris
  const handleRemoveAhliWaris = (idx: number) => {
    setAhliWaris(ahliWaris.filter((_, i) => i !== idx));
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF("p", "mm", "a4");
    // Logo
    doc.addImage(logo, "PNG", 20, 10, 24, 24);
    // Header
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text("PEMERINTAH KABUPATEN BANYUMAS", 105, 17, { align: "center" });
    doc.text("KECAMATAN PATIKRAJA", 105, 23, { align: "center" });
    doc.text("KEPALA DESA KEDUNGWRINGIN", 105, 29, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("Times", "Normal");
    doc.text(
      "Jalan Raya Kedungwringin No. 01 Telp. 0281 6438935 Kode Pos    53171",
      105,
      35,
      { align: "center" }
    );
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);
    // Title
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text("SURAT KETERANGAN AHLI WARIS", 105, 48, { align: "center" });
    doc.setLineWidth(0.7);
    doc.setFont("Times", "Normal");
    doc.setFontSize(11);
    doc.text(`Nomor : ${letterNumber || "145/           /III/2025"}`, 105, 55, {
      align: "center",
    });
    let y = 65;
    doc.setFontSize(11);
    doc.text("Yang bertanda tangan di bawah ini :", 20, y);
    y += 7;
    doc.text("Nama", 30, y);
    doc.text(": PARMINAH", 60, y);
    y += 6;
    doc.text("Jabatan", 30, y);
    doc.text(": Kepala Desa Kedungwringin", 60, y);
    y += 8;
    doc.text("Dengan ini menerangkan dengan sebenarnya, Bahwa :", 20, y);
    y += 7;
    doc.text("Nama", 30, y);
    doc.text(`: ${pewaris.nama}`, 60, y);
    y += 6;
    doc.text("Umur", 30, y);
    doc.text(`: ${pewaris.umur}`, 60, y);
    y += 6;
    doc.text("Alamat", 30, y);
    doc.text(`: ${pewaris.alamat}`, 60, y);
    y += 8;
    const kalimatKematian = `Telah meninggal dunia pada hari ${
      pewaris.hariWafat || "..."
    } tanggal ${
      pewaris.tanggalWafat
        ? new Date(pewaris.tanggalWafat).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "..."
    } di ${
      pewaris.tempatWafat || "..."
    }, sebagaimana tercatat pada Akta Kematian No. ${
      pewaris.aktaKematian || "..."
    } tanggal ${
      pewaris.tanggalAkta
        ? new Date(pewaris.tanggalAkta).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "..."
    }.`;
    const kematianLines = doc.splitTextToSize(kalimatKematian, 170);
    doc.text(kematianLines, 20, y);
    y += kematianLines.length * 6;
    doc.text(
      "Bahwa berdasarkan data yang ditunjukkan sesuai ketentuan hukum yang berlaku, yang menjadi ahli waris dari",
      20,
      y
    );
    y += 6;
    doc.text("pewaris adalah sebagai berikut :", 20, y);
    // Ahli waris list
    ahliWaris.forEach((a, i) => {
      y += 8;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Times", "Bold");
      doc.text(`${i + 1}.`, 23, y);
      doc.setFont("Times", "Normal");
      doc.text("Nama", 30, y);
      doc.text(`: ${a.nama}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("Tempat/Tgl Lahir", 30, y);
      doc.text(`: ${a.tempatLahir}, ${a.tanggalLahir}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("No KTP/NIK", 30, y);
      doc.text(`: ${a.nik}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("Alamat", 30, y);
      doc.text(`: ${a.alamat}`, 60, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text("Hubungan dengan ahli waris", 30, y);
      doc.text(`: ${a.hubungan}`, 90, y);
    });
    y += 10;
    doc.text(
      "Bahwa selain ahli waris tersebut di atas, tidak ada lagi ahli waris lain dari pewaris,",
      20,
      y
    );
    y += 6;
    doc.text(
      "Demikian Surat Keterangan Ahli Waris ini kami buat dengan sebenarnya. Dan untuk dapat dipergunakan",
      20,
      y
    );
    y += 6;
    doc.text("sebagaimana mestinya.", 20, y);
    y += 12;
    doc.text(
      `Kedungwringin, ${new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      135,
      y
    );
    y += 7;
    doc.text("Kepala Desa", 145, y);
    y += 20;
    doc.setFont("Times", "Bold");
    doc.text("PARMINAH", 145, y);
    return doc;
  };
  // Export PDF
  const handleExportPDF = () => {
    const doc = generatePDF();
    doc.save("ahli-waris.pdf");

    const historyEntry: LetterHistory = {
      name: pewaris.nama,
      letter: "keramaian", // Since this is the usaha letter component
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

    // For Electron environment
    window.open(doc.output("bloburl"), "_blank");

    // Also save history
    const historyEntry: LetterHistory = {
      name: pewaris.nama,
      letter: "ahli-waris",
      date: new Date().toISOString(),
    };

    saveLetterHistory(historyEntry)
      .then(() => console.log("Letter history saved"))
      .catch((error) => console.error("Failed to save letter history:", error));
  };

  // Fungsi untuk mendapatkan nama hari dari tanggal (dalam bahasa Indonesia)
  function getHariFromTanggal(tanggal: string): string {
    if (!tanggal) return "";
    const hariList = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const date = new Date(tanggal);
    return hariList[date.getDay()];
  }

  return (
    <div className="w-full ml-0 py-8">
      <h1 className="text-2xl font-bold mb-4 text-left text-teal-800">
        Surat Keterangan Ahli Waris
      </h1>
      <div className="mb-4">
        <div className="mb-2">
          <input
            type="text"
            className="input w-full"
            placeholder="Cari NIK/Nama Pewaris..."
            value={pewarisSearch}
            onChange={e => setPewarisSearch(e.target.value)}
          />
          <Button variant="primary" onClick={handlePewarisSearch} className="mt-2">Cari Pewaris</Button>
          {searchingPewaris && <div className="text-sm text-gray-500">Mencari...</div>}
          {pewarisSearchResults.length > 0 && (
            <div className="bg-white border rounded shadow mt-1 max-h-48 overflow-auto z-10 relative">
              {pewarisSearchResults.map((res) => (
                <div
                  key={res.nik}
                  className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                  onClick={() => handleSelectPewaris(res)}
                >
                  {res.nik} - {res.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          className="input w-full mt-2"
          placeholder="Nomor Surat"
          value={letterNumber}
          onChange={(e) => setLetterNumber(e.target.value)}
        />
        {/* Data Pewaris */}
        <div className="mt-4">
          <div className="font-semibold mb-2">Data Pewaris (yang meninggal):</div>
          <input type="text" className="input w-full mt-2" placeholder="Nama" value={pewaris.nama} onChange={e => setPewaris({ ...pewaris, nama: e.target.value })} />
          <input type="text" className="input w-full mt-2" placeholder="Umur" value={pewaris.umur} onChange={e => setPewaris({ ...pewaris, umur: e.target.value })} />
          <input type="text" className="input w-full mt-2" placeholder="Alamat" value={pewaris.alamat} onChange={e => setPewaris({ ...pewaris, alamat: e.target.value })} />
          <input type="text" className="input w-full mt-2" placeholder="Nomor Akta Kematian" value={pewaris.aktaKematian} onChange={e => setPewaris({ ...pewaris, aktaKematian: e.target.value })} />
          <div className="flex gap-2">
            <label className="text-xs text-gray-600 mb-1">Tanggal Wafat</label>
            <input type="date" className="input w-full mt-2" placeholder="Tanggal Wafat" value={pewaris.tanggalWafat} onChange={e => {
              const tanggal = e.target.value;
              setPewaris({ ...pewaris, tanggalWafat: tanggal, hariWafat: getHariFromTanggal(tanggal) });
            }} />
            <label className="text-xs text-gray-600 mb-1">Tanggal Akta Kematian</label>
            <input type="date" className="input w-full mt-2" placeholder="Tanggal Akta Kematian" value={pewaris.tanggalAkta} onChange={e => setPewaris({ ...pewaris, tanggalAkta: e.target.value })} />
          </div>
          <input type="text" className="input w-full mt-2" placeholder="Hari Wafat" value={pewaris.hariWafat} onChange={e => setPewaris({ ...pewaris, hariWafat: e.target.value })} />
          <input type="text" className="input w-full mt-2" placeholder="Tempat Wafat" value={pewaris.tempatWafat} onChange={e => setPewaris({ ...pewaris, tempatWafat: e.target.value })} />
        </div>
        {/* Daftar Ahli Waris */}
        <div className="mt-6">
          <div className="font-semibold mb-2">Daftar Ahli Waris:</div>
          {ahliWaris.map((a, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input type="text" className="input" placeholder="Nama" value={a.nama} onChange={e => handleEditAhliWaris(i, 'nama', e.target.value)} />
              <input type="text" className="input" placeholder="Tempat Lahir" value={a.tempatLahir} onChange={e => handleEditAhliWaris(i, 'tempatLahir', e.target.value)} />
              <input type="date" className="input" placeholder="Tanggal Lahir" value={a.tanggalLahir} onChange={e => handleEditAhliWaris(i, 'tanggalLahir', e.target.value)} />
              <input type="text" className="input" placeholder="NIK" value={a.nik} onChange={e => handleEditAhliWaris(i, 'nik', e.target.value)} />
              <input type="text" className="input" placeholder="Alamat" value={a.alamat} onChange={e => handleEditAhliWaris(i, 'alamat', e.target.value)} />
              <input type="text" className="input" placeholder="Hubungan" value={a.hubungan} onChange={e => handleEditAhliWaris(i, 'hubungan', e.target.value)} />
              <Button variant="danger" onClick={() => handleRemoveAhliWaris(i)}>-</Button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input type="text" className="input" placeholder="Cari NIK/Nama untuk tambah ahli waris (opsional)" id="addAhliWarisInput" />
            <Button variant="primary" onClick={async () => {
              const val = (document.getElementById('addAhliWarisInput') as HTMLInputElement)?.value;
              await handleAddAhliWaris(val);
              if (document.getElementById('addAhliWarisInput')) (document.getElementById('addAhliWarisInput') as HTMLInputElement).value = '';
            }}>+</Button>
          </div>
        </div>
      </div>
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
        id="ahli-waris-preview"
        className="bg-white p-8 border shadow max-w-[800px] ml-0"
        style={{ marginLeft: 0 }}
      >
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo Instansi" className="h-24 mr-4" />
          <div className="text-center w-full">
            <div className="font-bold">PEMERINTAHAN DESA KEDUNGWRINGIN</div>
            <div className="font-bold">
              KECAMATAN PATIKRAJA KABUPATEN BANYUMAS
            </div>
            <div className="font-bold">SEKRETARIAT DESA</div>
            <div className="font-bold">
              Jl. Raya Kedungwringin No. 1 Kedungwringin Kode Pos 53171
            </div>
            <div className="font-bold">Telp. (0281) 638395</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">
            SURAT KETERANGAN AHLI WARIS
          </div>
          <div className="text-sm">
            Nomor: {letterNumber || `145/ /III/${new Date().getFullYear()}`}
          </div>
        </div>
        <div className="mb-2" style={{ textAlign: "left" }}>
          Yang bertanda tangan di bawah ini:
          <br />
          <table style={{ marginLeft: 20 }}>
            <tbody>
              <tr>
                <td>Nama</td>
                <td>:</td>
                <td>PARMINAH</td>
              </tr>
              <tr>
                <td>Jabatan</td>
                <td>:</td>
                <td>Kepala Desa Kedungwringin</td>
              </tr>
            </tbody>
          </table>
          <br />
          Dengan ini menerangkan dengan sebenarnya, Bahwa:
          <table style={{ marginLeft: 20 }}>
            <tbody>
              <tr>
                <td>Nama</td>
                <td>:</td>
                <td>{pewaris.nama}</td>
              </tr>
              <tr>
                <td>Umur</td>
                <td>:</td>
                <td>{pewaris.umur}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>:</td>
                <td>{pewaris.alamat}</td>
              </tr>
            </tbody>
          </table>
          <br />
          Telah meninggal dunia pada hari <b>
            {pewaris.hariWafat}
          </b> tanggal <b>{pewaris.tanggalWafat}</b> di {pewaris.tempatWafat},
          sebagaimana tercatat pada Akta Kematian No.{" "}
          <b>{pewaris.aktaKematian}</b> tanggal <b>{pewaris.tanggalAkta}</b>.
          <br />
          Bahwa berdasarkan data yang ditunjukkan sesuai ketentuan hukum yang
          berlaku, yang menjadi ahli waris dari pewaris adalah sebagai berikut:
          <table
            style={{
              marginLeft: 20,
              marginTop: 10,
              marginBottom: 10,
              width: "100%",
            }}
          >
            <thead>
              <tr style={{ fontWeight: "bold", textAlign: "left" }}>
                <td>Nama</td>
                <td>Tempat/Tgl Lahir</td>
                <td>No KTP/NIK</td>
                <td>Alamat</td>
                <td>Hubungan</td>
              </tr>
            </thead>
            <tbody>
              {ahliWaris.map((a, i) => (
                <tr key={i}>
                  <td>{a.nama}</td>
                  <td>
                    {a.tempatLahir}, {a.tanggalLahir}
                  </td>
                  <td>{a.nik}</td>
                  <td>{a.alamat}</td>
                  <td>{a.hubungan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          Bahwa selain ahli waris tersebut di atas, tidak ada lagi ahli waris
          lain dari pewaris.
          <br />
          Demikian Surat Keterangan Ahli Waris ini kami buat dengan sebenarnya.
          Dan untuk dapat dipergunakan sebagaimana mestinya.
        </div>
        <div style={{ textAlign: "right", marginTop: 40 }}>
          Kedungwringin,{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          <br />
          <b>Kepala Desa</b>
          <div style={{ minHeight: 70 }}></div>
          <b>PARMINAH</b>
        </div>
      </div>
    </div>
  );
};

export default CreateAhliWarisLetter;
