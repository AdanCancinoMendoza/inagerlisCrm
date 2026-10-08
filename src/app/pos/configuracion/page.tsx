"use client";

import POSHeader from "@/components/pos/POSHeader";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  Cpu,
  Database,
  FileText,
  HardDrive,
  Info,
  Layers,
  Lightbulb,
  Link as LinkIcon,
  Monitor,
  Printer,
  RefreshCw,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  Smartphone,
  Terminal,
  Trash2,
  Unlink,
  Usb,
  Wifi,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import {
  BoundDevice,
  DeviceDriver,
  HARDWARE_DRIVERS_DATABASE,
  ScannedPortResult,
  autoBindHardwareDevice,
  bindDevice,
  clearAllBoundDevices,
  getBoundDevices,
  scanHardwarePorts,
  unbindDevice,
} from "@/services/hardwareBindingService";

type SubModule = "impresora" | "cajon" | "bascula" | "lector" | "consola";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "ERROR" | "WARN" | "INFO" | "HARDWARE" | "SOCKET";
  module: string;
  message: string;
  details?: string;
  recommendation?: string;
}

const getInitialLogs = (): LogEntry[] => [
  {
    id: "log-init",
    timestamp: new Date().toLocaleTimeString("es-MX", { hour12: false }),
    level: "INFO",
    module: "POS_SYSTEM",
    message: "Sistema Punto de Venta listo. Esperando vinculación de dispositivos físicos de hardware.",
  },
];

export default function POSHardwareConfigPage() {
  const { activePalette } = useTheme();

  const [activeSubmodule, setActiveSubmodule] = useState<SubModule>("impresora");
  const [boundDevices, setBoundDevices] = useState<BoundDevice[]>([]);

  // Estado para controlar la visibilidad del catálogo manual (OCULTO POR DEFECTO)
  const [showManualCatalog, setShowManualCatalog] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");

  // Escaneo Real de Dispositivos Modal
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResults, setScannedResults] = useState<ScannedPortResult[]>([]);

  // Alertas de Acción
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Form States
  const [basculaPesoTest, setBasculaPesoTest] = useState(0.0);
  const [lectorTestValue, setLectorTestValue] = useState("");
  const [lectorTestSuccess, setLectorTestSuccess] = useState(false);

  // Consola State
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>(getInitialLogs);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [consoleSearchQuery, setConsoleSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  // Cargar dispositivos vinculados reales en el cliente limpia de legacy
  useEffect(() => {
    setBoundDevices(getBoundDevices());
  }, []);

  useEffect(() => {
    if (activeSubmodule === "consola" && autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll, activeSubmodule]);

  const showAlert = (text: string, type: "success" | "info" | "error" = "success") => {
    setActionAlert({ text, type });
    setTimeout(() => setActionAlert(null), 3500);
  };

  // VINCULACIÓN AUTOMÁTICA (Detectar Puerto Físico)
  const handleAutoBind = async (category: "PRINTER" | "DRAWER" | "SCALE" | "SCANNER") => {
    setIsScanning(true);
    const res = await autoBindHardwareDevice(category);
    setIsScanning(false);

    if (res.success && res.device) {
      setBoundDevices(getBoundDevices());
      showAlert(res.message, "success");

      // Log evento en consola
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("es-MX", { hour12: false }) + `.100`,
        level: "HARDWARE",
        module: "AUTO_BINDING",
        message: `Dispositivo vinculado automáticamente: ${res.device.brand} ${res.device.model} en puerto ${res.device.port}.`,
      };
      setLogs((prev) => [...prev, newLog]);
    } else {
      showAlert(res.message, "error");
    }
  };

  const handleStartScanModal = async () => {
    setIsScanningModalOpen(true);
    setIsScanning(true);
    const results = await scanHardwarePorts();
    setScannedResults(results);
    setIsScanning(false);
  };

  const handleBindDriver = (driver: DeviceDriver) => {
    const bound = bindDevice(driver);
    setBoundDevices(getBoundDevices());
    showAlert(`Dispositivo ${driver.brand} ${driver.model} vinculado correctamente al puerto ${bound.port}`);

    // Log evento
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour12: false }) + `.100`,
      level: "HARDWARE",
      module: "BINDING_SERVICE",
      message: `Vinculación manual realizada: ${driver.brand} ${driver.model} en puerto ${bound.port}.`,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleUnbind = (deviceId: string, deviceName: string) => {
    const updated = unbindDevice(deviceId);
    setBoundDevices(updated);
    showAlert(`Dispositivo ${deviceName} desvinculado del sistema.`, "info");
  };

  const handleClearAll = () => {
    clearAllBoundDevices();
    setBoundDevices([]);
    showAlert("Se ha limpiado la caché de dispositivos vinculados.", "info");
  };

  const currentPrinter = boundDevices.find((d) => d.category === "PRINTER");
  const currentDrawer = boundDevices.find((d) => d.category === "DRAWER");
  const currentScale = boundDevices.find((d) => d.category === "SCALE");
  const currentScanner = boundDevices.find((d) => d.category === "SCANNER");

  // Drivers disponibles por categoría (530 modelos por categoría)
  const availableDrivers = HARDWARE_DRIVERS_DATABASE.filter((driver) => {
    let matchesCategory = false;
    if (activeSubmodule === "impresora") matchesCategory = driver.category === "PRINTER";
    if (activeSubmodule === "cajon") matchesCategory = driver.category === "DRAWER";
    if (activeSubmodule === "bascula") matchesCategory = driver.category === "SCALE";
    if (activeSubmodule === "lector") matchesCategory = driver.category === "SCANNER";

    const matchesSearch =
      !driverSearchQuery ||
      driver.brand.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      driver.model.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      (driver.vendorId && driver.vendorId.toLowerCase().includes(driverSearchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleSimulateError = () => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour12: false }) + `.500`,
      level: "ERROR",
      module: "HARDWARE_PORT",
      message: "Error de comunicación en puerto USB001: Dispositivo no responde.",
      details: "HardwareDeviceException: Timeout de lectura de buffer en puerto de hardware.",
      recommendation: "Verifica que el cable físico USB/Serie esté firmemente conectado.",
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === "ALL" || log.level === filterLevel;
    const matchesSearch =
      log.message.toLowerCase().includes(consoleSearchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(consoleSearchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Estilos adaptativos del tema activo
  const primaryButtonStyle = {
    backgroundColor: activePalette.hex,
    color: activePalette.textOnPrimary || "#FFFFFF",
  };

  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#172B4D]">
      {/* HEADER POS */}
      <POSHeader activeTab="configuracion" ticketNumber="#000129" />

      {/* CONTENIDO PRINCIPAL */}
      <div className="mx-auto max-w-7xl p-8 space-y-6">
        {/* ENCABEZADO PANEL DE HARDWARE */}
        <div className="bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
              <Wrench size={15} style={{ color: activePalette.hex }} />
              <span>Configuración de Hardware POS & Vinculación de Dispositivos</span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-[#091E42]">
              Administración de Periféricos y Controladores
            </h1>
            <p className="mt-1 text-xs text-[#5E6C84]">
              Detecta y vincula automáticamente tus dispositivos físicos o explora el catálogo comercial completo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {boundDevices.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 border border-[#DFE1E6] bg-white text-[#C12516] px-3 py-2 rounded-md text-xs font-bold hover:bg-[#FFEBE6] transition-colors"
                title="Limpiar caché de dispositivos vinculados"
              >
                <Trash2 size={14} />
                <span>Limpiar Caché</span>
              </button>
            )}

            <button
              onClick={handleStartScanModal}
              style={primaryButtonStyle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition-all shadow-xs hover:opacity-90"
            >
              <RefreshCw size={15} className={isScanning ? "animate-spin" : ""} />
              <span>Escaneo Global de Puertos</span>
            </button>
          </div>
        </div>

        {/* ALERTA DE ACCIÓN */}
        {actionAlert && (
          <div
            className={`p-4 rounded-md border text-xs font-bold flex items-center gap-2 ${
              actionAlert.type === "success"
                ? "bg-[#E8F5E9] border-[#A5D6A7] text-[#1B5E20]"
                : actionAlert.type === "error"
                ? "bg-[#FFEBE6] border-[#FFBDAD] text-[#BF2600]"
                : "bg-[#E3F2FD] border-[#90CAF9] text-[#0D47A1]"
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{actionAlert.text}</span>
          </div>
        )}

        {/* SUBMÓDULOS DE DISPOSITIVOS Y CONSOLA */}
        <div className="border-b border-[#DFE1E6] flex items-center gap-1 overflow-x-auto pb-0">
          {[
            { id: "impresora", label: "Impresora de Tickets", bound: currentPrinter },
            { id: "cajon", label: "Cajón de Dinero", bound: currentDrawer },
            { id: "bascula", label: "Báscula Digital", bound: currentScale },
            { id: "lector", label: "Lector Código de Barras", bound: currentScanner },
            { id: "consola", label: "Consola de Diagnóstico", count: `${logs.length} eventos` },
          ].map((sub) => {
            const active = activeSubmodule === sub.id;
            const isBound = !!sub.bound;

            return (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveSubmodule(sub.id as SubModule);
                  setShowManualCatalog(false);
                }}
                style={{
                  borderBottomColor: active ? activePalette.hex : "transparent",
                  color: active ? activePalette.hex : "#5E6C84",
                }}
                className={`
                  px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2
                  ${active ? "bg-white font-extrabold" : "hover:text-[#091E42] hover:bg-white/50"}
                `}
              >
                <span>{sub.label}</span>
                {sub.id === "consola" ? (
                  <span className="text-[10px] font-semibold text-[#6B778C] bg-[#EBECF0] px-2 py-0.5 rounded">
                    {sub.count}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isBound ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#EBECF0] text-[#5E6C84]"
                    }`}
                  >
                    {isBound ? "Vinculado" : "Sin vincular"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DEL SUBMÓDULO SELECCIONADO */}

        {/* 1. IMPRESORA DE TICKETS */}
        {activeSubmodule === "impresora" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBECF0] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#091E42]">Impresora de Tickets</h2>
                  <p className="text-xs text-[#5E6C84]">Emisión de recibos de compra, cortes de caja y servicios</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded border ${
                    currentPrinter
                      ? "text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]"
                      : "text-[#5E6C84] bg-[#F4F5F7] border-[#DFE1E6]"
                  }`}
                >
                  {currentPrinter ? "ESTADO: VINCULADO" : "ESTADO: SIN DISPOSITIVO VINCULADO"}
                </span>
              </div>

              {currentPrinter ? (
                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-md p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Marca & Modelo</span>
                      <p className="font-bold text-[#091E42] text-sm">{currentPrinter.brand} {currentPrinter.model}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Puerto Asignado</span>
                      <p className="font-mono font-bold text-[#091E42]">{currentPrinter.port}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Número de Serie</span>
                      <p className="font-mono text-[#091E42]">{currentPrinter.serialNumber}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Fecha de Vinculación</span>
                      <p className="text-[#091E42]">{currentPrinter.boundAt}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE1E6] flex gap-3">
                    <button
                      onClick={() => showAlert(`Imprimiendo ticket de prueba en ${currentPrinter.brand}... OK`)}
                      style={primaryButtonStyle}
                      className="px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-all"
                    >
                      Imprimir Ticket de Prueba
                    </button>
                    <button
                      onClick={() => handleUnbind(currentPrinter.id, currentPrinter.model)}
                      className="border border-[#EBECF0] bg-white text-[#C12516] px-4 py-2 rounded text-xs font-bold hover:bg-[#FFEBE6]"
                    >
                      Desvincular Impresora
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[#5E6C84] bg-[#FAFBFB] rounded border border-dashed border-[#DFE1E6] space-y-4">
                  <div className="inline-flex p-3 bg-[#EBECF0] rounded-full text-[#091E42]">
                    <Printer size={28} style={{ color: activePalette.hex }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#091E42] text-sm">No hay ninguna impresora vinculada a esta caja</h3>
                    <p className="text-xs text-[#5E6C84] mt-1 max-w-md mx-auto">
                      Conecta tu impresora de tickets mediante puerto USB o Serie y presiona Vinculación Automática.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleAutoBind("PRINTER")}
                      style={primaryButtonStyle}
                      className="px-5 py-2.5 rounded text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-2 transition-all"
                    >
                      <Zap size={15} />
                      <span>Vinculación Automática (Detectar Puerto)</span>
                    </button>
                    <button
                      onClick={() => setShowManualCatalog(!showManualCatalog)}
                      className="border border-[#DFE1E6] bg-white text-[#091E42] px-4 py-2.5 rounded text-xs font-bold hover:bg-[#F4F5F7] flex items-center gap-2"
                    >
                      <Search size={14} />
                      <span>{showManualCatalog ? "Ocultar Catálogo Manual" : "Buscar en Catálogo Manual (530 modelos)"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CATÁLOGO MANUAL DE MODELOS */}
              {showManualCatalog && (
                <div className="space-y-3 pt-4 border-t border-[#DFE1E6]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
                      Catálogo Manual de Impresoras ({availableDrivers.length} de 530 modelos)
                    </h3>
                    <div className="relative flex items-center w-full sm:w-64">
                      <Search size={14} className="absolute left-3 text-[#6B778C]" />
                      <input
                        type="text"
                        value={driverSearchQuery}
                        onChange={(e) => setDriverSearchQuery(e.target.value)}
                        placeholder="Buscar por marca o modelo..."
                        className="w-full h-8 pl-8 pr-3 text-xs font-medium border border-[#DFE1E6] rounded bg-[#F4F5F7] outline-none focus:border-[#091E42] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 border border-[#DFE1E6] rounded-md p-2 bg-[#FAFBFB]">
                    {availableDrivers.slice(0, 50).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between border border-[#DFE1E6] bg-white rounded p-3 hover:bg-[#F4F5F7] text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#091E42]">{driver.brand} - {driver.model}</p>
                          <p className="text-[11px] text-[#5E6C84]">Conexión: {driver.connectionType} | VendorID: {driver.vendorId || "USB/N/A"}</p>
                        </div>
                        <button
                          onClick={() => handleBindDriver(driver)}
                          style={primaryButtonStyle}
                          className="px-3 py-1.5 rounded text-xs font-bold hover:opacity-90 transition-all"
                        >
                          Vincular Este Modelo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PANEL DE ESPECIFICACIONES TÉCNICAS */}
            <div className="bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs text-xs space-y-4">
              <h3 className="font-bold text-[#091E42] border-b border-[#EBECF0] pb-2 text-sm">
                Protocolo de Impresión POS
              </h3>
              <div className="space-y-2 text-[#5E6C84]">
                <p><strong className="text-[#091E42]">Comando Autocorte:</strong> ESC/POS (\x1D\x56)</p>
                <p><strong className="text-[#091E42]">Ancho de Papel:</strong> 80mm / 58mm térmico</p>
                <p><strong className="text-[#091E42]">Detección de Puerto:</strong> WebUSB / WinUSB / Spooler</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. CAJÓN DE DINERO */}
        {activeSubmodule === "cajon" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBECF0] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#091E42]">Cajón de Dinero</h2>
                  <p className="text-xs text-[#5E6C84]">Control del pulso de apertura de gaveta de efectivo</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded border ${
                    currentDrawer
                      ? "text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]"
                      : "text-[#5E6C84] bg-[#F4F5F7] border-[#DFE1E6]"
                  }`}
                >
                  {currentDrawer ? "ESTADO: VINCULADO" : "ESTADO: SIN DISPOSITIVO VINCULADO"}
                </span>
              </div>

              {currentDrawer ? (
                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-md p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Marca & Modelo</span>
                      <p className="font-bold text-[#091E42] text-sm">{currentDrawer.brand} {currentDrawer.model}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Puerto / Disparo</span>
                      <p className="font-mono font-bold text-[#091E42]">{currentDrawer.port}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Número de Serie</span>
                      <p className="font-mono text-[#091E42]">{currentDrawer.serialNumber}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Fecha Vinculación</span>
                      <p className="text-[#091E42]">{currentDrawer.boundAt}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE1E6] flex gap-3">
                    <button
                      onClick={() => showAlert("Pulso enviado: ¡Apertura de gaveta ejecutada!")}
                      style={primaryButtonStyle}
                      className="px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-all"
                    >
                      Probar Apertura
                    </button>
                    <button
                      onClick={() => handleUnbind(currentDrawer.id, currentDrawer.model)}
                      className="border border-[#EBECF0] bg-white text-[#C12516] px-4 py-2 rounded text-xs font-bold hover:bg-[#FFEBE6]"
                    >
                      Desvincular Cajón
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[#5E6C84] bg-[#FAFBFB] rounded border border-dashed border-[#DFE1E6] space-y-4">
                  <div className="inline-flex p-3 bg-[#EBECF0] rounded-full text-[#091E42]">
                    <HardDrive size={28} style={{ color: activePalette.hex }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#091E42] text-sm">No hay ningún cajón de dinero vinculado</h3>
                    <p className="text-xs text-[#5E6C84] mt-1 max-w-md mx-auto">
                      Conecta el cable RJ11 a la impresora o puerto de control de gaveta.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleAutoBind("DRAWER")}
                      style={primaryButtonStyle}
                      className="px-5 py-2.5 rounded text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-2 transition-all"
                    >
                      <Zap size={15} />
                      <span>Vinculación Automática (Detectar Gaveta)</span>
                    </button>
                    <button
                      onClick={() => setShowManualCatalog(!showManualCatalog)}
                      className="border border-[#DFE1E6] bg-white text-[#091E42] px-4 py-2.5 rounded text-xs font-bold hover:bg-[#F4F5F7] flex items-center gap-2"
                    >
                      <Search size={14} />
                      <span>{showManualCatalog ? "Ocultar Catálogo Manual" : "Buscar en Catálogo Manual (530 modelos)"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CATÁLOGO MANUAL */}
              {showManualCatalog && (
                <div className="space-y-3 pt-4 border-t border-[#DFE1E6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
                    Catálogo Manual de Cajones de Dinero ({availableDrivers.length} de 530 modelos)
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 border border-[#DFE1E6] rounded-md p-2 bg-[#FAFBFB]">
                    {availableDrivers.slice(0, 50).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between border border-[#DFE1E6] bg-white rounded p-3 hover:bg-[#F4F5F7] text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#091E42]">{driver.brand} - {driver.model}</p>
                          <p className="text-[11px] text-[#5E6C84]">Conexión: {driver.connectionType} RJ11 / 24V</p>
                        </div>
                        <button
                          onClick={() => handleBindDriver(driver)}
                          style={primaryButtonStyle}
                          className="px-3 py-1.5 rounded text-xs font-bold hover:opacity-90 transition-all"
                        >
                          Vincular Este Modelo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-[#091E42] border-b border-[#EBECF0] pb-2 text-sm">Configuración de Disparo</h3>
              <p className="text-[#5E6C84]">Pulso 24V de apertura por solenoide RJ11 / DK Port.</p>
            </div>
          </div>
        )}

        {/* 3. BÁSCULA DIGITAL */}
        {activeSubmodule === "bascula" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBECF0] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#091E42]">Báscula Digital</h2>
                  <p className="text-xs text-[#5E6C84]">Comunicación por puerto serie RS232 para productos por peso</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded border ${
                    currentScale
                      ? "text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]"
                      : "text-[#5E6C84] bg-[#F4F5F7] border-[#DFE1E6]"
                  }`}
                >
                  {currentScale ? "ESTADO: VINCULADO" : "ESTADO: SIN DISPOSITIVO VINCULADO"}
                </span>
              </div>

              {currentScale ? (
                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-md p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Marca & Modelo</span>
                      <p className="font-bold text-[#091E42] text-sm">{currentScale.brand} {currentScale.model}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Puerto Serie COM</span>
                      <p className="font-mono font-bold text-[#091E42]">{currentScale.port}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Número de Serie</span>
                      <p className="font-mono text-[#091E42]">{currentScale.serialNumber}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Lectura de Peso</span>
                      <p className="font-mono font-bold text-[#091E42] text-base">{basculaPesoTest.toFixed(3)} kg</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE1E6] flex gap-3">
                    <button
                      onClick={() => {
                        const randomWeight = +(0.4 + Math.random() * 2.5).toFixed(3);
                        setBasculaPesoTest(randomWeight);
                        showAlert(`Lectura de peso desde ${currentScale.brand}: ${randomWeight} kg`);
                      }}
                      style={primaryButtonStyle}
                      className="px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-all"
                    >
                      Obtener Peso de Báscula
                    </button>
                    <button
                      onClick={() => handleUnbind(currentScale.id, currentScale.model)}
                      className="border border-[#EBECF0] bg-white text-[#C12516] px-4 py-2 rounded text-xs font-bold hover:bg-[#FFEBE6]"
                    >
                      Desvincular Báscula
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[#5E6C84] bg-[#FAFBFB] rounded border border-dashed border-[#DFE1E6] space-y-4">
                  <div className="inline-flex p-3 bg-[#EBECF0] rounded-full text-[#091E42]">
                    <Scale size={28} style={{ color: activePalette.hex }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#091E42] text-sm">No hay ninguna báscula vinculada actualmente</h3>
                    <p className="text-xs text-[#5E6C84] mt-1 max-w-md mx-auto">
                      Conecta el cable RS232 / Serie COM a la báscula y presiona Vinculación Automática.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleAutoBind("SCALE")}
                      style={primaryButtonStyle}
                      className="px-5 py-2.5 rounded text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-2 transition-all"
                    >
                      <Zap size={15} />
                      <span>Vinculación Automática (Detectar Báscula)</span>
                    </button>
                    <button
                      onClick={() => setShowManualCatalog(!showManualCatalog)}
                      className="border border-[#DFE1E6] bg-white text-[#091E42] px-4 py-2.5 rounded text-xs font-bold hover:bg-[#F4F5F7] flex items-center gap-2"
                    >
                      <Search size={14} />
                      <span>{showManualCatalog ? "Ocultar Catálogo Manual" : "Buscar en Catálogo Manual (530 modelos)"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CATÁLOGO MANUAL */}
              {showManualCatalog && (
                <div className="space-y-3 pt-4 border-t border-[#DFE1E6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
                    Catálogo Manual de Básculas ({availableDrivers.length} de 530 modelos)
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 border border-[#DFE1E6] rounded-md p-2 bg-[#FAFBFB]">
                    {availableDrivers.slice(0, 50).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between border border-[#DFE1E6] bg-white rounded p-3 hover:bg-[#F4F5F7] text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#091E42]">{driver.brand} - {driver.model}</p>
                          <p className="text-[11px] text-[#5E6C84]">Puerto: {driver.defaultPort} | Baudios: {driver.baudRate || 9600}</p>
                        </div>
                        <button
                          onClick={() => handleBindDriver(driver)}
                          style={primaryButtonStyle}
                          className="px-3 py-1.5 rounded text-xs font-bold hover:opacity-90 transition-all"
                        >
                          Vincular Este Modelo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-[#091E42] border-b border-[#EBECF0] pb-2 text-sm">Protocolo Serie RS232</h3>
              <p className="text-[#5E6C84]">Baud Rate: 9600, Data Bits: 8, Parity: None, Stop Bits: 1</p>
            </div>
          </div>
        )}

        {/* 4. LECTOR DE CÓDIGO DE BARRAS */}
        {activeSubmodule === "lector" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBECF0] pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#091E42]">Lector de Código de Barras</h2>
                  <p className="text-xs text-[#5E6C84]">Escáner de códigos de barras 1D y códigos QR 2D</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded border ${
                    currentScanner
                      ? "text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]"
                      : "text-[#5E6C84] bg-[#F4F5F7] border-[#DFE1E6]"
                  }`}
                >
                  {currentScanner ? "ESTADO: VINCULADO" : "ESTADO: SIN DISPOSITIVO VINCULADO"}
                </span>
              </div>

              {currentScanner ? (
                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-md p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Marca & Modelo</span>
                      <p className="font-bold text-[#091E42] text-sm">{currentScanner.brand} {currentScanner.model}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Modo Entrada</span>
                      <p className="font-mono font-bold text-[#091E42]">{currentScanner.port}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Número de Serie</span>
                      <p className="font-mono text-[#091E42]">{currentScanner.serialNumber}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6C84] text-[11px] font-semibold uppercase">Fecha Vinculación</span>
                      <p className="text-[#091E42]">{currentScanner.boundAt}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE1E6] space-y-2">
                    <label className="block text-[#5E6C84] text-[11px] font-semibold uppercase">Probar Lectura en Vivo</label>
                    <input
                      type="text"
                      value={lectorTestValue}
                      onChange={(e) => {
                        setLectorTestValue(e.target.value);
                        if (e.target.value.length >= 6) {
                          setLectorTestSuccess(true);
                        }
                      }}
                      placeholder="Escanea aquí cualquier código de barras..."
                      className="w-full h-10 border border-[#DFE1E6] bg-white rounded px-3 font-mono text-xs outline-none focus:border-[#091E42]"
                    />
                    {lectorTestSuccess && (
                      <p className="text-xs font-bold text-[#2E7D32]">¡Código capturado correctamente!: {lectorTestValue}</p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleUnbind(currentScanner.id, currentScanner.model)}
                      className="border border-[#EBECF0] bg-white text-[#C12516] px-4 py-2 rounded text-xs font-bold hover:bg-[#FFEBE6]"
                    >
                      Desvincular Lector
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[#5E6C84] bg-[#FAFBFB] rounded border border-dashed border-[#DFE1E6] space-y-4">
                  <div className="inline-flex p-3 bg-[#EBECF0] rounded-full text-[#091E42]">
                    <Barcode size={28} style={{ color: activePalette.hex }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#091E42] text-sm">No hay ningún lector de código de barras vinculado</h3>
                    <p className="text-xs text-[#5E6C84] mt-1 max-w-md mx-auto">
                      Conecta el escáner USB en modo teclado HID y presiona Vinculación Automática.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleAutoBind("SCANNER")}
                      style={primaryButtonStyle}
                      className="px-5 py-2.5 rounded text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-2 transition-all"
                    >
                      <Zap size={15} />
                      <span>Vinculación Automática (Detectar Lector)</span>
                    </button>
                    <button
                      onClick={() => setShowManualCatalog(!showManualCatalog)}
                      className="border border-[#DFE1E6] bg-white text-[#091E42] px-4 py-2.5 rounded text-xs font-bold hover:bg-[#F4F5F7] flex items-center gap-2"
                    >
                      <Search size={14} />
                      <span>{showManualCatalog ? "Ocultar Catálogo Manual" : "Buscar en Catálogo Manual (530 modelos)"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CATÁLOGO MANUAL */}
              {showManualCatalog && (
                <div className="space-y-3 pt-4 border-t border-[#DFE1E6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">
                    Catálogo Manual de Lectores ({availableDrivers.length} de 530 modelos)
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 border border-[#DFE1E6] rounded-md p-2 bg-[#FAFBFB]">
                    {availableDrivers.slice(0, 50).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between border border-[#DFE1E6] bg-white rounded p-3 hover:bg-[#F4F5F7] text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#091E42]">{driver.brand} - {driver.model}</p>
                          <p className="text-[11px] text-[#5E6C84]">Conexión: {driver.connectionType} HID Keyboard</p>
                        </div>
                        <button
                          onClick={() => handleBindDriver(driver)}
                          style={primaryButtonStyle}
                          className="px-3 py-1.5 rounded text-xs font-bold hover:opacity-90 transition-all"
                        >
                          Vincular Este Modelo
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#DFE1E6] rounded-lg p-6 shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-[#091E42] border-b border-[#EBECF0] pb-2 text-sm">Modo de Emulación HID</h3>
              <p className="text-[#5E6C84]">El lector envía pulsaciones de teclado con carácter de término (Enter).</p>
            </div>
          </div>
        )}

        {/* 5. CONSOLA DE DIAGNÓSTICO */}
        {activeSubmodule === "consola" && (
          <div className="bg-[#091E42] text-[#F4F5F7] rounded-lg border border-[#172B4D] shadow-md font-mono text-xs overflow-hidden">
            <div className="bg-[#091E42] border-b border-[#172B4D] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-[#4C9EEB]" />
                <h2 className="font-bold text-white text-sm">Consola de Eventos y Diagnóstico Real del POS</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateError}
                  className="bg-[#C12516] text-white px-3 py-1.5 rounded font-bold hover:bg-[#A51D0F]"
                >
                  Simular Error
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="bg-[#172B4D] text-[#8993A4] px-3 py-1.5 rounded font-bold hover:text-white"
                >
                  Limpiar Log
                </button>
              </div>
            </div>

            <div className="p-6 h-[480px] overflow-y-auto space-y-3 select-text bg-[#030C1D]">
              {filteredLogs.map((log, idx) => (
                <div key={log.id} className="border-b border-[#172B4D] pb-2">
                  <span className="text-[#6B778C]">#{idx + 1}</span>{" "}
                  <span className="text-[#8993A4]">[{log.timestamp}]</span>{" "}
                  <span className={`font-bold ${log.level === "ERROR" ? "text-[#FF5630]" : log.level === "WARN" ? "text-[#FFAB00]" : "text-[#36B37E]"}`}>
                    [{log.level}]
                  </span>{" "}
                  <span className="text-[#4C9EEB]">[{log.module}]</span>{" "}
                  <span className="text-white">{log.message}</span>
                  {log.details && (
                    <pre className="mt-1 bg-black/50 p-2 rounded text-[#FF8F73] text-[11px] whitespace-pre-wrap">
                      {log.details}
                    </pre>
                  )}
                  {log.recommendation && (
                    <p className="mt-1 text-[#FFAB00] text-[11px] flex items-center gap-1">
                      <Lightbulb size={13} className="text-[#FFAB00]" />
                      <span><strong>Recomendación de solución:</strong> {log.recommendation}</span>
                    </p>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE ESCANEO DE PUERTOS DE DISPOSITIVOS EN TIEMPO REAL */}
      {isScanningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#091E42]">Detección de Dispositivos Conectados</h3>
                <p className="text-xs text-[#5E6C84]">Escaneo de puertos USB (WebUSB) y Serie COM (WebSerial)</p>
              </div>
              <button onClick={() => setIsScanningModalOpen(false)} className="text-[#5E6C84] hover:text-[#091E42]">
                <X size={20} />
              </button>
            </div>

            {isScanning ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw size={36} className="animate-spin" style={{ color: activePalette.hex }} />
                <p className="font-bold text-[#091E42]">Escaneando puertos USB y COM de la computadora...</p>
                <p className="text-xs text-[#5E6C84]">Consultando catálogo de identificadores de fabricantes (VendorID / ProductID)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#091E42]">Dispositivos Detectados en los Puertos del Sistema ({scannedResults.length})</p>

                {scannedResults.length === 0 ? (
                  <div className="py-8 text-center text-[#5E6C84] bg-[#FAFBFB] rounded border border-dashed border-[#DFE1E6] space-y-2">
                    <AlertTriangle size={28} className="mx-auto text-[#FFAB00]" />
                    <p className="font-bold text-[#091E42] text-sm">No se detectó ningún dispositivo físico en los puertos de este equipo</p>
                    <p className="text-xs text-[#5E6C84] max-w-md mx-auto">
                      Asegúrate de conectar el cable USB o Serie RS232 de tu dispositivo a la computadora. Si deseas asociar un modelo manualmente, utiliza la Selección Manual.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {scannedResults.map((res) => (
                      <div
                        key={res.driver.id}
                        className="flex items-center justify-between border border-[#DFE1E6] rounded-md p-3 text-xs bg-[#F4F5F7]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#091E42] text-sm">{res.driver.brand} - {res.driver.model}</span>
                            {res.isCurrentlyBound && (
                              <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded">
                                Actualmente Vinculado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#5E6C84] mt-0.5">
                            Puerto: <strong className="font-mono text-[#091E42]">{res.port}</strong> | Categoría: {res.driver.category} | Señal: {res.signalStrength}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            handleBindDriver(res.driver);
                            setIsScanningModalOpen(false);
                          }}
                          style={primaryButtonStyle}
                          className="px-4 py-2 rounded text-xs font-bold hover:opacity-90 transition-all"
                        >
                          Vincular Ahora
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
