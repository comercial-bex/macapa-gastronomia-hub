import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Image, Video, X, UtensilsCrossed, MapPin, Tag, Images, Leaf, Sprout, WheatOff, Flame, HelpCircle, ExternalLink, Settings2, AlertTriangle, Sparkles, Copy, CopyPlus, Printer, FileDown, ChevronDown, CalendarDays, Eye, EyeOff, Camera, ImageOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { compressImage } from "@/lib/compressImage";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORIAS = ["entrada", "principal", "acompanhamento", "sobremesa"] as const;
const DIET_TAGS = [
  { key: "vegano", label: "Vegano", icon: Leaf, color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  { key: "vegetariano", label: "Vegetariano", icon: Sprout, color: "bg-green-500/15 text-green-600 border-green-500/30" },
  { key: "sem-gluten", label: "Sem glúten", icon: WheatOff, color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  { key: "picante", label: "Picante", icon: Flame, color: "bg-red-500/15 text-red-600 border-red-500/30" },
] as const;

const getMenuMediaPath = (url?: string | null) => {
  if (!url) return null;
  const [, rawPath] = url.split("/menu-items/");
  return rawPath ? rawPath.split("?")[0] : null;
};

const AdminMenu = () => {
  const [days, setDays] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("");
  const [newPrato, setNewPrato] = useState("");
  const [newCategoria, setNewCategoria] = useState<string>("principal");
  const [newUnitId, setNewUnitId] = useState<string>("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const { logAction } = useAuditLog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; prato: string } | null>(null);
  const [detailsItem, setDetailsItem] = useState<any | null>(null);
  const [detailsForm, setDetailsForm] = useState({ descricao: "", badge: "", esgotado: false, alergenos: "", disponivel_de: "", disponivel_ate: "" });
  const [savingDetails, setSavingDetails] = useState(false);
  const [filter, setFilter] = useState<"todos" | "sem-foto" | "esgotados" | "novos">("todos");
  const [copyDialog, setCopyDialog] = useState<{ open: boolean; targetDayId: string; mode: "merge" | "replace" }>({ open: false, targetDayId: "", mode: "merge" });
  const [dayManagerOpen, setDayManagerOpen] = useState(false);
  const [newDayName, setNewDayName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = async () => {
    const [d, i, u] = await Promise.all([
      supabase.from("weekly_menu_days").select("*").order("ordem"),
      supabase.from("weekly_menu_items").select("*").order("ordem"),
      supabase.from("units").select("id, nome").eq("ativo", true),
    ]);
    if (d.data) { setDays(d.data); if (!activeDay && d.data.length) setActiveDay(d.data[0].id); }
    if (i.data) setItems(i.data);
    if (u.data) setUnits(u.data);
  };

  useEffect(() => { fetchData(); }, []);

  useRealtimeRefresh(["weekly_menu_items", "weekly_menu_days"], fetchData);

  const addItem = async () => {
    if (!newPrato.trim() || !activeDay) return;
    const dayItems = items.filter((i) => i.day_id === activeDay);
    await supabase.from("weekly_menu_items").insert({
      day_id: activeDay,
      prato: newPrato.trim(),
      ordem: dayItems.length,
      ativo: true,
      categoria: newCategoria,
      unit_id: newUnitId || null,
    } as any);
    const dayName = days.find(d => d.id === activeDay)?.dia_semana;
    await logAction("cardapio", "criou", `Adicionou prato '${newPrato.trim()}' em ${dayName}`);
    setNewPrato("");
    toast.success("Adicionado!");
    fetchData();
  };

  const updateCategoria = async (id: string, categoria: string) => {
    await supabase.from("weekly_menu_items").update({ categoria } as any).eq("id", id);
    fetchData();
  };

  const updateUnit = async (id: string, unit_id: string | null) => {
    await supabase.from("weekly_menu_items").update({ unit_id } as any).eq("id", id);
    fetchData();
  };

  const toggleTag = async (item: any, tagKey: string) => {
    const current: string[] = item.tags || [];
    const next = current.includes(tagKey) ? current.filter((t) => t !== tagKey) : [...current, tagKey];
    await supabase.from("weekly_menu_items").update({ tags: next } as any).eq("id", item.id);
    fetchData();
  };

  const toggleActive = async (id: string, ativo: boolean) => {
    await supabase.from("weekly_menu_items").update({ ativo: !ativo }).eq("id", id);
    fetchData();
  };

  const deleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    const mediaPath = getMenuMediaPath(item?.imagem_url);
    if (mediaPath) await supabase.storage.from("menu-items").remove([mediaPath]);
    const { error } = await supabase.from("weekly_menu_items").delete().eq("id", id);
    if (error) { toast.error("Falha ao excluir: " + error.message); return; }
    await logAction("cardapio", "excluiu", `Removeu prato '${item?.prato}'`);
    toast.success("Removido!");
    fetchData();
  };

  // Duplicate one dish in place (without media, to avoid cloning storage).
  const duplicateItem = async (item: any) => {
    const dayItemsLocal = items.filter((i) => i.day_id === item.day_id);
    const payload: any = {
      day_id: item.day_id,
      prato: `${item.prato} (cópia)`,
      categoria: item.categoria,
      unit_id: item.unit_id,
      tags: item.tags || [],
      ativo: item.ativo,
      descricao: item.descricao,
      badge: item.badge,
      esgotado: false,
      alergenos: item.alergenos || [],
      disponivel_de: item.disponivel_de,
      disponivel_ate: item.disponivel_ate,
      ordem: dayItemsLocal.length,
    };
    const { error } = await supabase.from("weekly_menu_items").insert(payload);
    if (error) { toast.error("Falha ao duplicar: " + error.message); return; }
    await logAction("cardapio", "criou", `Duplicou prato '${item.prato}'`);
    toast.success("Prato duplicado!");
    fetchData();
  };

  // Copy all dishes from active day to another day (merge appends, replace clears target first).
  const copyDayTo = async (targetDayId: string, mode: "merge" | "replace") => {
    if (!activeDay || !targetDayId || targetDayId === activeDay) {
      toast.error("Escolha um dia diferente.");
      return;
    }
    const source = items.filter((i) => i.day_id === activeDay);
    if (source.length === 0) { toast.error("Dia de origem está vazio."); return; }

    if (mode === "replace") {
      const existingTarget = items.filter((i) => i.day_id === targetDayId);
      // Remove media for items being replaced.
      for (const it of existingTarget) {
        const p = getMenuMediaPath(it.imagem_url);
        if (p) await supabase.storage.from("menu-items").remove([p]);
      }
      if (existingTarget.length > 0) {
        const { error: delErr } = await supabase.from("weekly_menu_items").delete().eq("day_id", targetDayId);
        if (delErr) { toast.error("Falha ao limpar dia de destino: " + delErr.message); return; }
      }
    }

    const baseOrder = mode === "merge" ? items.filter((i) => i.day_id === targetDayId).length : 0;
    const payloads = source.map((it, idx) => ({
      day_id: targetDayId,
      prato: it.prato,
      categoria: it.categoria,
      unit_id: it.unit_id,
      tags: it.tags || [],
      ativo: it.ativo,
      descricao: it.descricao,
      badge: it.badge,
      esgotado: false,
      alergenos: it.alergenos || [],
      disponivel_de: it.disponivel_de,
      disponivel_ate: it.disponivel_ate,
      ordem: baseOrder + idx,
      // imagem_url/tipo_midia ficam vazios — fotos são únicas por id, não copiamos arquivo.
    }));
    const { error } = await supabase.from("weekly_menu_items").insert(payloads as any);
    if (error) { toast.error("Falha ao copiar dia: " + error.message); return; }
    const targetName = days.find((d) => d.id === targetDayId)?.dia_semana;
    const srcName = days.find((d) => d.id === activeDay)?.dia_semana;
    await logAction("cardapio", "criou", `Copiou ${source.length} prato(s) de ${srcName} para ${targetName} (${mode})`);
    toast.success(`${source.length} prato(s) copiados para ${targetName}.`);
    setCopyDialog({ open: false, targetDayId: "", mode: "merge" });
    fetchData();
  };

  // Export current day to CSV (Excel-friendly, BR locale).
  const exportDayCSV = () => {
    const rows = visibleItems;
    if (rows.length === 0) { toast.error("Nada para exportar."); return; }
    const header = ["Prato", "Categoria", "Unidade", "Descrição", "Badge", "Esgotado", "Alérgenos", "Disponível de", "Disponível até", "Tags", "Tem foto"];
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(";")];
    for (const it of rows) {
      const unitName = units.find((u) => u.id === it.unit_id)?.nome || "Todas";
      lines.push([
        it.prato, it.categoria || "", unitName, it.descricao || "", it.badge || "",
        it.esgotado ? "Sim" : "Não", (it.alergenos || []).join(", "),
        (it.disponivel_de || "").slice(0, 5), (it.disponivel_ate || "").slice(0, 5),
        (it.tags || []).join(", "), it.imagem_url ? "Sim" : "Não",
      ].map(esc).join(";"));
    }
    const csv = "\uFEFF" + lines.join("\n"); // BOM para Excel reconhecer UTF-8.
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cardapio-${activeDayName || "dia"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV gerado.");
  };

  // Print: opens a clean printable view of the current day.
  const printDay = () => {
    const rows = visibleItems;
    if (rows.length === 0) { toast.error("Nada para imprimir."); return; }
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { toast.error("Permita pop-ups para imprimir."); return; }
    const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);
    const itemsHtml = rows.map((it) => `
      <li class="dish">
        <div class="title">${escapeHtml(it.prato)}${it.esgotado ? ' <span class="tag tag-out">Esgotado hoje</span>' : ""}${it.badge ? ` <span class="tag">${escapeHtml(it.badge)}</span>` : ""}</div>
        ${it.descricao ? `<p>${escapeHtml(it.descricao)}</p>` : ""}
        <div class="meta">${escapeHtml(it.categoria || "")}${(it.disponivel_de || it.disponivel_ate) ? ` · ${(it.disponivel_de || "").slice(0,5)}–${(it.disponivel_ate || "").slice(0,5)}` : ""}${(it.alergenos && it.alergenos.length) ? ` · Alérgenos: ${escapeHtml(it.alergenos.join(", "))}` : ""}</div>
      </li>`).join("");
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Cardápio — ${escapeHtml(activeDayName || "")}</title>
      <style>
        @page { margin: 18mm; }
        body { font-family: Georgia, 'Times New Roman', serif; color: #222; max-width: 720px; margin: 0 auto; padding: 24px; }
        h1 { font-size: 28px; margin: 0 0 4px; }
        .sub { color: #777; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
        ul { list-style: none; padding: 0; margin: 0; }
        li.dish { padding: 14px 0; border-bottom: 1px solid #e5e5e5; }
        .title { font-size: 18px; font-weight: 600; }
        .dish p { margin: 4px 0 6px; color: #444; font-size: 14px; }
        .meta { font-size: 12px; color: #888; }
        .tag { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 999px; background: #efe8d7; color: #6b5a23; margin-left: 6px; vertical-align: middle; }
        .tag-out { background: #fde2e2; color: #a11; }
        footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
      </style></head><body>
      <p class="sub">Restaurante Macapaba — Sabor e tradição em Macapá desde 1998</p>
      <h1>Cardápio · ${escapeHtml(activeDayName || "")}</h1>
      <ul>${itemsHtml}</ul>
      <footer>Gerado em ${new Date().toLocaleString("pt-BR")}</footer>
      <script>window.onload = () => setTimeout(() => window.print(), 300);<\/script>
    </body></html>`);
    w.document.close();
  };

  const openDetails = (item: any) => {
    setDetailsItem(item);
    setDetailsForm({
      descricao: item.descricao || "",
      badge: item.badge || "",
      esgotado: !!item.esgotado,
      alergenos: (item.alergenos || []).join(", "),
      disponivel_de: item.disponivel_de ? item.disponivel_de.slice(0, 5) : "",
      disponivel_ate: item.disponivel_ate ? item.disponivel_ate.slice(0, 5) : "",
    });
  };

  const saveDetails = async () => {
    if (!detailsItem) return;
    setSavingDetails(true);
    try {
      const alergenos = detailsForm.alergenos
        ? detailsForm.alergenos.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const payload: any = {
        descricao: detailsForm.descricao || null,
        badge: detailsForm.badge || null,
        esgotado: detailsForm.esgotado,
        alergenos,
        disponivel_de: detailsForm.disponivel_de || null,
        disponivel_ate: detailsForm.disponivel_ate || null,
      };
      const { error } = await supabase.from("weekly_menu_items").update(payload).eq("id", detailsItem.id);
      if (error) { toast.error("Falha ao salvar: " + error.message); return; }
      await logAction("cardapio", "editou", `Atualizou detalhes de '${detailsItem.prato}'`);
      toast.success("Detalhes salvos!");
      setDetailsItem(null);
      fetchData();
    } finally {
      setSavingDetails(false);
    }
  };

  const saveName = async (id: string) => {
    const value = editingValue.trim();
    if (!value) { toast.error("Nome não pode ficar vazio."); return; }
    if (value.length > 80) { toast.error("Nome muito longo (máx. 80)."); return; }
    const { error } = await supabase.from("weekly_menu_items").update({ prato: value }).eq("id", id);
    if (error) { toast.error("Falha ao renomear: " + error.message); return; }
    await logAction("cardapio", "editou", `Renomeou prato para '${value}'`);
    setEditingId(null);
    toast.success("Renomeado!");
    fetchData();
  };

  const uploadMedia = async (itemId: string, file: File) => {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo) {
      toast.error("Envie apenas imagem ou vídeo.");
      return;
    }
    const maxMb = isVideo ? 50 : 20;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Arquivo acima de ${maxMb} MB.`);
      return;
    }
    setUploading(itemId);
    try {
      // Compress images client-side before upload (resize + WebP). Videos pass through.
      const finalFile = isImage ? await compressImage(file, { maxDim: 1600, quality: 0.82 }) : file;
      const finalIsVideo = finalFile.type.startsWith("video/");

      // Remove qualquer arquivo anterior deste id, qualquer extensão.
      const { data: existing } = await supabase.storage.from("menu-items").list("", { search: itemId });
      const toRemove = (existing || []).filter((f) => f.name.startsWith(`${itemId}.`)).map((f) => f.name);
      if (toRemove.length) await supabase.storage.from("menu-items").remove(toRemove);

      const rawExt = (finalFile.name.split(".").pop() || (finalIsVideo ? "mp4" : "webp")).toLowerCase().replace(/[^a-z0-9]/g, "");
      const allowed = finalIsVideo ? ["mp4", "mov", "webm"] : ["jpg", "jpeg", "png", "webp", "gif"];
      const ext = allowed.includes(rawExt) ? rawExt : (finalIsVideo ? "mp4" : "webp");
      const path = `${itemId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-items")
        .upload(path, finalFile, { upsert: true, contentType: finalFile.type, cacheControl: "3600" });
      if (uploadError) {
        toast.error("Falha no upload: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("menu-items").getPublicUrl(path);
      const bustedUrl = `${urlData.publicUrl}?v=${Date.now()}`;

      const { error: updErr } = await supabase
        .from("weekly_menu_items")
        .update({ imagem_url: bustedUrl, tipo_midia: finalIsVideo ? "video" : "imagem" })
        .eq("id", itemId);
      if (updErr) {
        toast.error("Mídia subiu mas não vinculou ao prato: " + updErr.message);
        return;
      }

      const item = items.find((i) => i.id === itemId);
      await logAction("cardapio", "editou", `Upload de mídia para '${item?.prato}'`);
      toast.success("Mídia adicionada!");
      await fetchData();
    } catch (e: any) {
      toast.error("Erro inesperado: " + (e?.message || "tente novamente"));
    } finally {
      setUploading(null);
    }
  };

  const removeMedia = async (itemId: string, url: string) => {
    const path = getMenuMediaPath(url);
    if (path) await supabase.storage.from("menu-items").remove([path]);
    await supabase.from("weekly_menu_items").update({ imagem_url: null, tipo_midia: "imagem" }).eq("id", itemId);
    const item = items.find(i => i.id === itemId);
    await logAction("cardapio", "editou", `Removeu mídia de '${item?.prato}'`);
    toast.success("Mídia removida!");
    fetchData();
  };

  // Bulk upload: tries to match each filename (without extension) to a dish name on the active day.
  // Unmatched files are skipped with a warning. Useful for feeding 10-20 photos at once.
  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const dayItemsLocal = items.filter((i) => i.day_id === activeDay);
    if (dayItemsLocal.length === 0) {
      toast.error("Cadastre os pratos primeiro, depois faça o upload em massa.");
      return;
    }

    setBulkUploading(true);
    setBulkProgress({ done: 0, total: files.length });

    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    let matched = 0;
    let skipped = 0;

    for (let idx = 0; idx < files.length; idx++) {
      const rawFile = files[idx];
      const isImageRaw = rawFile.type.startsWith("image/");
      const file = isImageRaw ? await compressImage(rawFile, { maxDim: 1600, quality: 0.82 }) : rawFile;
      const base = file.name.replace(/\.[^.]+$/, "");
      const baseNorm = norm(base);
      // best match: longest prato name contained in filename (or vice-versa)
      const candidate = dayItemsLocal
        .map((it) => ({ it, score: norm(it.prato) }))
        .filter(({ score }) => baseNorm.includes(score) || score.includes(baseNorm))
        .sort((a, b) => b.score.length - a.score.length)[0];

      if (!candidate) { skipped++; setBulkProgress({ done: idx + 1, total: files.length }); continue; }
      const target = candidate.it;
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isImage && !isVideo) { skipped++; setBulkProgress({ done: idx + 1, total: files.length }); continue; }
      // Remove anteriores em qualquer extensão.
      const { data: existing } = await supabase.storage.from("menu-items").list("", { search: target.id });
      const toRemove = (existing || []).filter((f) => f.name.startsWith(`${target.id}.`)).map((f) => f.name);
      if (toRemove.length) await supabase.storage.from("menu-items").remove(toRemove);
      const rawExt = (file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")).toLowerCase().replace(/[^a-z0-9]/g, "");
      const allowed = isVideo ? ["mp4", "mov", "webm"] : ["jpg", "jpeg", "png", "webp", "gif"];
      const ext = allowed.includes(rawExt) ? rawExt : (isVideo ? "mp4" : "webp");
      const path = `${target.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("menu-items").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("menu-items").getPublicUrl(path);
        const bustedUrl = `${urlData.publicUrl}?v=${Date.now()}`;
        const { error: updErr } = await supabase.from("weekly_menu_items").update({ imagem_url: bustedUrl, tipo_midia: isVideo ? "video" : "imagem" }).eq("id", target.id);
        if (updErr) skipped++; else matched++;
      } else {
        skipped++;
      }
      setBulkProgress({ done: idx + 1, total: files.length });
    }

    await logAction("cardapio", "editou", `Upload em massa: ${matched} mídias atribuídas, ${skipped} ignoradas`);
    toast.success(`Upload concluído: ${matched} atribuídas${skipped ? `, ${skipped} sem correspondência` : ""}.`);
    setBulkUploading(false);
    if (bulkInputRef.current) bulkInputRef.current.value = "";
    fetchData();
  };

  const dayItems = items.filter((i) => i.day_id === activeDay);
  const activeDayName = days.find((d) => d.id === activeDay)?.dia_semana;
  const semFoto = items.filter((i) => !i.imagem_url).length;
  const dayItemsComFoto = dayItems.filter((i) => i.imagem_url).length;
  const dayItemsSemFoto = dayItems.filter((i) => !i.imagem_url).length;
  const dayItemsEsgotados = dayItems.filter((i) => i.esgotado).length;
  const dayItemsNovos = dayItems.filter((i) => i.badge === "novo" || i.badge === "destaque").length;

  const visibleItems = dayItems.filter((i) => {
    if (filter === "sem-foto") return !i.imagem_url;
    if (filter === "esgotados") return !!i.esgotado;
    if (filter === "novos") return i.badge === "novo" || i.badge === "destaque";
    return true;
  });

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleItems.findIndex((i) => i.id === active.id);
    const newIndex = visibleItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(visibleItems, oldIndex, newIndex);
    // Optimistic update: rewrite "ordem" for visible subset, keep others as-is.
    const newOrderMap = new Map(reordered.map((it, idx) => [it.id, idx]));
    setItems((prev) => prev.map((it) => newOrderMap.has(it.id) ? { ...it, ordem: newOrderMap.get(it.id)! } : it));
    // Persist in background.
    const updates = reordered.map((it, idx) =>
      supabase.from("weekly_menu_items").update({ ordem: idx }).eq("id", it.id),
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) {
      toast.error("Falha ao reordenar. Recarregando…");
      fetchData();
    }
  };

  // ===== Day management =====
  const addDay = async () => {
    const nome = newDayName.trim();
    if (!nome) return;
    const { error } = await supabase.from("weekly_menu_days").insert({
      dia_semana: nome,
      ordem: days.length,
      ativo: true,
    } as any);
    if (error) return toast.error("Erro ao criar dia");
    await logAction("cardapio", "criou", `Adicionou dia '${nome}'`);
    setNewDayName("");
    toast.success("Dia criado");
    fetchData();
  };

  const renameDay = async (id: string, novo: string) => {
    const v = novo.trim();
    if (!v) return;
    await supabase.from("weekly_menu_days").update({ dia_semana: v } as any).eq("id", id);
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, dia_semana: v } : d)));
  };

  const toggleDayActive = async (id: string, ativo: boolean) => {
    await supabase.from("weekly_menu_days").update({ ativo: !ativo } as any).eq("id", id);
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ativo: !ativo } : d)));
  };

  const deleteDay = async (id: string) => {
    const dayItemsCount = items.filter((i) => i.day_id === id).length;
    if (dayItemsCount > 0) {
      toast.error(`Mova ou apague os ${dayItemsCount} prato(s) antes de excluir o dia.`);
      return;
    }
    await supabase.from("weekly_menu_days").delete().eq("id", id);
    if (activeDay === id) setActiveDay(days.find((d) => d.id !== id)?.id || "");
    fetchData();
  };

  const handleDayDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = days.findIndex((d) => d.id === active.id);
    const newIndex = days.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(days, oldIndex, newIndex);
    setDays(reordered.map((d, i) => ({ ...d, ordem: i })));
    const updates = reordered.map((d, i) =>
      supabase.from("weekly_menu_days").update({ ordem: i } as any).eq("id", d.id),
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) {
      toast.error("Falha ao reordenar dias.");
      fetchData();
    }
  };

  // ===== Global health counters =====
  const totalDays = days.length;
  const totalDaysAtivos = days.filter((d) => d.ativo !== false).length;
  const totalItems = items.length;
  const totalComFoto = items.filter((i) => i.imagem_url).length;
  const totalEsgotados = items.filter((i) => i.esgotado).length;
  const totalDestaques = items.filter((i) => i.badge === "novo" || i.badge === "destaque").length;
  const fotoPct = totalItems ? Math.round((totalComFoto / totalItems) * 100) : 0;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-2">Cardápio da Semana</h2>
      <p className="text-muted-foreground text-sm mb-3 flex items-center gap-1.5">
        Gerencie os pratos, fotos, categoria, unidade e tags dietéticas de cada dia.
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70" title="Dica: para o upload em massa, nomeie os arquivos com o nome do prato (ex: 'maniçoba.jpg').">
          <HelpCircle className="h-3 w-3" />
        </span>
      </p>

      {/* Health counters */}
      <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { icon: CalendarDays, label: "Dias ativos", value: `${totalDaysAtivos}/${totalDays}`, tone: "text-primary" },
          { icon: UtensilsCrossed, label: "Pratos totais", value: totalItems, tone: "text-foreground" },
          { icon: Camera, label: `Com foto (${fotoPct}%)`, value: totalComFoto, tone: "text-emerald-500" },
          { icon: ImageOff, label: "Sem foto", value: totalItems - totalComFoto, tone: semFoto > 0 ? "text-yellow-500" : "text-muted-foreground" },
          { icon: AlertTriangle, label: "Esgotados hoje", value: totalEsgotados, tone: totalEsgotados > 0 ? "text-destructive" : "text-muted-foreground" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 flex items-center gap-2.5">
            <c.icon className={`h-4 w-4 ${c.tone}`} />
            <div className="min-w-0">
              <div className={`text-base font-semibold leading-tight ${c.tone}`}>{c.value}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {semFoto > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm flex items-center gap-2">
          <Image className="h-4 w-4" />
          <strong>{semFoto}</strong> de {items.length} pratos ainda estão sem foto. Pratos sem foto não convertem.
        </div>
      )}

      {/* Day tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {days.map((day) => {
          const count = items.filter((i) => i.day_id === day.id).length;
          const inactive = day.ativo === false;
          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${
                activeDay === day.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              } ${inactive ? "opacity-60" : ""}`}
              title={inactive ? "Dia oculto no site público" : undefined}
            >
              {inactive && <EyeOff className="h-3 w-3" />}
              {day.dia_semana}
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </button>
          );
        })}
        <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={() => setDayManagerOpen(true)}>
          <Settings2 className="h-3.5 w-3.5" /> Gerenciar dias
        </Button>
      </div>

      {activeDay && (
        <div>
          {/* Day-level sync status + open-on-site link */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-lg bg-secondary/40 border border-border">
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{dayItemsComFoto}</span> de <span className="text-foreground font-semibold">{dayItems.length}</span> pratos com foto em <span className="text-primary font-medium">{activeDayName}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/cardapio?dia=${encodeURIComponent(activeDayName || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                title="Abrir essa página no site público"
              >
                <ExternalLink className="h-3 w-3" /> Ver no site
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                    Ações do dia <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{activeDayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCopyDialog({ open: true, targetDayId: "", mode: "merge" })}>
                    <CopyPlus className="h-3.5 w-3.5 mr-2" /> Copiar dia para…
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportDayCSV}>
                    <FileDown className="h-3.5 w-3.5 mr-2" /> Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={printDay}>
                    <Printer className="h-3.5 w-3.5 mr-2" /> Imprimir / PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
              { key: "todos", label: `Todos (${dayItems.length})` },
              { key: "sem-foto", label: `Sem foto (${dayItemsSemFoto})` },
              { key: "esgotados", label: `Esgotados hoje (${dayItemsEsgotados})` },
              { key: "novos", label: `Novos / Destaque (${dayItemsNovos})` },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key as any)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  filter === f.key
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="text-[11px] text-muted-foreground/70 ml-auto">Arraste pelo punho ⠿ para reordenar.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input value={newPrato} onChange={(e) => setNewPrato(e.target.value)} placeholder="Nome do prato" onKeyDown={(e) => e.key === "Enter" && addItem()} className="flex-1" />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={newCategoria} onChange={(e) => setNewCategoria(e.target.value)}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={newUnitId} onChange={(e) => setNewUnitId(e.target.value)}>
              <option value="">Todas unidades</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
            <Button onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
          </div>

          {/* Bulk upload */}
          <div className="mb-6 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Images className="h-4 w-4 text-primary" /> Upload em massa de fotos
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecione várias fotos e elas serão atribuídas automaticamente ao prato cujo nome aparece no arquivo. Ex: <code className="px-1 rounded bg-muted">maniçoba.jpg</code>.
                </p>
              </div>
              <Button
                onClick={() => bulkInputRef.current?.click()}
                disabled={bulkUploading || dayItems.length === 0}
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {bulkUploading ? `Enviando ${bulkProgress.done}/${bulkProgress.total}...` : "Selecionar fotos"}
              </Button>
              <input
                ref={bulkInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleBulkUpload(e.target.files)}
              />
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleItems.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleItems.map((item) => (
                  <SortableItem key={item.id} id={item.id} className="glass-effect rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Media preview */}
                <div className="relative aspect-[16/10] bg-muted">
                  {item.imagem_url ? (
                    <>
                      {item.tipo_midia === "video" ? (
                        <video src={item.imagem_url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      ) : (
                        <img src={item.imagem_url} alt={item.prato} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeMedia(item.id, item.imagem_url)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-destructive-foreground" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs flex items-center gap-1">
                        {item.tipo_midia === "video" ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                        {item.tipo_midia === "video" ? "Vídeo" : "Foto"}
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/80 transition-colors">
                      <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Upload className="h-3 w-3" />
                        {uploading === item.id ? "Enviando..." : "Adicionar mídia"}
                      </span>
                      <input type="file" accept="image/*,video/*" className="hidden" disabled={uploading === item.id}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(item.id, f); }} />
                    </label>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Switch checked={item.ativo} onCheckedChange={() => toggleActive(item.id, item.ativo)} />
                      {editingId === item.id ? (
                        <Input
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveName(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName(item.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEditingId(item.id); setEditingValue(item.prato); }}
                          title="Clique para renomear"
                          className={`text-sm font-medium truncate text-left hover:text-primary transition-colors ${!item.ativo ? "text-muted-foreground line-through" : ""}`}
                        >
                          {item.prato}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Duplicar prato" onClick={() => duplicateItem(item)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => setPendingDelete({ id: item.id, prato: item.prato })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {(item.esgotado || item.badge) && (
                    <div className="flex flex-wrap gap-1">
                      {item.esgotado && <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="h-3 w-3" /> Esgotado hoje</Badge>}
                      {item.badge && <Badge className="text-[10px] gap-1 bg-primary/15 text-primary border-primary/30"><Sparkles className="h-3 w-3" /> {item.badge}</Badge>}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <select className="text-xs bg-muted rounded px-1.5 py-0.5 border border-border" value={item.categoria || "principal"} onChange={(e) => updateCategoria(item.id, e.target.value)}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <MapPin className="h-3 w-3 text-muted-foreground ml-1" />
                    <select className="text-xs bg-muted rounded px-1.5 py-0.5 border border-border" value={item.unit_id || ""} onChange={(e) => updateUnit(item.id, e.target.value || null)}>
                      <option value="">Todas</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                  </div>

                  {/* Diet tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {DIET_TAGS.map((t) => {
                      const active = (item.tags || []).includes(t.key);
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => toggleTag(item, t.key)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                            active ? t.color : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                          }`}
                          title={`${active ? "Remover" : "Marcar como"} ${t.label}`}
                        >
                          <Icon className="h-2.5 w-2.5" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <Button size="sm" variant="ghost" className="w-full h-7 mt-1 text-xs gap-1.5" onClick={() => openDetails(item)}>
                    <Settings2 className="h-3 w-3" /> Detalhes (descrição, badge, alérgenos, horário)
                  </Button>
                </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {dayItems.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum prato cadastrado para {activeDayName}.</p>
            </div>
          )}
          {dayItems.length > 0 && visibleItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum prato neste filtro.
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir prato?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.prato}" será removido do cardápio e sua mídia apagada. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => { if (pendingDelete) { await deleteItem(pendingDelete.id); setPendingDelete(null); } }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detailsItem} onOpenChange={(o) => !o && setDetailsItem(null)}>
        <DialogContent className="glass-effect max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Detalhes — {detailsItem?.prato}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição curta</Label>
              <Textarea rows={2} maxLength={240} value={detailsForm.descricao} onChange={(e) => setDetailsForm({ ...detailsForm, descricao: e.target.value })} placeholder="Ex: Tucunaré grelhado com purê de macaxeira e farofa de banana." />
              <p className="text-[11px] text-muted-foreground mt-1">Aparece no site (máx. 240 caracteres).</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Badge</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={detailsForm.badge} onChange={(e) => setDetailsForm({ ...detailsForm, badge: e.target.value })}>
                  <option value="">Nenhuma</option>
                  <option value="novo">Novo</option>
                  <option value="destaque">Destaque</option>
                  <option value="chef">Sugestão do chef</option>
                  <option value="promocao">Promoção</option>
                </select>
              </div>
              <label className="flex items-end gap-2 text-sm pb-2">
                <Switch checked={detailsForm.esgotado} onCheckedChange={(v) => setDetailsForm({ ...detailsForm, esgotado: v })} />
                Esgotado hoje
              </label>
            </div>
            <div>
              <Label>Alérgenos</Label>
              <Input value={detailsForm.alergenos} onChange={(e) => setDetailsForm({ ...detailsForm, alergenos: e.target.value })} placeholder="Ex: glúten, lactose, frutos do mar" />
              <p className="text-[11px] text-muted-foreground mt-1">Separados por vírgula.</p>
            </div>
            <div>
              <Label>Janela de disponibilidade no dia</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input type="time" value={detailsForm.disponivel_de} onChange={(e) => setDetailsForm({ ...detailsForm, disponivel_de: e.target.value })} />
                <Input type="time" value={detailsForm.disponivel_ate} onChange={(e) => setDetailsForm({ ...detailsForm, disponivel_ate: e.target.value })} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Deixe em branco para "o dia inteiro".</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailsItem(null)}>Cancelar</Button>
            <Button onClick={saveDetails} disabled={savingDetails}>{savingDetails ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={copyDialog.open} onOpenChange={(o) => setCopyDialog((s) => ({ ...s, open: o }))}>
        <DialogContent className="glass-effect max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Copiar dia para outro dia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vai copiar <span className="text-foreground font-medium">{dayItems.length} prato(s)</span> de
              {" "}<span className="text-primary font-medium">{activeDayName}</span>. As <strong>fotos não são duplicadas</strong> (cada prato tem mídia própria).
            </p>
            <div>
              <Label>Dia de destino</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={copyDialog.targetDayId}
                onChange={(e) => setCopyDialog((s) => ({ ...s, targetDayId: e.target.value }))}
              >
                <option value="">Selecione…</option>
                {days.filter((d) => d.id !== activeDay).map((d) => (
                  <option key={d.id} value={d.id}>{d.dia_semana}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Modo</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setCopyDialog((s) => ({ ...s, mode: "merge" }))}
                  className={`text-left p-3 rounded-lg border text-sm transition-colors ${copyDialog.mode === "merge" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="font-medium">Acrescentar</div>
                  <div className="text-[11px] mt-0.5">Mantém o que já existe no destino e adiciona estes.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCopyDialog((s) => ({ ...s, mode: "replace" }))}
                  className={`text-left p-3 rounded-lg border text-sm transition-colors ${copyDialog.mode === "replace" ? "border-destructive bg-destructive/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="font-medium">Substituir</div>
                  <div className="text-[11px] mt-0.5">Apaga os pratos do destino antes de copiar.</div>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCopyDialog({ open: false, targetDayId: "", mode: "merge" })}>Cancelar</Button>
            <Button onClick={() => copyDayTo(copyDialog.targetDayId, copyDialog.mode)} disabled={!copyDialog.targetDayId}>
              Copiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dayManagerOpen} onOpenChange={setDayManagerOpen}>
        <DialogContent className="glass-effect max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Gerenciar dias da semana
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Arraste pelo punho ⠿ para reordenar. Desative para ocultar do site público sem perder os pratos.
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDayDragEnd}>
              <SortableContext items={days.map((d) => d.id)} strategy={rectSortingStrategy}>
                <div className="space-y-2">
                  {days.map((d) => {
                    const count = items.filter((i) => i.day_id === d.id).length;
                    const ativo = d.ativo !== false;
                    return (
                      <SortableItem key={d.id} id={d.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-secondary/30">
                        <Input
                          defaultValue={d.dia_semana}
                          onBlur={(e) => { if (e.target.value !== d.dia_semana) renameDay(d.id, e.target.value); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          className="h-8 text-sm flex-1"
                        />
                        <span className="text-[11px] text-muted-foreground w-16 text-right">{count} prato{count === 1 ? "" : "s"}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title={ativo ? "Ocultar do site" : "Mostrar no site"}
                          onClick={() => toggleDayActive(d.id, ativo)}
                        >
                          {ativo ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          title={count > 0 ? `Mova os ${count} prato(s) antes de excluir` : "Excluir dia"}
                          onClick={() => deleteDay(d.id)}
                          disabled={count > 0}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </SortableItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Input
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDay()}
                placeholder="Novo dia (ex: Sexta)"
                className="flex-1"
              />
              <Button onClick={addDay} className="gap-1.5"><Plus className="h-4 w-4" /> Adicionar</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDayManagerOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;
