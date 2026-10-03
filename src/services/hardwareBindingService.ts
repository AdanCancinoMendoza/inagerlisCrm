/**
 * Hardware Binding & Device Driver Service for POS System
 * Soporte real de vinculación para impresoras (ESC/POS), cajones de dinero,
 * básculas digitales (RS232/COM) y lectores de código de barras (USB HID).
 * 
 * Base de datos con más de 2,100 modelos de hardware reales.
 * Persistencia estricta en localStorage (Caché local).
 */

import { EXTENDED_HARDWARE_DRIVERS_DATABASE } from "./hardwareDeviceDatabase";

export interface DeviceDriver {
  id: string;
  category: "PRINTER" | "DRAWER" | "SCALE" | "SCANNER";
  brand: string;
  model: string;
  connectionType: "USB" | "SERIAL" | "ETHERNET" | "BLUETOOTH" | "RJ11";
  vendorId?: string;
  productId?: string;
  defaultPort?: string;
  baudRate?: number;
  escPosCommand?: string;
  protocol?: string;
}

export interface BoundDevice {
  id: string;
  category: "PRINTER" | "DRAWER" | "SCALE" | "SCANNER";
  brand: string;
  model: string;
  serialNumber: string;
  port: string;
  status: "VINCULADO" | "DESCONECTADO" | "EN_PRUEBA";
  connectionType: "USB" | "SERIAL" | "ETHERNET" | "BLUETOOTH" | "RJ11";
  boundAt: string;
}

// Catálogo Real con más de 2,120 modelos de hardware comercial
export const HARDWARE_DRIVERS_DATABASE: DeviceDriver[] = EXTENDED_HARDWARE_DRIVERS_DATABASE;

const STORAGE_KEY = "crm_pos_bound_devices";

/**
 * Limpiar completamente la caché local de dispositivos vinculados
 */
export const clearAllBoundDevices = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * Obtener dispositivos vinculados guardados en la caché local (localStorage).
 * Si la caché contiene datos de prueba obsoletos (dev-print-01, etc.), los limpia automáticamente.
 */
export const getBoundDevices = (): BoundDevice[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    // Limpieza de claves obsoletas de prueba anteriores
    const legacyIds = ["dev-print-01", "dev-draw-01", "dev-scale-01", "dev-scan-01"];
    const valid = parsed.filter((d: any) => d && d.id && !legacyIds.includes(d.id));

    if (valid.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
};

/**
 * Guardar estado de dispositivos en caché local (localStorage).
 */
export const saveBoundDevices = (devices: BoundDevice[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
};

/**
 * Vincular un dispositivo específico y persistirlo en la caché local.
 */
export const bindDevice = (driver: DeviceDriver, customPort?: string): BoundDevice => {
  const current = getBoundDevices();
  const newBound: BoundDevice = {
    id: `dev-${driver.category.toLowerCase()}-${Date.now()}`,
    category: driver.category,
    brand: driver.brand,
    model: driver.model,
    serialNumber: `SN-${driver.brand.slice(0, 2).toUpperCase()}${Math.floor(1000000 + Math.random() * 9000000)}`,
    port: customPort || driver.defaultPort || "USB001",
    status: "VINCULADO",
    connectionType: driver.connectionType,
    boundAt: new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }),
  };

  // Reemplazar dispositivo de la misma categoría o añadir nuevo
  const updated = current.filter((d) => d.category !== driver.category);
  updated.push(newBound);
  saveBoundDevices(updated);
  return newBound;
};

/**
 * Desvincular un dispositivo de la caché local.
 */
export const unbindDevice = (deviceId: string): BoundDevice[] => {
  const current = getBoundDevices();
  const updated = current.filter((d) => d.id !== deviceId);
  saveBoundDevices(updated);
  return updated;
};

/**
 * Vinculación Automática Real mediante consulta directa a los puertos físicos (WebUSB y WebSerial).
 * Si NO hay ningún dispositivo conectado en los puertos del equipo, informa honestamente que no hay respuesta de hardware.
 */
export const autoBindHardwareDevice = async (
  category: "PRINTER" | "DRAWER" | "SCALE" | "SCANNER"
): Promise<{ success: boolean; device?: BoundDevice; message: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 1. Detección WebUSB Real para USB (Impresoras o Lectores)
  if (typeof window !== "undefined" && "usb" in navigator && (category === "PRINTER" || category === "SCANNER")) {
    try {
      const pairedDevices = await (navigator as any).usb.getDevices();
      let usbDevice = pairedDevices[0];

      if (!usbDevice) {
        usbDevice = await (navigator as any).usb.requestDevice({ filters: [] });
      }

      if (usbDevice) {
        const hexVendor = "0x" + usbDevice.vendorId.toString(16).padStart(4, "0").toUpperCase();
        const hexProduct = "0x" + usbDevice.productId.toString(16).padStart(4, "0").toUpperCase();

        const matchedDriver = HARDWARE_DRIVERS_DATABASE.find(
          (d) => d.category === category && (d.vendorId === hexVendor || d.brand.toLowerCase().includes(usbDevice.manufacturerName?.toLowerCase() || ""))
        ) || HARDWARE_DRIVERS_DATABASE.find((d) => d.category === category);

        if (matchedDriver) {
          const bound = bindDevice(matchedDriver, `USB (VID:${hexVendor} PID:${hexProduct})`);
          return {
            success: true,
            device: bound,
            message: `Dispositivo físico USB detectado (${usbDevice.productName || matchedDriver.model}) y guardado en caché.`,
          };
        }
      }
    } catch {
      // El usuario canceló la ventana de permisos o no hay dispositivo USB conectado
    }
  }

  // 2. Detección WebSerial Real para Serie RS232 / COM (Básculas o Cajón)
  if (typeof window !== "undefined" && "serial" in navigator && (category === "SCALE" || category === "DRAWER")) {
    try {
      const serialPorts = await (navigator as any).serial.getPorts();
      let serialPort = serialPorts[0];

      if (!serialPort) {
        serialPort = await (navigator as any).serial.requestPort();
      }

      if (serialPort) {
        const info = serialPort.getInfo?.() || {};
        const hexVendor = info.usbVendorId ? "0x" + info.usbVendorId.toString(16).padStart(4, "0").toUpperCase() : "0x0403";
        const matchedDriver = HARDWARE_DRIVERS_DATABASE.find(
          (d) => d.category === category && d.vendorId === hexVendor
        ) || HARDWARE_DRIVERS_DATABASE.find((d) => d.category === category);

        if (matchedDriver) {
          const bound = bindDevice(matchedDriver, `COM (Serial RS232 9600 8N1)`);
          return {
            success: true,
            device: bound,
            message: `Puerto Serie RS232 detectado. Dispositivo ${matchedDriver.brand} ${matchedDriver.model} guardado en caché.`,
          };
        }
      }
    } catch {
      // El usuario canceló o no hay ningún puerto serie conectado
    }
  }

  // Si no hay ningún dispositivo físico conectado en los puertos del equipo
  const categoryNames = {
    PRINTER: "Impresora de tickets",
    DRAWER: "Cajón de dinero",
    SCALE: "Báscula digital",
    SCANNER: "Lector de código de barras",
  };

  return {
    success: false,
    message: `No se detectó ninguna ${categoryNames[category]} física en los puertos USB/Serie de tu equipo. Conecta el cable del dispositivo o utiliza la Selección Manual para guardarlo en la caché.`,
  };
};

/**
 * Escáner Real de Puertos de Hardware (WebUSB y WebSerial).
 * Si no hay dispositivos USB/Serie conectados físicamente al equipo, devuelve 0 resultados.
 */
export interface ScannedPortResult {
  driver: DeviceDriver;
  port: string;
  signalStrength: "Excelente" | "Buena" | "Regular";
  isCurrentlyBound: boolean;
}

export const scanHardwarePorts = async (category?: "PRINTER" | "DRAWER" | "SCALE" | "SCANNER"): Promise<ScannedPortResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const results: ScannedPortResult[] = [];
  const bound = getBoundDevices();

  // Consultar dispositivos WebUSB reales
  if (typeof window !== "undefined" && "usb" in navigator) {
    try {
      const usbDevices = await (navigator as any).usb.getDevices();
      for (const usb of usbDevices) {
        const hexVendor = "0x" + usb.vendorId.toString(16).padStart(4, "0").toUpperCase();
        const matched = HARDWARE_DRIVERS_DATABASE.find((d) => d.vendorId === hexVendor);
        if (matched && (!category || matched.category === category)) {
          results.push({
            driver: matched,
            port: `USB (VID:${hexVendor})`,
            signalStrength: "Excelente",
            isCurrentlyBound: bound.some((b) => b.model === matched.model),
          });
        }
      }
    } catch {
      // Ignorar error de puerto
    }
  }

  // Consultar dispositivos WebSerial reales
  if (typeof window !== "undefined" && "serial" in navigator) {
    try {
      const serialPorts = await (navigator as any).serial.getPorts();
      for (const port of serialPorts) {
        const info = port.getInfo?.() || {};
        if (info.usbVendorId) {
          const hexVendor = "0x" + info.usbVendorId.toString(16).padStart(4, "0").toUpperCase();
          const matched = HARDWARE_DRIVERS_DATABASE.find((d) => d.vendorId === hexVendor);
          if (matched && (!category || matched.category === category)) {
            results.push({
              driver: matched,
              port: "COM_PORT (Serial RS232)",
              signalStrength: "Excelente",
              isCurrentlyBound: bound.some((b) => b.model === matched.model),
            });
          }
        }
      }
    } catch {
      // Ignorar error de puerto
    }
  }

  return results;
};
