import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Car,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  QrCode,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Scan,
  AlertTriangle,
  Activity,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { repository } from '@/data/repository';
import { useAppStore } from '@/store/appStore';
import { ParkingLot, EVStation, EVConnectorType, ParkingReservation } from '@/types/models';
import { verifyQREntryPass } from '@/lib/qrSecurity';
import confetti from 'canvas-confetti';

export const ParkAndChargePage: React.FC = () => {
  const { t, showToast } = useAppStore();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(repository.getParkingLots());
  const [evStations, setEvStations] = useState<EVStation[]>(repository.getEVStations());
  const [reservations, setReservations] = useState<ParkingReservation[]>(repository.getReservations());

  // Selected Lot for booking
  const [selectedLot, setSelectedLot] = useState<ParkingLot>(parkingLots[0]);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<string>('A-01');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [bundleEV, setBundleEV] = useState<boolean>(true);
  const [connectorType, setConnectorType] = useState<EVConnectorType>('CCS2');

  // Modal State for Pass & Scanner Simulation
  const [activePass, setActivePass] = useState<ParkingReservation | null>(reservations[0] || null);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ isValid: boolean; reason?: string; payload?: any } | null>(null);

  // Filter tabs & Search
  const [activeTab, setActiveTab] = useState<'parking' | 'ev' | 'my_passes'>('parking');
  const [filterConnector, setFilterConnector] = useState<string>('all');
  const [filterHealth, setFilterHealth] = useState<'all' | 'working' | 'faulty' | 'busy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Station Status Metrics
  const totalStations = evStations.length;
  const totalGuns = evStations.reduce((acc, st) => acc + st.connectors.length, 0);
  const availableGuns = evStations.reduce(
    (acc, st) => acc + st.connectors.filter((c) => c.status === 'available').length,
    0
  );
  const chargingGuns = evStations.reduce(
    (acc, st) => acc + st.connectors.filter((c) => c.status === 'charging').length,
    0
  );
  const faultyGuns = evStations.reduce(
    (acc, st) => acc + st.connectors.filter((c) => c.status === 'offline').length,
    0
  );

  const handleCreateBooking = () => {
    const newBooking = repository.createReservation({
      lotId: selectedLot.id,
      lotName: selectedLot.name,
      slotNumber: selectedSlotNumber,
      durationHours,
      evStationId: bundleEV ? selectedLot.evStationId : undefined,
      connectorType: bundleEV ? connectorType : undefined,
      pricePerHour: selectedLot.pricePerHour,
    });

    setReservations(repository.getReservations());
    setActivePass(newBooking);
    setShowQRModal(true);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    showToast('Reservation Secured', `Slot ${newBooking.slotNumber} reserved with QR pass!`, 'success');
  };

  const handleSimulateScan = (qrToken: string) => {
    const verified = verifyQREntryPass(qrToken);
    setScanResult(verified);
    setShowScannerModal(true);
  };

  const handleCancelBooking = (id: string) => {
    repository.cancelReservation(id);
    setReservations(repository.getReservations());
    if (activePass?.id === id) {
      setActivePass(null);
    }
    showToast('Booking Cancelled', 'Slot restored to public availability.', 'info');
  };

  const handleToggleConnectorFault = (stationId: string, connectorId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'offline' ? 'available' : 'offline';
    repository.updateEVConnectorStatus(stationId, connectorId, nextStatus);
    setEvStations(repository.getEVStations());
    showToast(
      nextStatus === 'offline' ? 'Charger Fault Reported' : 'Charger Restored',
      `Connector ${connectorId.toUpperCase()} marked as ${nextStatus === 'offline' ? 'FAULTY / OFFLINE' : 'OPERATIONAL'}`,
      nextStatus === 'offline' ? 'warning' : 'success'
    );
  };

  // Filter EV Stations
  const filteredStations = evStations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.operator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConnector =
      filterConnector === 'all' || st.connectors.some((c) => c.type === filterConnector);

    const hasFaulty = st.connectors.some((c) => c.status === 'offline');
    const hasAvailable = st.connectors.some((c) => c.status === 'available');
    const isAllBusy = st.connectors.every((c) => c.status === 'charging');

    let matchesHealth = true;
    if (filterHealth === 'faulty') matchesHealth = hasFaulty;
    if (filterHealth === 'working') matchesHealth = hasAvailable && !hasFaulty;
    if (filterHealth === 'busy') matchesHealth = isAllBusy;

    return matchesSearch && matchesConnector && matchesHealth;
  });

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Website Hero Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/50">
              <Car className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('parkAndChargeTitle')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Live municipal parking bay availability, real-time EV station health monitoring, and tamper-proof QR entry pass issuance for Coimbatore.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-600 self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('parking')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'parking' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <span>🅿️ Parking Decks</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px]">{parkingLots.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('ev')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'ev' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <span>⚡ EV Network Health</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px]">{evStations.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('my_passes')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'my_passes' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <span>🎫 Active Passes</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[10px]">
              {reservations.filter((r) => r.status === 'active').length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PARKING LOTS & RESERVATION MATRIX */}
      {activeTab === 'parking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Lots List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Smart Parking Decks in Coimbatore ({parkingLots.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">Click any deck to reserve slot</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {parkingLots.map((lot) => {
                const isSelected = selectedLot.id === lot.id;
                const percentFull = Math.round(((lot.totalSlots - lot.availableSlots) / lot.totalSlots) * 100);

                return (
                  <div
                    key={lot.id}
                    onClick={() => {
                      setSelectedLot(lot);
                      if (lot.slots.length > 0) setSelectedSlotNumber(lot.slots[0].slotNumber);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{lot.name}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            <span>{lot.address}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-blue-700">₹{lot.pricePerHour}</span>
                          <span className="text-[10px] text-slate-400">/hr</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2.5">
                        {lot.hasEVCharging && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> EV Rapid
                          </span>
                        )}
                        {lot.isCovered ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Covered
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            Open Yard
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">
                          {lot.availableSlots} spots available
                        </span>
                        <span
                          className={`font-bold text-[11px] ${
                            lot.availableSlots < 5 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {lot.availableSlots < 5 ? 'Almost Full' : `${percentFull}% Occupied`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            lot.availableSlots < 5 ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Reservation Configuration Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5 sticky top-24">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Direct Booking Desk
              </span>
              <h3 className="font-black text-xl text-slate-900 mt-2 leading-tight">{selectedLot.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedLot.address}</p>
            </div>

            {/* Visual Slot Grid */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">{t('selectFloorSlot')}</label>
              <div className="grid grid-cols-4 gap-2">
                {selectedLot.slots.map((s) => {
                  const isChosen = selectedSlotNumber === s.slotNumber;
                  return (
                    <button
                      key={s.slotNumber}
                      disabled={s.isOccupied}
                      onClick={() => setSelectedSlotNumber(s.slotNumber)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        s.isOccupied
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                          : isChosen
                          ? 'border-blue-600 bg-blue-600 text-white font-black shadow-xs'
                          : 'border-slate-200 bg-white hover:border-blue-400 text-slate-800 font-bold'
                      }`}
                    >
                      <div className="text-xs">{s.slotNumber}</div>
                      <div className="text-[9px] uppercase tracking-tighter opacity-80">{s.type}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EV Bundle Option */}
            {selectedLot.hasEVCharging && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bundleEV}
                    onChange={(e) => setBundleEV(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    {t('addEvCharging')} (+₹80 Fixed Rate)
                  </span>
                </label>

                {bundleEV && (
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-emerald-200/60">
                    <span className="text-slate-600 font-semibold">{t('evConnectorType')}:</span>
                    <select
                      value={connectorType}
                      onChange={(e) => setConnectorType(e.target.value as EVConnectorType)}
                      className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="CCS2">CCS2 (Up to 120kW Rapid)</option>
                      <option value="Type2">Type2 AC (22kW)</option>
                      <option value="CHAdeMO">CHAdeMO (50kW)</option>
                      <option value="3-pin">3-Pin Slow (3.3kW)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Duration Selector */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Parking Duration</span>
                <span className="text-blue-700">{durationHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Cost & CO2 summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Payable</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{durationHours * selectedLot.pricePerHour + (bundleEV ? 80 : 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full inline-block">
                  🌱 ~{bundleEV ? '12.5' : '3.8'} kg CO₂ Avoided
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">+30 Green Impact Pts</span>
              </div>
            </div>

            {/* Reserve CTA */}
            <button
              onClick={handleCreateBooking}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <QrCode className="w-5 h-5" />
              <span>{t('reserveSlotCta')}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: EV STATIONS DIRECTORY & HEALTH MONITOR */}
      {activeTab === 'ev' && (
        <div className="space-y-6">
          {/* EV Operational Health KPI Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Total EV Guns</span>
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalGuns}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Across {totalStations} smart stations</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
                <span>Working / Available</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{availableGuns}</div>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Ready for immediate plug-in</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
              <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
                <span>Actively Charging</span>
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">{chargingGuns}</div>
              <p className="text-[11px] text-blue-600 mt-0.5 font-medium">Vehicles currently drawing load</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs">
              <div className="flex items-center justify-between text-red-700 text-xs font-bold uppercase">
                <span>Faulty / Out of Order</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">{faultyGuns}</div>
              <p className="text-[11px] text-red-600 mt-0.5 font-medium">Maintenance ticket auto-logged</p>
            </div>
          </div>

          {/* Search & Health Status Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search station by name, operator (Kazam, Zeon, Tata Power)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] uppercase font-bold mr-1">Status Filter:</span>
              <button
                onClick={() => setFilterHealth('all')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterHealth === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilterHealth('working')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  filterHealth === 'working'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Working ({availableGuns})
              </button>
              <button
                onClick={() => setFilterHealth('faulty')}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  filterHealth === 'faulty'
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Faulty / Offline ({faultyGuns})
              </button>
              <button
                onClick={() => setFilterHealth('busy')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterHealth === 'busy'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                Charging ({chargingGuns})
              </button>
            </div>
          </div>

          {/* EV Stations Grid (Full Website Width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStations.map((st) => {
              const hasFaultyGun = st.connectors.some((c) => c.status === 'offline');
              const allAvailable = st.connectors.every((c) => c.status === 'available');

              return (
                <div
                  key={st.id}
                  className={`bg-white rounded-3xl border shadow-xs transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                    hasFaultyGun ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-slate-900 leading-snug">{st.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{st.address}</span>
                        </p>
                      </div>

                      {/* Station Overall Health Badge */}
                      <div className="shrink-0 text-right">
                        {hasFaultyGun ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            PARTIAL FAULT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            100% OPERATIONAL
                          </span>
                        )}
                        <div className="text-[11px] font-bold text-amber-600 mt-1">★ {st.rating}</div>
                      </div>
                    </div>

                    {/* Interactive Guns / Connectors Health Ledger */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                        <span>Dispenser Guns & Real-Time Status</span>
                        <span>Click gun to toggle fault</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {st.connectors.map((c) => {
                          const isAvailable = c.status === 'available';
                          const isCharging = c.status === 'charging';
                          const isFaulty = c.status === 'offline';

                          return (
                            <button
                              key={c.id}
                              onClick={() => handleToggleConnectorFault(st.id, c.id, c.status)}
                              title="Click to toggle Fault / Operational state"
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all group ${
                                isAvailable
                                  ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/70 text-emerald-950'
                                  : isCharging
                                  ? 'bg-blue-50/60 border-blue-200 hover:bg-blue-100/70 text-blue-950'
                                  : 'bg-red-50/70 border-red-300 hover:bg-red-100 text-red-950 ring-1 ring-red-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    isAvailable
                                      ? 'bg-emerald-200/80 text-emerald-900'
                                      : isCharging
                                      ? 'bg-blue-200/80 text-blue-900'
                                      : 'bg-red-200 text-red-900'
                                  }`}
                                >
                                  <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-extrabold text-xs flex items-center gap-1.5">
                                    <span>{c.type}</span>
                                    <span className="text-[10px] font-mono opacity-80">({c.powerKw} kW)</span>
                                  </div>
                                  <div className="text-[10px] opacity-75">
                                    Rate: ₹{c.pricePerKwh}/kWh • Gun ID: {c.id}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    isAvailable
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : isCharging
                                      ? 'bg-blue-200 text-blue-900'
                                      : 'bg-red-200 text-red-900 animate-pulse'
                                  }`}
                                >
                                  {isFaulty ? 'FAULT / DOWN' : isCharging ? 'CHARGING' : 'AVAILABLE'}
                                </span>
                                <span className="block text-[9px] text-slate-400 group-hover:text-slate-700 mt-0.5">
                                  Toggle state ↻
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">
                      Est. Wait: <strong className="text-slate-800">~{st.estimatedWaitMins} mins</strong>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Operator: {st.operator}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVE PASSES & SIMULATED ENTRY SCANNER */}
      {activeTab === 'my_passes' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Issued Digital Parking Passes ({reservations.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Tamper-proof signed with offline djb2 token</span>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-bold text-slate-800">No active parking reservations found.</p>
              <p className="text-xs text-slate-500 mt-1">Reserve a parking slot or EV charger bundle to generate an entry QR.</p>
              <button
                onClick={() => setActiveTab('parking')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
              >
                Browse Parking Decks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {res.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          res.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 leading-snug">{res.lotName}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                      <span>
                        Space: <strong className="text-slate-900 text-sm">{res.slotNumber}</strong>
                      </span>
                      {res.connectorType && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> {res.connectorType} Rapid
                        </span>
                      )}
                      <span>Time: {res.durationHours}h</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActivePass(res);
                          setShowQRModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR</span>
                      </button>

                      <button
                        onClick={() => handleSimulateScan(res.qrToken)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Scan className="w-3.5 h-3.5 text-slate-500" />
                        <span>Simulate Barrier</span>
                      </button>
                    </div>

                    {res.status === 'active' && (
                      <button
                        onClick={() => handleCancelBooking(res.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR PASS MODAL */}
      {showQRModal && activePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4 relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xs font-bold"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Official Digital Entry Pass
              </span>
              <h3 className="font-black text-lg text-slate-900 mt-2">{activePass.lotName}</h3>
              <p className="text-xs text-slate-500">Reserved Space #{activePass.slotNumber}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner">
              <QRCodeSVG value={activePass.qrToken} size={180} level="M" />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-mono font-bold">{activePass.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valid For:</span>
                <span className="font-semibold">{activePass.durationHours} Hours</span>
              </div>
              {activePass.connectorType && (
                <div className="flex justify-between text-emerald-700">
                  <span>EV Charger:</span>
                  <span className="font-bold">{activePass.connectorType} Standard</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowQRModal(false);
                handleSimulateScan(activePass.qrToken);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Scan className="w-4 h-4 text-emerald-400" />
              <span>Simulate Guard Gate Scanner</span>
            </button>
          </div>
        </div>
      )}

      {/* SCANNER SIMULATION MODAL */}
      {showScannerModal && scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            {scanResult.isValid ? (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-black text-lg text-emerald-950">BARRIER GATE OPENED</h3>
                <p className="text-xs text-slate-600">
                  Pass signature verified against municipal barrier cryptographic key.
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border text-xs text-left font-mono space-y-1">
                  <div>Slot: {scanResult.payload?.slotNumber}</div>
                  <div>Booking: {scanResult.payload?.bookingId}</div>
                  <div>Lot: {scanResult.payload?.lotId}</div>
                  <div className="text-emerald-700 font-bold">Signature Hash: Verified OK</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="font-black text-lg text-red-950">ACCESS DENIED</h3>
                <p className="text-xs text-red-600 font-semibold">{scanResult.reason}</p>
              </div>
            )}

            <button
              onClick={() => setShowScannerModal(false)}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close Simulator
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
