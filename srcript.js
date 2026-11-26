
// =====================================
// 1. KONEKSI SUPABASE
// =====================================

const SUPABASE_URL = "MASUKKAN_PROJECT_URL";
const SUPABASE_KEY = "MASUKKAN_PUBLISHABLE_KEY";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Nama tabel database
const TABLE = "makanan";

// =====================================
// 2. FORMAT RUPIAH
// =====================================

function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 2
    }).format(angka);
}

// =====================================
// 3. SELECT - MENAMPILKAN DATA
// =====================================

let semuaMakanan = [];

async function ambilData() {
    const daftar = document.getElementById("daftarMakanan");

    daftar.innerHTML = `
        <tr><td colspan="4">Memuat data...</td></tr>
    `;

    const { data, error } = await db
        .from(TABLE)
        .select("*")
        .order("id_makanan", { ascending: true });

    if (error) {
        daftar.innerHTML = `
            <tr><td colspan="4">${error.message}</td></tr>
        `;
        return;
    }

    semuaMakanan = data;
    tampilkanData(semuaMakanan);
    hitungStatistik();
}

function tampilkanData(data) {
    const daftar = document.getElementById("daftarMakanan");
    daftar.innerHTML = "";

    if (data.length === 0) {
        daftar.innerHTML = `
            <tr>
                <td colspan="4">Belum ada data makanan.</td>
            </tr>
        `;
        return;
    }

    data.forEach(item => {
        const baris = document.createElement("tr");

        const kolomID = document.createElement("td");
        kolomID.textContent = item.id_makanan;

        const kolomNama = document.createElement("td");
        kolomNama.textContent = item.nama_makanan;

        const kolomHarga = document.createElement("td");
        kolomHarga.textContent = rupiah(item.harga);

        const kolomAksi = document.createElement("td");

        const tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.className = "btn-edit";
        tombolEdit.addEventListener("click", () => {
            editMakanan(item.id_makanan);
        });

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.className = "btn-delete";
        tombolHapus.addEventListener("click", () => {
            hapusMakanan(item.id_makanan);
        });

        kolomAksi.append(tombolEdit, tombolHapus);
        baris.append(kolomID, kolomNama, kolomHarga, kolomAksi);
        daftar.appendChild(baris);
    });
}

// =====================================
// 4. INSERT DAN UPDATE
// =====================================

document.getElementById("formMakanan")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const id = document.getElementById("id_makanan").value;
    const nama = document.getElementById("nama_makanan").value.trim();
    const harga = Number(document.getElementById("harga").value);

    if (!nama || !Number.isFinite(harga) || harga < 0) {
        alert("Masukkan nama dan harga yang benar!");
        return;
    }

    const tombol = document.getElementById("btnSimpan");
    tombol.disabled = true;

    let hasil;

    if (id) {
        // UPDATE / EDIT
        hasil = await db
            .from(TABLE)
            .update({
                nama_makanan: nama,
                harga: harga
            })
            .eq("id_makanan", id);
    } else {
        // INSERT / TAMBAH
        hasil = await db
            .from(TABLE)
            .insert([{
                nama_makanan: nama,
                harga: harga
            }]);
    }

    tombol.disabled = false;

    if (hasil.error) {
        alert("Gagal menyimpan: " + hasil.error.message);
        return;
    }

    alert(id ? "Data berhasil diedit!" : "Makanan berhasil ditambahkan!");

    resetForm();
    ambilData();
});

// =====================================
// 5. EDIT DATA
// =====================================

function editMakanan(id) {
    const item = semuaMakanan.find(
        makanan => String(makanan.id_makanan) === String(id)
    );

    if (!item) return;

    document.getElementById("id_makanan").value = item.id_makanan;
    document.getElementById("nama_makanan").value = item.nama_makanan;
    document.getElementById("harga").value = item.harga;

    document.getElementById("judulForm").textContent = "Edit Makanan";
    document.getElementById("btnSimpan").textContent = "Simpan Perubahan";
    document.getElementById("btnBatal").hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =====================================
// 6. DELETE - HAPUS DATA
// =====================================

async function hapusMakanan(id) {
    const yakin = confirm("Apakah kamu yakin ingin menghapus makanan ini?");

    if (!yakin) return;

    const { error } = await db
        .from(TABLE)
        .delete()
        .eq("id_makanan", id);

    if (error) {
        alert("Gagal menghapus: " + error.message);
        return;
    }

    alert("Makanan berhasil dihapus!");
    ambilData();
}

// =====================================
// 7. RESET FORM
// =====================================

function resetForm() {
    document.getElementById("formMakanan").reset();
    document.getElementById("id_makanan").value = "";

    document.getElementById("judulForm").textContent = "Tambah Makanan";
    document.getElementById("btnSimpan").textContent = "+ Tambah Makanan";
    document.getElementById("btnBatal").hidden = true;
}

// =====================================
// 8. PENCARIAN MAKANAN
// =====================================

document.getElementById("pencarian")
.addEventListener("input", function() {

    const kata = this.value.toLowerCase();

    const hasil = semuaMakanan.filter(item =>
        item.nama_makanan.toLowerCase().includes(kata)
    );

    tampilkanData(hasil);
});

// =====================================
// 9. STATISTIK
// =====================================

function hitungStatistik() {
    const total = semuaMakanan.length;

    const jumlahHarga = semuaMakanan.reduce(
        (sum, item) => sum + Number(item.harga),
        0
    );

    document.getElementById("totalMakanan").textContent = total;

    document.getElementById("totalHarga").textContent =
        rupiah(jumlahHarga);
}

// =====================================
// 10. JALANKAN WEBSITE
// =====================================

ambilData();
