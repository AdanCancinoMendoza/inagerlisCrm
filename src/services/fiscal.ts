/**
 * Servicio y utilidades de configuración fiscal y cálculo de IVA
 */

export type ConfiguracionFiscal = {
  rfc?: string | null;
  razonSocial?: string | null;
  regimenFiscal?: string | null;
  ivaActivo: boolean;
  porcentajeIva: number;
};

export function getConfiguracionFiscal(orgId?: string | null): ConfiguracionFiscal {
  const fallback: ConfiguracionFiscal = {
    rfc: "",
    razonSocial: "",
    regimenFiscal: "601",
    ivaActivo: true,
    porcentajeIva: 16,
  };

  if (typeof window === "undefined") return fallback;

  const targetOrg = orgId || localStorage.getItem("crm_organizacion_id");
  if (!targetOrg) return fallback;

  const raw = localStorage.getItem(`inagerlis_config_fiscal_${targetOrg}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        rfc: parsed.rfc || "",
        razonSocial: parsed.razonSocial || "",
        regimenFiscal: parsed.regimenFiscal || "601",
        ivaActivo: parsed.ivaActivo !== undefined ? Boolean(parsed.ivaActivo) : true,
        porcentajeIva: parsed.porcentajeIva !== undefined ? Number(parsed.porcentajeIva) : 16,
      };
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export function setConfiguracionFiscal(orgId: string, config: Partial<ConfiguracionFiscal>): void {
  if (typeof window === "undefined" || !orgId) return;
  const current = getConfiguracionFiscal(orgId);
  const updated: ConfiguracionFiscal = {
    ...current,
    ...config,
    ivaActivo: config.ivaActivo !== undefined ? Boolean(config.ivaActivo) : current.ivaActivo,
    porcentajeIva: config.porcentajeIva !== undefined ? Number(config.porcentajeIva) : current.porcentajeIva,
  };
  localStorage.setItem(`inagerlis_config_fiscal_${orgId}`, JSON.stringify(updated));
}

export function calcularImpuestoVenta(subtotalNeto: number, config?: ConfiguracionFiscal | null): number {
  if (!config || !config.ivaActivo) return 0;
  const porcentaje = Number(config.porcentajeIva) || 0;
  return (subtotalNeto * porcentaje) / 100;
}
