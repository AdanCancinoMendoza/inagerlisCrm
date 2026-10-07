"use client";

import { Loader2, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  subtitle?: string;
  itemName?: string;
  itemDetails?: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Eliminación",
  subtitle = "Esta acción no se puede deshacer",
  itemName,
  itemDetails,
  warningMessage = "¿Estás completamente seguro de que deseas eliminar este elemento? Se borrará de forma permanente de la base de datos.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto flex w-full max-w-lg flex-col border border-[#DDDDDD] bg-white shadow-2xl cursor-default overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Encabezado con Icono Negro y Título Estilo Sistema */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-4 bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center bg-black text-white shadow-xs">
              <Trash2 size={17} />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">{title}</h3>
              <p className="text-xs text-[#777777]">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center text-[#777777] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-4">
          {itemName && (
            <div className="border border-[#E5E5E5] bg-[#FAFBFB] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777777] mb-1">
                Elemento seleccionado
              </p>
              <p className="text-sm font-bold text-black break-words">{itemName}</p>
              {itemDetails && (
                <p className="mt-1 font-mono text-xs text-[#666666]">{itemDetails}</p>
              )}
            </div>
          )}

          <p className="text-xs text-[#555555] leading-relaxed">{warningMessage}</p>
        </div>

        {/* Pie con Botones CANCELAR y ELIMINAR */}
        <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 border border-[#DDDDDD] bg-white px-5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-11 bg-black px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>{loading ? "Eliminando..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
