weitere promts:

scalteon ladevorschau fehlt bei rechungen und lieferscheine

Die Lieferschein tabelle für die details. hier fehlt das komplette bearbeiten der lieverscheine. hinzufügen löschen ändern. 
Lieferscheinen bearbeiten: Lieferscheine können bearbeitet werden. Offene: hier können einfach alle sachen gemacht werden wie bei einer neuen bestellung, Freitext, Kommision, Artikel hinzufügen. nur eben als bearbeiten, kann hier die componente wiederverwendet werden?
Geschlossene Lieferscheine können auch bearbeitet werden, dadurch geht die Rechnung und ach der Lieferschein aauf Bearbeitet "Rote Farbe" anschließen muss man den Lieferschein und die Rechnung neu generieren. Die Bearbeitungsfunktionen sind gleich in der Lieferschein ansicht slippsheet und bei deiner neuen bestellung. sollte man hier eine componente machen und die an allen stellen einsetzten?

Handyansicht Inventur verbessern: paddings und abstände kleiner machen. Artikel Card ist unübersichtlich muss klarer werden, der badge mit dem type ist zu groß das soll auch runter in die tabelle


die Kundenansicht und lieferscheine müss angepasst werden: bei den Lieferscheinen ist es wichtig diese zu finden die noch nicht verrechnet worden sind. also noch keine
rechnungs eintrag billId haben. beim click auf den lieferschein soll man in eine ansicht kommen wo alle liefereine und rechnungen vom kunden angezeigt werden. 
hier können anschließend mehrere lieferscheine ausgewählt werden und eine Rechnung erstellt.  mittels bill/generate 



Rechnungs Kundenansicht Template:
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Filter,
  LayoutGrid,
  Package,
  Search,
  UserRound,
} from "lucide-react";

const initialCustomer = {
  id: 7,
  name: "Musterfirma GmbH",
  contact: "Einkauf · Anna Gruber",
  city: "6020 Innsbruck",
  email: "office@musterfirma.at",
  discount: 8,
};

const initialSlips = [
  {
    id: 1042,
    number: "LS-2026-0042",
    date: "17.03.2026",
    deliveryDate: "17.03.2026",
    amount: 1230.0,
    status: "Offen",
    billId: null,
    items: 4,
  },
  {
    id: 1043,
    number: "LS-2026-0043",
    date: "16.03.2026",
    deliveryDate: "16.03.2026",
    amount: 820.5,
    status: "Offen",
    billId: null,
    items: 3,
  },
  {
    id: 1035,
    number: "LS-2026-0035",
    date: "10.03.2026",
    deliveryDate: "10.03.2026",
    amount: 650.0,
    status: "Verrechnet",
    billId: 3008,
    items: 2,
  },
  {
    id: 1029,
    number: "LS-2026-0029",
    date: "03.03.2026",
    deliveryDate: "03.03.2026",
    amount: 1480.0,
    status: "Verrechnet",
    billId: 3004,
    items: 6,
  },
  {
    id: 1024,
    number: "LS-2026-0024",
    date: "28.02.2026",
    deliveryDate: "28.02.2026",
    amount: 430.0,
    status: "Offen",
    billId: null,
    items: 1,
  },
];

const initialBills = [
  {
    id: 3008,
    number: "RE-2026-0008",
    date: "11.03.2026",
    amount: 650.0,
    slipNumbers: ["LS-2026-0035"],
  },
  {
    id: 3004,
    number: "RE-2026-0004",
    date: "04.03.2026",
    amount: 1480.0,
    slipNumbers: ["LS-2026-0029"],
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

function StatusBadge({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
        open
          ? "bg-teal-50 text-teal-800 border border-teal-200"
          : "bg-slate-100 text-slate-700 border border-slate-200"
      }`}
      style={{ fontFamily: "DM Mono, monospace" }}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${open ? "bg-teal-500" : "bg-slate-400"}`}
      />
      {children}
    </span>
  );
}

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] uppercase tracking-[0.1em] text-slate-400"
      style={{ fontFamily: "DM Mono, monospace" }}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary";
}) {
  const styles =
    tone === "primary"
      ? "bg-[#134e4a] text-white hover:bg-[#0f3d3a]"
      : "border border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-900";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-[0.55rem] text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

function ContextCard({
  label,
  value,
  meta,
  tone = "teal",
}: {
  label: string;
  value: string;
  meta: string;
  tone?: "teal" | "amber" | "slate";
}) {
  const toneClass = {
    teal: "border-l-teal-500",
    amber: "border-l-amber-500",
    slate: "border-l-slate-300",
  }[tone];

  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-md border border-slate-200 border-l-[3px] ${toneClass} bg-white p-4 shadow-sm transition hover:shadow-md`}
    >
      <MiniLabel>{label}</MiniLabel>
      <div className="mt-2 text-2xl text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-500">{meta}</div>
    </motion.div>
  );
}

export default function CustomerBillingPreview() {
  const [customer] = useState(initialCustomer);
  const [slips, setSlips] = useState(initialSlips);
  const [bills, setBills] = useState(initialBills);
  const [activeSlipId, setActiveSlipId] = useState(1042);
  const [selectedSlipIds, setSelectedSlipIds] = useState<number[]>([1042]);
  const [onlyUnbilled, setOnlyUnbilled] = useState(true);
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState<string>("");

  const activeSlip = slips.find((slip) => slip.id === activeSlipId) ?? slips[0];

  const filteredSlips = useMemo(() => {
    return slips.filter((slip) => {
      const matchesQuery = `${slip.number} ${slip.date}`.toLowerCase().includes(query.toLowerCase());
      const matchesState = onlyUnbilled ? !slip.billId : true;
      return matchesQuery && matchesState;
    });
  }, [slips, query, onlyUnbilled]);

  const selectableSlips = useMemo(() => slips.filter((slip) => !slip.billId), [slips]);
  const selectedSlips = useMemo(() => slips.filter((slip) => selectedSlipIds.includes(slip.id)), [selectedSlipIds, slips]);

  const openTotal = selectableSlips.reduce((sum, slip) => sum + slip.amount, 0);

  const toggleSelected = (id: number) => {
    const slip = slips.find((entry) => entry.id === id);
    if (!slip || slip.billId) return;

    setSelectedSlipIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  };

  const generateBill = () => {
    if (!selectedSlips.length) return;

    const nextId = Math.max(...bills.map((bill) => bill.id), 3000) + 1;
    const nextNumber = `RE-2026-${String(bills.length + 9).padStart(4, "0")}`;
    const total = selectedSlips.reduce((sum, slip) => sum + slip.amount, 0);

    setBills((current) => [
      {
        id: nextId,
        number: nextNumber,
        date: "17.03.2026",
        amount: total,
        slipNumbers: selectedSlips.map((slip) => slip.number),
      },
      ...current,
    ]);

    setSlips((current) =>
      current.map((slip) =>
        selectedSlipIds.includes(slip.id)
          ? { ...slip, billId: nextId, status: "Verrechnet" }
          : slip
      )
    );

    setFlash(`${nextNumber} wurde aus ${selectedSlips.length} Lieferschein(en) erzeugt.`);
    setSelectedSlipIds([]);
  };

  const openCount = slips.filter((slip) => !slip.billId).length;
  const billedCount = slips.filter((slip) => !!slip.billId).length;

  return (
    <div
      className="min-h-screen bg-[#f7f7f4] text-slate-900"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 flex-col bg-[#0f3d3a] p-5 text-white lg:flex">
          <div className="mb-8 text-[12px] uppercase tracking-[0.28em] text-teal-400" style={{ fontFamily: "DM Mono, monospace" }}>
            sims<span className="text-white/70">.abler.tirol</span>
          </div>

          <div className="mb-3 px-2 text-[10px] uppercase tracking-[0.2em] text-white/20" style={{ fontFamily: "DM Mono, monospace" }}>
            Stammdaten
          </div>
          <nav className="space-y-1 text-sm text-white/65">
            <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-left transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/30">
              <Package size={16} /> Artikel
            </button>
            <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-left transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/30">
              <UserRound size={16} /> Kunden
            </button>
          </nav>

          <div className="mb-3 mt-8 px-2 text-[10px] uppercase tracking-[0.2em] text-white/20" style={{ fontFamily: "DM Mono, monospace" }}>
            Belege
          </div>
          <nav className="space-y-1 text-sm text-white/65">
            <button className="flex w-full items-center gap-3 rounded bg-[rgba(20,184,166,0.15)] px-3 py-2 text-left text-teal-300 focus:outline-none">
              <FileText size={16} /> Lieferscheine
            </button>
            <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-left transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/30">
              <CreditCard size={16} /> Rechnungen
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400" style={{ fontFamily: "DM Mono, monospace" }}>
                  <span>Admin</span>
                  <ChevronRight size={12} />
                  <span>Kunden</span>
                  <ChevronRight size={12} />
                  <span>Detailansicht</span>
                </div>
                <h1 className="text-4xl text-slate-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
                  Kundenansicht & Rechnungsfreigabe
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">
                  Fokus auf unverrechnete Lieferscheine ohne <span style={{ fontFamily: "DM Mono, monospace" }}>billId</span>. Klick auf einen Lieferschein öffnet die Kundenansicht mit allen Lieferscheinen und Rechnungen, inklusive Mehrfachauswahl für <span style={{ fontFamily: "DM Mono, monospace" }}>POST /bills/generate</span>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ActionButton tone="secondary">
                  <ArrowLeft size={16} /> Zur Kundenliste
                </ActionButton>
                <ActionButton onClick={generateBill} disabled={!selectedSlipIds.length}>
                  <CreditCard size={16} /> Rechnung aus Auswahl erzeugen
                </ActionButton>
              </div>
            </div>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="px-5 py-6 lg:px-8">
            {flash ? (
              <motion.div
                variants={fadeUp}
                className="mb-5 flex items-center gap-3 rounded-md border border-teal-200 border-l-[3px] border-l-teal-500 bg-teal-50 px-4 py-3 text-sm text-teal-900"
              >
                <CheckCircle2 size={18} />
                {flash}
              </motion.div>
            ) : null}

            <section className="mb-6 grid gap-4 xl:grid-cols-4">
              <ContextCard label="Kunde" value={customer.name} meta={`${customer.city} · ${customer.contact}`} tone="slate" />
              <ContextCard label="Offene Lieferscheine" value={String(openCount)} meta={`Offenes Volumen ${money(openTotal)}`} tone="teal" />
              <ContextCard label="Verrechnet" value={String(billedCount)} meta={`${bills.length} Rechnungen vorhanden`} tone="amber" />
              <ContextCard label="Kundenrabatt" value={`${customer.discount}%`} meta={customer.email} tone="slate" />
            </section>

            <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
              <motion.section variants={fadeUp} className="rounded-md border border-slate-200 border-l-[3px] border-l-teal-500 bg-white p-4 shadow-sm hover:shadow-md">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <MiniLabel>Schnellzugriff</MiniLabel>
                    <h2 className="mt-1 text-2xl text-slate-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
                      Unverrechnete Lieferscheine
                    </h2>
                  </div>
                  <StatusBadge open={true}>billId = null</StatusBadge>
                </div>

                <div className="mb-4 space-y-3">
                  <label className="block">
                    <MiniLabel>Schnellsuche</MiniLabel>
                    <div className="relative mt-2">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Artikel-Nr. / Lieferschein / Bezeichnung"
                        className="w-full rounded-md border border-slate-200 bg-[#fbfbf9] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      />
                    </div>
                  </label>

                  <ActionButton tone="secondary" onClick={() => setOnlyUnbilled((current) => !current)}>
                    <Filter size={15} /> {onlyUnbilled ? "Nur unverrechnete" : "Alle anzeigen"}
                  </ActionButton>
                </div>

                <div className="space-y-3">
                  {filteredSlips.map((slip) => {
                    const isActive = slip.id === activeSlipId;
                    const isSelected = selectedSlipIds.includes(slip.id);
                    const isOpen = !slip.billId;

                    return (
                      <button
                        key={slip.id}
                        onClick={() => {
                          setActiveSlipId(slip.id);
                          if (isOpen && !isSelected) setSelectedSlipIds((current) => [...current, slip.id]);
                        }}
                        className={`w-full rounded-md border border-l-[3px] p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
                          isActive
                            ? "border-teal-300 border-l-teal-500 bg-teal-50 shadow-md"
                            : "border-slate-200 border-l-slate-300 bg-white hover:shadow-md"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                              {slip.number}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">Lieferdatum {slip.deliveryDate}</div>
                          </div>
                          <StatusBadge open={isOpen}>{isOpen ? "Offen" : "Verrechnet"}</StatusBadge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>{slip.items} Positionen</span>
                          <span style={{ fontFamily: "DM Mono, monospace" }}>{money(slip.amount)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-xs text-slate-500">Klick öffnet Kundenansicht</span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                              isSelected ? "bg-[#134e4a] text-white" : "bg-slate-100 text-slate-500"
                            }`}
                            style={{ fontFamily: "DM Mono, monospace" }}
                          >
                            {isSelected ? "ausgewählt" : "nicht gewählt"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.section>

              <section className="space-y-6">
                <motion.div
                  key={activeSlip.id}
                  variants={fadeUp}
                  className="rounded-md border border-slate-200 border-l-[3px] border-l-slate-300 bg-white p-5 shadow-sm hover:shadow-md"
                >
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <MiniLabel>Kunden-Detailansicht</MiniLabel>
                      <h2 className="mt-1 text-3xl text-slate-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
                        {customer.name}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm text-slate-500">
                        Nach Klick auf einen Lieferschein sieht der Benutzer alle Lieferscheine und Rechnungen dieses Kunden in einem gemeinsamen Rechnungs-Kontext.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge open={true}>{activeSlip.number}</StatusBadge>
                      <StatusBadge open={!activeSlip.billId}>{activeSlip.billId ? `billId ${activeSlip.billId}` : "ohne billId"}</StatusBadge>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                    <div className="overflow-hidden rounded-md border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 bg-[#0f3d3a] px-5 py-4 text-white">
                        <div>
                          <MiniLabel>Dokument</MiniLabel>
                          <div className="text-3xl text-white" style={{ fontFamily: '"DM Serif Display", serif' }}>
                            Lieferschein
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg text-teal-300" style={{ fontFamily: "DM Mono, monospace" }}>
                            {activeSlip.number}
                          </div>
                          <div className="text-sm text-white/60">{activeSlip.date}</div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <MiniLabel>Kunde</MiniLabel>
                            <div className="mt-1 font-medium text-slate-900">{customer.name}</div>
                            <div className="text-sm text-slate-500">{customer.city}</div>
                          </div>
                          <div>
                            <MiniLabel>Lieferdatum</MiniLabel>
                            <div className="mt-1 text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                              {activeSlip.deliveryDate}
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-[#fbfbf9] text-left text-[11px] uppercase tracking-[0.1em] text-slate-400" style={{ fontFamily: "DM Mono, monospace" }}>
                              <tr>
                                <th className="px-4 py-3">Art.-Nr.</th>
                                <th className="px-4 py-3">Bezeichnung</th>
                                <th className="px-4 py-3 text-right">Menge</th>
                                <th className="px-4 py-3 text-right">Betrag</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t border-slate-100 hover:bg-teal-50/70">
                                <td className="px-4 py-3" style={{ fontFamily: "DM Mono, monospace" }}>ART-1002</td>
                                <td className="px-4 py-3">Montagesatz</td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>2</td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>{money(540)}</td>
                              </tr>
                              <tr className="border-t border-slate-100 hover:bg-teal-50/70">
                                <td className="px-4 py-3" style={{ fontFamily: "DM Mono, monospace" }}>ART-2033</td>
                                <td className="px-4 py-3">Schaltereinheit</td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>1</td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>{money(380.5)}</td>
                              </tr>
                              <tr className="border-t border-slate-100 hover:bg-teal-50/70">
                                <td className="px-4 py-3" style={{ fontFamily: "DM Mono, monospace" }}>ART-4510</td>
                                <td className="px-4 py-3">Kabelsatz</td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>1</td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>{money(activeSlip.amount - 920.5)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 bg-[#fbfbf9] px-5 py-4">
                        <div>
                          <MiniLabel>Rechnungsstatus</MiniLabel>
                          <div className="mt-1 text-sm text-slate-600">
                            {activeSlip.billId ? `Bereits mit billId ${activeSlip.billId} verrechnet` : "Noch offen und für Sammelrechnung auswählbar"}
                          </div>
                        </div>
                        <div className="text-2xl text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                          {money(activeSlip.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-200 border-l-[3px] border-l-amber-500 bg-[#fbfbf9] p-4 shadow-sm hover:shadow-md">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <MiniLabel>Auswahl</MiniLabel>
                          <div className="mt-1 text-xl text-slate-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
                            Rechnung aus mehreren Lieferscheinen
                          </div>
                        </div>
                        <FileSpreadsheet className="text-teal-600" size={18} />
                      </div>

                      <div className="space-y-2">
                        {selectableSlips.map((slip) => {
                          const checked = selectedSlipIds.includes(slip.id);
                          return (
                            <label
                              key={slip.id}
                              className={`flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 transition ${
                                checked ? "border-teal-300 bg-white shadow-sm" : "border-slate-200 bg-white/80 hover:shadow-sm"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleSelected(slip.id)}
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                                <div>
                                  <div className="text-sm font-medium text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                                    {slip.number}
                                  </div>
                                  <div className="text-xs text-slate-500">{slip.deliveryDate}</div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-700" style={{ fontFamily: "DM Mono, monospace" }}>
                                {money(slip.amount)}
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-4 rounded-md border border-teal-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                          <span>Aktuelle Auswahl</span>
                          <span>{selectedSlipIds.length} markiert</span>
                        </div>
                        <div className="mb-4 space-y-2 text-sm text-slate-600">
                          {selectedSlips.length ? (
                            selectedSlips.map((slip) => (
                              <div key={slip.id} className="flex items-center justify-between">
                                <span>{slip.number}</span>
                                <span style={{ fontFamily: "DM Mono, monospace" }}>{money(slip.amount)}</span>
                              </div>
                            ))
                          ) : (
                            <div>Keine Lieferscheine ausgewählt.</div>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-[11px] uppercase tracking-[0.1em] text-slate-400" style={{ fontFamily: "DM Mono, monospace" }}>
                            bill/generate
                          </span>
                          <span className="text-xl text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                            {money(selectedSlips.reduce((sum, slip) => sum + slip.amount, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid gap-6 2xl:grid-cols-2">
                  <motion.div variants={fadeUp} className="rounded-md border border-slate-200 border-l-[3px] border-l-teal-500 bg-white p-5 shadow-sm hover:shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <MiniLabel>Alle Lieferscheine</MiniLabel>
                        <h3 className="mt-1 text-2xl text-slate-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
                          Kundenhistorie
                        </h3>
                      </div>
                      <LayoutGrid className="text-slate-400" size={18} />
                    </div>
                    <div className="overflow-x-auto rounded-md border border-slate-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-[#fbfbf9] text-left text-[11px] uppercase tracking-[0.1em] text-slate-400" style={{ fontFamily: "DM Mono, monospace" }}>
                          <tr>
                            <th className="px-4 py-3">Auswahl</th>
                            <th className="px-4 py-3">Lieferschein</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Betrag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slips.map((slip) => {
                            const selectable = !slip.billId;
                            return (
                              <tr key={slip.id} className="border-t border-slate-100 hover:bg-teal-50/70">
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    disabled={!selectable}
                                    checked={selectedSlipIds.includes(slip.id)}
                                    onChange={() => toggleSelected(slip.id)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <button onClick={() => setActiveSlipId(slip.id)} className="font-medium text-slate-900 hover:text-teal-800">
                                    <span style={{ fontFamily: "DM Mono, monospace" }}>{slip.number}</span>
                                  </button>
                                  <div className="text-xs text-slate-500">{slip.date}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge open={!slip.billId}>{slip.billId ? `billId ${slip.billId}` : "Offen"}</StatusBadge>
                                </td>
                                <td className="px-4 py-3 text-right" style={{ fontFamily: "DM Mono, monospace" }}>
                                  {money(slip.amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="rounded-md border border-slate-200 border-l-[3px] border-l-amber-500 bg-white p-5 shadow-sm hover:shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <MiniLabel>Rechnungen</MiniLabel>
                        <h3 className="mt-1 text-2xl text-slate-900" style={{ fontFamily: '"DM Serif Display", serif' }}>
                          Bereits erzeugte Rechnungen
                        </h3>
                      </div>
                      <CreditCard className="text-slate-400" size={18} />
                    </div>
                    <div className="space-y-3">
                      {bills.map((bill) => (
                        <div key={bill.id} className="rounded-md border border-slate-200 border-l-[3px] border-l-amber-500 bg-[#fbfbf9] p-4 shadow-sm hover:shadow-md">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                                {bill.number}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">Erstellt am {bill.date}</div>
                            </div>
                            <StatusBadge open={true}>{bill.slipNumbers.length} Lieferscheine</StatusBadge>
                          </div>
                          <div className="mb-3 text-xs text-slate-500">Enthalten: {bill.slipNumbers.join(", ")}</div>
                          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="text-[11px] uppercase tracking-[0.1em] text-slate-400" style={{ fontFamily: "DM Mono, monospace" }}>
                              Gesamt
                            </span>
                            <span className="text-lg text-slate-900" style={{ fontFamily: "DM Mono, monospace" }}>
                              {money(bill.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </section>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
Du arbeitest im Repository `sim-system` auf Branch `first-init`.

Ziel:
Erweitere das Angular-20-Frontend so, dass die Kundenansicht und die Lieferschein-Ansicht den folgenden Rechnungs-Workflow unterstützen:

1. In der Lieferschein-Liste müssen unverrechnete Lieferscheine klar auffindbar sein.
2. Unverrechnet bedeutet: der Lieferschein hat noch keinen Rechnungsbezug, also keine `billId`.
3. Beim Klick auf einen Lieferschein soll in die Kunden-Detailansicht navigiert werden.
4. In dieser Kunden-Detailansicht müssen alle Lieferscheine und alle Rechnungen dieses Kunden gemeinsam angezeigt werden.
5. In dieser Ansicht sollen mehrere unverrechnete Lieferscheine auswählbar sein.
6. Aus der Auswahl soll eine Rechnung erzeugt werden über `POST /bills/generate`.

Technischer Kontext:
- Frontend: Angular 20 mit Standalone Components, `provideRouter`, `bootstrapApplication`
- Bestehende Route: `/admin/customer/detail/:id`
- Relevante Services: `CustomerService`, `BillService`, evtl. `ShoppingcartService`
- Verfügbare API-Endpunkte:
  - `GET /customers/:id`
  - `GET /customers/:id/slipsheets`
  - `GET /customers/:id/bills`
  - `GET /slipsheets`
  - `GET /slipsheets/:id`
  - `POST /bills/generate`
- Bereits vorhanden:
  - `CustomerDetailComponent`
  - Checkbox-Selektion `selectedSlipIds`
  - `makeBill(selectedSlipIds)` ruft bereits `billService.generate(ids)` auf
- Bekannter Backend-Bug:
  - `GET /slipsheets/:id` kann aktuell `undefined` zurückgeben. Verwende diesen Endpoint defensiv oder lade die Detaildaten bevorzugt über den Kundenkontext, falls das stabiler ist.

Fachliche Anforderungen:
- In der Lieferschein-Liste soll ein sichtbarer Filter „nur unverrechnete“ vorhanden sein.
- Ein Lieferschein gilt als offen, wenn `billId` leer, `null` oder `undefined` ist.
- Offene Lieferscheine visuell hervorheben.
- Klick auf einen Lieferschein:
  - ermittelt den zugehörigen Kunden
  - navigiert in `/admin/customer/detail/:id`
  - markiert idealerweise den angeklickten offenen Lieferschein bereits vor
- In der Kunden-Detailansicht:
  - Bereich „Kunde“
  - Bereich „Lieferscheine“
  - Bereich „Rechnungen“
  - offene Lieferscheine per Checkbox auswählbar
  - bereits verrechnete Lieferscheine nicht auswählbar
  - CTA „Rechnung erstellen“ / „Rechnung aus Auswahl erzeugen“
- Nach erfolgreichem `POST /bills/generate`:
  - Success-Toast anzeigen
  - Auswahl zurücksetzen
  - Kunden-Lieferscheine und Rechnungen neu laden
  - neue Rechnung sofort sichtbar machen
  - vormals offene Lieferscheine dürfen nicht mehr auswählbar sein
- Bei Fehler:
  - Error-Toast anzeigen
  - keine bestehende UI-Auswahl stillschweigend verlieren

Verbindliche UI-/Designregeln:
Nutze strikt das aktuelle Design-System und setze die Seite im `abler.tirol` Stil um.

Schriften:
- Headlines / Dokumenttitel: `DM Serif Display`
- Fließtext / UI: `Inter`
- Technische Werte, Nummern, Mengen, Beträge, Labels, Tabellenheader: `DM Mono`

Navigation / Sidebar:
- Hintergrund: `--accent-secondary` / `#0f3d3a`
- Aktiver Eintrag: `background: rgba(20,184,166,0.15)`, Textfarbe `--accent-highlight`
- Sektionslabels: `DM Mono`, uppercase, `rgba(255,255,255,0.2)`
- Sidebar-Items: `border-radius: 4px`

Tabellen:
- Immer responsive mit `overflow-x: auto`
- Keine Spalten verstecken
- Header: `DM Mono`, uppercase, `letter-spacing: 0.1em`, `--ink-3`
- Zeilenhover: `background: var(--accent-light)`
- Artikelnummern, Mengen, Beträge immer `DM Mono`
- Tabellen-Wrapper: `border-radius: 6px`

Cards:
- `border-radius: 6px`
- Hover nur über Shadow, kein `translateY`
- Kontextsignal über `border-left: 3px solid`
- Kein dekorativer Gradient-Top
- Kontextfarben über Teal / Amber / Rot je nach Bedeutung

Buttons:
- Immer Pill-Form (`border-radius: 999px`)
- Kompaktes Padding: `0.55rem 1.25rem`
- Hover nur Farbwechsel, kein `translateY`
- Focus: Teal-Focus-Ring / Shadow, `outline: none`

Status-Badges:
- `DM Mono`, ca. `0.7rem`
- Dot-Indikator vor dem Label
- Für diesen Flow sinnvolle Statuswerte wie:
  - „Offen“
  - „Verrechnet“
  - optional technische Anzeige wie `billId 1234`

Formulare:
- Inputs/Selects mit `border-radius: 6px`
- Labels in `DM Mono`, uppercase, `letter-spacing: 0.1em`
- Nummern-/Mengenfelder in Mono
- Schnellsuche prominent platzieren

Animationen:
- Kein Hover-Lift
- Page Load mit `fadeUp`, `0.4s ease`
- Stagger `0.07s`
- Focus über Teal-Ring

Dokument-Layout (Lieferschein / Rechnung):
- Header mit `--accent-secondary` Hintergrund
- Dokumenttyp in `DM Serif Display`
- Dokumentnummer in `DM Mono` und `--accent-highlight`
- Positionen als echte Tabelle nach Standard-Tabellenregeln
- Footer mit Gesamtbetrag rechtsbündig in `DM Mono`

Wichtige UX-Entscheidung:
Die Seite soll dokumentenorientiert, klar und administrativ wirken — nicht marketinghaft, nicht verspielt, nicht „cardy“ im alten Sinne. Die Dokumenttabelle und die Auswahl-/Rechnungslogik stehen im Vordergrund.

Implementierungsaufgaben:
1. Analysiere die bestehenden Komponenten:
   - `apps/sims/src/app/views/admin/customer-detail/customer-detail.component.*`
   - die Lieferschein-/Kundenlistenansichten
   - relevante Services für Kunden, Lieferscheine und Bills
2. Ergänze die Lieferschein-Liste um:
   - Filter „nur unverrechnete“
   - Status-Badge für offen/verrechnet
   - Klick-Navigation in die Kunden-Detailansicht
3. Erweitere `CustomerDetailComponent` so, dass:
   - alle Lieferscheine des Kunden geladen werden
   - alle Rechnungen des Kunden geladen werden
   - offene Lieferscheine selektierbar sind
   - `makeBill(selectedSlipIds)` sauber an die UI angebunden ist
   - Loading-, Empty- und Error-States sauber dargestellt werden
4. Stelle sicher, dass `billService.generate(...)` das Backend korrekt mit den ausgewählten Lieferschein-IDs anspricht.
5. Ergänze nach Erstellung einer Rechnung das Refresh-Verhalten.
6. Räume das Template visuell entsprechend der neuen Regeln auf:
   - klare Header-Zone
   - kompakte Info-/Kontext-Cards
   - tabellarische Lieferschein- und Rechnungsbereiche
   - Dokumentansicht für den aktiven Lieferschein
   - prominenter Action-Bereich für „Rechnung erzeugen“

Erwartetes Ergebnis:
- Vollständiger Code, kein Pseudocode
- Anpassung der betroffenen Angular-Komponenten, Services und Templates
- Bestehende Patterns des Projekts beibehalten
- Keine unnötige neue Architektur einführen
- Saubere TypeScript-Typen
- Keine Breaking Changes außerhalb des betroffenen Flows

Liefere am Ende:
1. eine kurze Zusammenfassung der geänderten Dateien
2. die umgesetzte Benutzerführung
3. offene Risiken oder Backend-Abhängigkeiten



Offene Risiken / Backend-Abhängigkeiten
Risiko	Details
billId im Response	Backend muss billId in GET /customers/:id/slipsheets mitsenden. TypeORM gibt FK-Spalten standardmäßig mit — falls nicht, @Column() in der Entity prüfen.
GET /slipsheets/:id Bug	Bewusst nicht verwendet. Alle Daten kommen über den Kunden-Kontext (/customers/:id/slipsheets).
POST /bills/generate Body	BillService.generate() sendet slipsheetIds als Array number[] direkt als Body — Backend muss das so erwarten.
Race Condition Nummernvergabe	Bekannter P1-Bug aus CLAUDE.md — kein DB-Lock auf SELECT MAX(number)+1. Kein Frontend-Fix möglich.
generateBill() löscht bei Fehler	Bekannter P0-Bug aus CLAUDE.md — der Error-Toast verhindert Silent-Loss der Auswahl, aber der Datenverlust im Backend bleibt ein Risiko.
