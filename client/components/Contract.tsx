"use client";

import { useState, useCallback, useEffect } from "react";
import {
  registerVehicle,
  addHistory,
  getVehicle,
  getAllVins,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function CrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  ...props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange">) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-[11px] bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-white/90 outline-none cursor-pointer appearance-none"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  color,
}: {
  name: string;
  params: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
    </div>
  );
}

// ── Record Type Config ────────────────────────────────────────

const RECORD_TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; icon: React.ReactNode; variant: "success" | "warning" | "info" | "error" | "default" }> = {
  service: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", icon: <WrenchIcon />, variant: "info" },
  accident: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", icon: <CrashIcon />, variant: "error" },
  ownership: { color: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10", border: "border-[#a78bfa]/20", dot: "bg-[#a78bfa]", icon: <UserIcon />, variant: "default" },
  inspection: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", icon: <ClipboardIcon />, variant: "success" },
  recall: { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", dot: "bg-[#fbbf24]", icon: <AlertIcon />, variant: "warning" },
};

// ── Main Component ───────────────────────────────────────────

type Tab = "search" | "register" | "add-history";

interface VehicleData {
  vin: string;
  owner: string;
  make: string;
  model: string;
  year: number;
  history: Array<{ record: string; record_type: string }>;
}

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Register Vehicle State
  const [regVin, setRegVin] = useState("");
  const [regOwner, setRegOwner] = useState("");
  const [regMake, setRegMake] = useState("");
  const [regModel, setRegModel] = useState("");
  const [regYear, setRegYear] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Add History State
  const [historyVin, setHistoryVin] = useState("");
  const [historyRecord, setHistoryRecord] = useState("");
  const [historyType, setHistoryType] = useState("service");
  const [isAddingHistory, setIsAddingHistory] = useState(false);

  // Search State
  const [searchVin, setSearchVin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  // All VINs State
  const [allVins, setAllVins] = useState<string[]>([]);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Load all VINs on mount
  useEffect(() => {
    const loadVins = async () => {
      try {
        const result = await getAllVins();
        if (result && Array.isArray(result)) {
          setAllVins(result);
        }
      } catch {
        // Silently fail
      }
    };
    loadVins();
  }, []);

  const handleRegister = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!regVin.trim() || !regOwner.trim() || !regMake.trim() || !regModel.trim() || !regYear.trim()) {
      return setError("Fill in all fields");
    }
    const year = parseInt(regYear, 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return setError("Enter a valid year (1900-2100)");
    }
    setError(null);
    setIsRegistering(true);
    setTxStatus("Awaiting signature...");
    try {
      await registerVehicle(walletAddress, regVin.trim(), regOwner.trim(), regMake.trim(), regModel.trim(), year);
      setTxStatus("Vehicle registered on-chain!");
      setRegVin("");
      setRegOwner("");
      setRegMake("");
      setRegModel("");
      setRegYear("");
      // Refresh VIN list
      const result = await getAllVins();
      if (result && Array.isArray(result)) {
        setAllVins(result);
      }
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRegistering(false);
    }
  }, [walletAddress, regVin, regOwner, regMake, regModel, regYear]);

  const handleAddHistory = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!historyVin.trim() || !historyRecord.trim()) {
      return setError("Enter VIN and record details");
    }
    setError(null);
    setIsAddingHistory(true);
    setTxStatus("Awaiting signature...");
    try {
      await addHistory(walletAddress, historyVin.trim(), historyRecord.trim(), historyType);
      setTxStatus("History record added on-chain!");
      setHistoryVin("");
      setHistoryRecord("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsAddingHistory(false);
    }
  }, [walletAddress, historyVin, historyRecord, historyType]);

  const handleSearch = useCallback(async () => {
    if (!searchVin.trim()) return setError("Enter a VIN");
    setError(null);
    setIsSearching(true);
    setVehicleData(null);
    try {
      const result = await getVehicle(searchVin.trim(), walletAddress || undefined);
      if (result && typeof result === "object") {
        setVehicleData(result as VehicleData);
      } else {
        setError("Vehicle not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsSearching(false);
    }
  }, [searchVin, walletAddress]);

  const handleSelectVin = (vin: string) => {
    setSearchVin(vin);
    setActiveTab("search");
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "search", label: "Search", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "register", label: "Register", icon: <CarIcon />, color: "#7c6cf0" },
    { key: "add-history", label: "Add Record", icon: <HistoryIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <CarIcon />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Vehicle History Tracker</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setVehicleData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Search */}
            {activeTab === "search" && (
              <div className="space-y-5">
                <MethodSignature name="get_vehicle" params="(vin: String)" color="#4fc3f7" />

                {/* All VINs */}
                {allVins.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">Registered Vehicles</label>
                    <div className="flex flex-wrap gap-2">
                      {allVins.map((vin) => (
                        <button
                          key={vin}
                          onClick={() => handleSelectVin(vin)}
                          className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-white/50 hover:text-white/80 hover:border-white/[0.1] transition-all"
                        >
                          {vin.slice(0, 8)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Input label="VIN" value={searchVin} onChange={(e) => setSearchVin(e.target.value)} placeholder="e.g. 1HGBH41JXMN109186" />
                <ShimmerButton onClick={handleSearch} disabled={isSearching} shimmerColor="#4fc3f7" className="w-full">
                  {isSearching ? <><SpinnerIcon /> Searching...</> : <><SearchIcon /> Search Vehicle</>}
                </ShimmerButton>

                {vehicleData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    {/* Vehicle Details */}
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Vehicle Details</span>
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                        Found
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-white/25 uppercase">VIN</span>
                          <p className="font-mono text-sm text-white/80 mt-1">{vehicleData.vin}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/25 uppercase">Year</span>
                          <p className="font-mono text-sm text-white/80 mt-1">{vehicleData.year}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/25 uppercase">Make</span>
                          <p className="font-mono text-sm text-white/80 mt-1">{vehicleData.make}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/25 uppercase">Model</span>
                          <p className="font-mono text-sm text-white/80 mt-1">{vehicleData.model}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/25 uppercase">Owner</span>
                        <p className="font-mono text-sm text-white/80 mt-1">{vehicleData.owner}</p>
                      </div>
                    </div>

                    {/* History Records */}
                    {vehicleData.history && vehicleData.history.length > 0 && (
                      <>
                        <div className="border-b border-white/[0.06] px-4 py-3">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">History Records ({vehicleData.history.length})</span>
                        </div>
                        <div className="p-4 space-y-2">
                          {vehicleData.history.map((record, index) => {
                            const cfg = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.service;
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-start gap-3 rounded-lg border px-3 py-2",
                                  cfg.bg,
                                  cfg.border
                                )}
                              >
                                <span className={cfg.color}>{cfg.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={cfg.variant} className="text-[9px]">{record.record_type}</Badge>
                                  </div>
                                  <p className="text-sm text-white/70 mt-1">{record.record}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {(!vehicleData.history || vehicleData.history.length === 0) && (
                      <div className="p-4 text-center text-white/25 text-xs">
                        No history records yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Register */}
            {activeTab === "register" && (
              <div className="space-y-5">
                <MethodSignature name="register_vehicle" params="(vin, owner, make, model, year)" color="#7c6cf0" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input label="VIN" value={regVin} onChange={(e) => setRegVin(e.target.value)} placeholder="17-character VIN" />
                  </div>
                  <Input label="Owner" value={regOwner} onChange={(e) => setRegOwner(e.target.value)} placeholder="Current owner" />
                  <Input label="Year" value={regYear} onChange={(e) => setRegYear(e.target.value)} placeholder="e.g. 2024" type="number" />
                  <Input label="Make" value={regMake} onChange={(e) => setRegMake(e.target.value)} placeholder="e.g. Toyota" />
                  <Input label="Model" value={regModel} onChange={(e) => setRegModel(e.target.value)} placeholder="e.g. Camry" />
                </div>
                {walletAddress ? (
                  <ShimmerButton onClick={handleRegister} disabled={isRegistering} shimmerColor="#7c6cf0" className="w-full">
                    {isRegistering ? <><SpinnerIcon /> Registering...</> : <><CarIcon /> Register Vehicle</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to register vehicles
                  </button>
                )}
              </div>
            )}

            {/* Add History */}
            {activeTab === "add-history" && (
              <div className="space-y-5">
                <MethodSignature name="add_history" params="(vin, record, type)" color="#fbbf24" />
                <Input label="VIN" value={historyVin} onChange={(e) => setHistoryVin(e.target.value)} placeholder="Vehicle VIN" />
                <Select
                  label="Record Type"
                  value={historyType}
                  onChange={setHistoryType}
                  options={[
                    { value: "service", label: "Service" },
                    { value: "accident", label: "Accident" },
                    { value: "ownership", label: "Ownership Change" },
                    { value: "inspection", label: "Inspection" },
                    { value: "recall", label: "Recall" },
                  ]}
                />
                <Input label="Record Details" value={historyRecord} onChange={(e) => setHistoryRecord(e.target.value)} placeholder="Describe the event..." />
                {walletAddress ? (
                  <ShimmerButton onClick={handleAddHistory} disabled={isAddingHistory} shimmerColor="#fbbf24" className="w-full">
                    {isAddingHistory ? <><SpinnerIcon /> Adding...</> : <><HistoryIcon /> Add History Record</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to add history
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Vehicle History Tracker &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["service", "accident", "ownership", "inspection", "recall"].map((type, i) => {
                const cfg = RECORD_TYPE_CONFIG[type];
                return (
                  <span key={type} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full" style={{ backgroundColor: cfg.dot.replace("bg-", "") }} />
                    <span className="font-mono text-[9px] text-white/15 capitalize">{type}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
