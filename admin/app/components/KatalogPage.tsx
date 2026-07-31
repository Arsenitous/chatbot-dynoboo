"use client";
import { useState, useCallback, useEffect } from "react";
import type { Item, ItemType } from "@/lib/supabase";
import { Icons, Modal, Field, CustomSelect, fmtRp } from "./ui";

export default function KatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const [addingTypeModal, setAddingTypeModal] = useState(false);
  const [newTypeForm, setNewTypeForm] = useState({ nama: "", icon: "" });

  const emptyForm = { item_type_id: "", nama: "", deskripsi: "", harga_normal: "", harga_promo: "", satuan: "Pcs", is_active: true };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const [itemsRes, typesRes] = await Promise.all([fetch("/api/items"), fetch("/api/item-types")]);
    setItems(await itemsRes.json());
    setItemTypes(await typesRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setAdding(true); setEditing(null); };
  const openEdit = (item: Item) => {
    setForm({
      item_type_id: String(item.item_type_id ?? ""),
      nama: item.nama,
      deskripsi: item.deskripsi ?? "",
      harga_normal: String(item.harga_normal),
      harga_promo: String(item.harga_promo ?? ""),
      satuan: item.satuan,
      is_active: item.is_active,
    });
    setEditing(item); setAdding(false);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      item_type_id: form.item_type_id ? Number(form.item_type_id) : null,
      nama: form.nama,
      deskripsi: form.deskripsi || null,
      harga_normal: Number(form.harga_normal),
      harga_promo: form.harga_promo ? Number(form.harga_promo) : null,
      satuan: form.satuan,
      is_active: form.is_active,
    };
    if (editing) {
      await fetch(`/api/items/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false); setAdding(false); setEditing(null); load();
  };

  const saveNewType = async () => {
    if (!newTypeForm.nama) return;
    setSaving(true);
    const r = await fetch("/api/item-types", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTypeForm)
    });
    setSaving(false);
    if (r.ok) {
      const newType = await r.json();
      setItemTypes(prev => [...prev, newType]);
      setForm(f => ({ ...f, item_type_id: String(newType.id) }));
      setAddingTypeModal(false);
    } else {
      alert("Gagal menambahkan tipe item. Mungkin nama tersebut sudah ada?");
    }
  };

  const del = async (id: number) => {
    if (!confirm("Hapus item ini? Ini akan menghapus stok terkait juga.")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" }); load();
  };

  const typeOptions = [{ value: "", label: "Semua Tipe" }, ...itemTypes.map(t => ({ value: String(t.id), label: `${t.icon} ${t.nama}` }))];
  const satOptions = [{ value: "Pcs", label: "Pcs" }, { value: "Slot", label: "Slot" }, { value: "Set", label: "Set" }, { value: "Paket", label: "Paket" }];

  const filtered = items.filter(i => {
    const matchSearch = !search || i.nama.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || String(i.item_type_id) === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Katalog Produk</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{items.length} item terdaftar</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah Item</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></span>
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari nama produk..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ width: 200 }}>
          <CustomSelect value={filterType} onChange={setFilterType} options={typeOptions} />
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th style={{ width: 44 }}>#</th>
              <th>Nama Item</th>
              <th>Tipe</th>
              <th>Harga Normal</th>
              <th>Harga Promo</th>
              <th>Status</th>
              <th style={{ width: 90 }}>Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.id}</td>
                  <td>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.nama}</p>
                    {item.deskripsi && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.deskripsi}</p>}
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>Satuan: {item.satuan}</p>
                  </td>
                  <td><span style={{ fontSize: 12 }}>{item.item_type ? `${item.item_type.icon} ${item.item_type.nama}` : "—"}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fmtRp(item.harga_normal)}</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>{item.harga_promo ? fmtRp(item.harga_promo) : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                  <td><span className={`badge ${item.is_active ? "badge-active" : "badge-closed"}`}>{item.is_active ? "Aktif" : "Nonaktif"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(item)}><Icons.Edit /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(item.id)}><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>📦 Belum ada item di katalog</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {(adding || !!editing) && (
        <Modal title={editing ? `Edit: ${editing.nama}` : "Tambah Item Katalog"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Tipe Item" required>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <CustomSelect value={form.item_type_id} onChange={v => setForm({ ...form, item_type_id: v })} options={[{ value: "", label: "— Pilih Tipe —" }, ...itemTypes.map(t => ({ value: String(t.id), label: `${t.icon} ${t.nama}` }))]} />
                </div>
                <button className="btn btn-secondary" style={{ padding: "0 14px" }} onClick={() => { setNewTypeForm({ nama: "", icon: "📦" }); setAddingTypeModal(true); }} title="Tambah Tipe Baru">
                  <Icons.Plus />
                </button>
              </div>
            </Field>
            <Field label="Nama Item" required><input className="input" placeholder="Workshop Animal Pot, Boneka Beruang..." value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></Field>
            <Field label="Deskripsi"><textarea className="input" rows={2} placeholder="Deskripsi singkat produk..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Harga Normal" required><input className="input" type="number" placeholder="100000" value={form.harga_normal} onChange={e => setForm({ ...form, harga_normal: e.target.value })} /></Field>
              <Field label="Harga Promo"><input className="input" type="number" placeholder="90000" value={form.harga_promo} onChange={e => setForm({ ...form, harga_promo: e.target.value })} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Satuan"><CustomSelect value={form.satuan} onChange={v => setForm({ ...form, satuan: v })} options={satOptions} /></Field>
            </div>
            <Field label="Status">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={`toggle ${form.is_active ? "on" : ""}`} onClick={() => setForm({ ...form, is_active: !form.is_active })} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{form.is_active ? "Aktif (tampil & bisa dijual)" : "Nonaktif (tersembunyi)"}</span>
              </div>
            </Field>
            <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || !form.nama || !form.harga_normal || !form.item_type_id}>
                <Icons.Save /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Tambah Tipe Item */}
      {addingTypeModal && (
        <Modal title="Tambah Tipe Item Baru" onClose={() => setAddingTypeModal(false)} wide={false}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nama Tipe" required>
              <input className="input" placeholder="Contoh: Workshop, Kerajinan Tangan..." value={newTypeForm.nama} onChange={e => setNewTypeForm({ ...newTypeForm, nama: e.target.value })} autoFocus />
            </Field>
            <Field label="Icon (Emoji)" required>
              <input className="input" placeholder="📦" value={newTypeForm.icon} onChange={e => setNewTypeForm({ ...newTypeForm, icon: e.target.value })} />
            </Field>
            <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveNewType} disabled={saving || !newTypeForm.nama}>
                <Icons.Save /> {saving ? "Menyimpan..." : "Simpan Tipe"}
              </button>
              <button className="btn btn-secondary" onClick={() => setAddingTypeModal(false)}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
