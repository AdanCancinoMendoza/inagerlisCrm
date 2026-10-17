"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  Copyright,
  ArrowLeft,
  Lock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Globe,
  Mail,
  ChevronRight,
} from "lucide-react";

function LegalContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [tabActiva, setTabActiva] = useState<"terminos" | "privacidad" | "derechos">(
    tabParam === "privacidad"
      ? "privacidad"
      : tabParam === "derechos"
      ? "derechos"
      : "terminos"
  );

  useEffect(() => {
    if (tabParam === "privacidad" || tabParam === "derechos" || tabParam === "terminos") {
      setTabActiva(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E7EB] font-sans">
      {/* Header Corporativo Sobrio */}
      <header className="border-b border-[#262626] bg-[#0A0A0A] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D8A814] flex items-center justify-center font-black text-black text-xs font-mono">
              IN
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.24em] text-[#D8A814] uppercase block">
                CENTRO LEGAL &amp; CUMPLIMIENTO
              </span>
              <h1 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                INAGERLIS <span className="text-[#888888]">SOFTWARE &amp; POS</span>
              </h1>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-[#333333] hover:border-[#D8A814] bg-[#141414] hover:bg-[#1A1A1A] text-white px-4 py-2 text-xs font-mono uppercase tracking-[0.14em] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Volver al Sistema</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#1F1F1F] bg-gradient-to-b from-[#0D0D0D] to-[#050505] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-[#D8A814]/40 bg-[#141414] px-3 py-1 mb-4">
            <Scale size={13} className="text-[#D8A814]" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#D8A814] uppercase">
              MARCO JURÍDICO OFICIAL • EDICIÓN 2026
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.08em] text-white">
            TÉRMINOS, PRIVACIDAD Y DERECHOS DE AUTOR
          </h2>
          <p className="text-xs text-[#9CA3AF] max-w-2xl mt-2 leading-relaxed">
            Consulte la normativa legal, directrices de tratamiento de datos personales,
            licenciamiento de software y derechos de propiedad intelectual que rigen el
            ecosistema de comercio unificado Inagerlis®.
          </p>
        </div>
      </section>

      {/* Barra de Navegación de Pestañas (Bordes rectos, paleta corporativa) */}
      <div className="border-b border-[#262626] bg-[#0A0A0A] sticky top-[65px] z-40">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTabActiva("terminos")}
            className={`px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              tabActiva === "terminos"
                ? "border-[#D8A814] text-[#D8A814] bg-[#141414]"
                : "border-transparent text-[#9CA3AF] hover:text-white"
            }`}
          >
            <FileText size={14} />
            <span>TÉRMINOS DE SERVICIO</span>
          </button>

          <button
            onClick={() => setTabActiva("privacidad")}
            className={`px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              tabActiva === "privacidad"
                ? "border-[#D8A814] text-[#D8A814] bg-[#141414]"
                : "border-transparent text-[#9CA3AF] hover:text-white"
            }`}
          >
            <ShieldCheck size={14} />
            <span>AVISO DE PRIVACIDAD</span>
          </button>

          <button
            onClick={() => setTabActiva("derechos")}
            className={`px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-[0.16em] flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              tabActiva === "derechos"
                ? "border-[#D8A814] text-[#D8A814] bg-[#141414]"
                : "border-transparent text-[#9CA3AF] hover:text-white"
            }`}
          >
            <Copyright size={14} />
            <span>DERECHOS DE AUTOR &amp; PROPIEDAD</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* SECCIÓN 1: TÉRMINOS Y CONDICIONES */}
        {tabActiva === "terminos" && (
          <div className="space-y-8 bg-[#0D0D0D] border border-[#262626] p-8 md:p-12">
            <div className="border-b border-[#262626] pb-6 flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#D8A814] uppercase">
                  CONTRATO DE ADHESIÓN SAAS
                </span>
                <h3 className="text-xl font-black uppercase tracking-[0.1em] text-white mt-1">
                  TÉRMINOS Y CONDICIONES DE USO
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#888888] border border-[#333333] px-3 py-1 bg-[#141414]">
                ÚLTIMA ACTUALIZACIÓN: OCTUBRE 2026
              </span>
            </div>

            <div className="space-y-6 text-xs text-[#D1D5DB] leading-relaxed">
              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  1. ACEPTACIÓN DE LOS TÉRMINOS
                </h4>
                <p>
                  Al acceder, registrarse o utilizar el software <strong>Inagerlis® POS &amp; CRM</strong> (en adelante &quot;La Plataforma&quot;), usted (en adelante &quot;El Usuario&quot; o &quot;El Suscriptor&quot;) manifiesta su plena conformidad y aceptación incondicional de los presentes Términos y Condiciones. Si no está de acuerdo con alguna cláusula, deberá abstenerse de utilizar el sistema.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  2. NATURALEZA DEL SERVICIO Y MODALIDAD SAAS
                </h4>
                <p>
                  Inagerlis provee una solución informática integral de Punto de Venta (POS), control de inventarios, CRM de clientes, facturación y analítica comercial bajo el modelo de Software as a Service (SaaS). El servicio se comercializa mediante suscripción periódica (Planes Básico, Pro y Enterprise), otorgando una licencia de acceso sin transferencia de propiedad sobre el código ni los algoritmos del sistema.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  3. ARQUITECTURA OFFLINE-FIRST Y RESPONSABILIDAD DE SINCRONIZACIÓN
                </h4>
                <p>
                  La Plataforma cuenta con tecnología <strong>Offline-First</strong> para permitir el registro continuo de ventas, emisión de comprobantes provisionales y descuento de inventario visual aún sin conexión a internet o ante caídas del servidor remoto.
                </p>
                <div className="mt-3 bg-[#17130A] border border-[#785412] p-4 text-amber-200">
                  <strong className="block text-[11px] font-mono uppercase tracking-wider text-[#D8A814] mb-1">
                    AVISO CRÍTICO PARA EL SUSCRIPTOR:
                  </strong>
                  Las ventas registradas en modo offline se almacenan temporalmente en el navegador local del dispositivo. Es responsabilidad estricta del Usuario no borrar el almacenamiento local (cookies, IndexedDB, localStorage) ni formatear el equipo hasta que el sistema haya restablecido la conexión y sincronizado automáticamente los folios con el servidor central.
                </div>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  4. CUSTODIA DE CREDENCIALES Y PIN DE ACCESO
                </h4>
                <p>
                  Cada organización cuenta con roles diferenciados (Administrador, Cajero, Encargado). El Suscriptor es el único custodio y responsable de la confidencialidad de sus correos de acceso, contraseñas y códigos PIN. Inagerlis no responderá por transacciones fraudulentas o cancelaciones no autorizadas derivadas del préstamo, descuido o filtración de credenciales por parte del personal del Suscriptor.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  5. SUSPENSIÓN, MORA Y CANCELACIÓN DEL SERVICIO
                </h4>
                <p>
                  Inagerlis se reserva el derecho de suspender temporalmente el acceso a la plataforma a aquellas cuentas que presenten mora en el pago de su suscripción al término de su periodo de gracia (30 días de vigencia estándar), o que incurran en intentos de ataque informático, fuerza bruta o violaciones de seguridad detectadas por el Escudo de Seguridad Inagerlis.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  6. LIMITACIÓN DE RESPONSABILIDAD
                </h4>
                <p>
                  Inagerlis no será responsable por interrupciones atribuibles a los proveedores de telecomunicaciones o internet del Suscriptor, fallas en impresoras térmicas locales, lectores de código de barras USB/Bluetooth o causas de fuerza mayor. El software se provee &quot;tal cual&quot; con un compromiso continuo de disponibilidad técnica óptima.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  7. JURISDICCIÓN Y LEYES APLICABLES
                </h4>
                <p>
                  Para la interpretación y cumplimiento de este instrumento, las partes se someten a las leyes federales de los Estados Unidos Mexicanos y a la competencia de los tribunales competentes en el Estado de Puebla, México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 2: AVISO DE PRIVACIDAD */}
        {tabActiva === "privacidad" && (
          <div className="space-y-8 bg-[#0D0D0D] border border-[#262626] p-8 md:p-12">
            <div className="border-b border-[#262626] pb-6 flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#D8A814] uppercase">
                  PROTECCIÓN DE DATOS PERSONALES (LFPDPPP)
                </span>
                <h3 className="text-xl font-black uppercase tracking-[0.1em] text-white mt-1">
                  AVISO DE PRIVACIDAD INTEGRAL
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#888888] border border-[#333333] px-3 py-1 bg-[#141414]">
                CONFORME A LA LEY MEXICANA E INTERNACIONAL
              </span>
            </div>

            <div className="space-y-6 text-xs text-[#D1D5DB] leading-relaxed">
              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE
                </h4>
                <p>
                  <strong>Inagerlis Technologies</strong>, titularidad de <strong>Adán Cancino Mendoza</strong>, con domicilio fiscal y de operaciones en el Estado de Puebla, México, y portal web oficial en <code className="text-[#D8A814]">https://inagerlis-pv-crm.onrender.com</code>, es responsable del uso, protección y tratamiento de sus datos personales conforme a la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em>.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  2. DATOS PERSONALES QUE SE RECABAN
                </h4>
                <p>Para la prestación y operación del sistema comercial, recabamos:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-[#9CA3AF]">
                  <li><strong>Datos de Identificación del Negocio:</strong> Razón social, nombre comercial, RFC, domicilio fiscal y régimen fiscal.</li>
                  <li><strong>Datos de Contacto:</strong> Correo electrónico administrativo, número telefónico y número de WhatsApp.</li>
                  <li><strong>Datos de Operación:</strong> Nombres y correos de usuarios cajeros y administradores, registros de ventas, catálogo de artículos e historial de clientes (nombre, compras y límites de crédito).</li>
                  <li><strong>Telemetría de Seguridad y Navegación:</strong> Dirección IP de origen, identificadores de sesión, eventos de login/logout y agente de usuario con fines estrictos de prevención de fraude y ataques cibernéticos.</li>
                </ul>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  3. FINALIDADES DEL TRATAMIENTO
                </h4>
                <p>Sus datos personales son utilizados para las siguientes finalidades primarias y necesarias:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-[#141414] border border-[#262626] p-3">
                    <strong className="text-white block font-mono text-[11px] mb-1">A. OPERATIVAS</strong>
                    <p className="text-[#9CA3AF] text-[11px]">Habilitar el punto de venta, emisión de comprobantes, cobro, control de inventario y sincronización en la nube.</p>
                  </div>
                  <div className="bg-[#141414] border border-[#262626] p-3">
                    <strong className="text-white block font-mono text-[11px] mb-1">B. CIBERSEGURIDAD</strong>
                    <p className="text-[#9CA3AF] text-[11px]">Detección de accesos sospechosos, prevención de fuerza bruta, protección de datos y rate limiting perimetral.</p>
                  </div>
                  <div className="bg-[#141414] border border-[#262626] p-3">
                    <strong className="text-white block font-mono text-[11px] mb-1">C. ASISTENCIA CON IA</strong>
                    <p className="text-[#9CA3AF] text-[11px]">Procesar consultas contextuales operativas mediante el asistente inteligente bajo estricta confidencialidad.</p>
                  </div>
                  <div className="bg-[#141414] border border-[#262626] p-3">
                    <strong className="text-white block font-mono text-[11px] mb-1">D. FACTURACIÓN Y PLANES</strong>
                    <p className="text-[#9CA3AF] text-[11px]">Gestión de la membresía activa, control de vigencia, soporte técnico y comunicados de servicio.</p>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  4. USO ÉTICO DE INTELIGENCIA ARTIFICIAL (GEMINI ENGINE)
                </h4>
                <p>
                  Inagerlis incorpora tecnología de Inteligencia Artificial para el análisis de inventarios y sugerencias de compra. Se declara explícitamente que <strong>los datos comerciales de su negocio nunca son vendidos a terceros</strong> ni utilizados para entrenar modelos públicos de inteligencia artificial. Las consultas se ejecutan mediante canales cifrados de uso exclusivo.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  5. DERECHOS ARCO (ACCESO, RECTIFICACIÓN, CANCELACIÓN Y OPOSICIÓN)
                </h4>
                <p>
                  Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los usamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal si está desactualizada, inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros cuando considere que no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición).
                </p>
                <p className="mt-2 text-[#9CA3AF]">
                  Para el ejercicio de cualquiera de los derechos ARCO, envíe una solicitud firmada al correo electrónico institucional: <code className="text-[#D8A814]">contacto@inagerlis.com</code> indicando nombre de la organización, motivo y acreditación de titularidad.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  6. MEDIDAS DE SEGURIDAD Y TRANSFERENCIAS
                </h4>
                <p>
                  Inagerlis implementa cifrado en tránsito (HTTPS/TLS 1.3), cabeceras anti-clickjacking, protección CSRF y contraseñas cifradas mediante algoritmos criptográficos irreversibles (Bcrypt/Argon2). No realizamos transferencias de datos a terceros sin su consentimiento expreso, salvo mandato judicial fundado y motivado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 3: DERECHOS DE AUTOR & PROPIEDAD INTELECTUAL */}
        {tabActiva === "derechos" && (
          <div className="space-y-8 bg-[#0D0D0D] border border-[#262626] p-8 md:p-12">
            <div className="border-b border-[#262626] pb-6 flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#D8A814] uppercase">
                  PROPIEDAD INTELECTUAL &amp; REGISTRO DE SOFTWARE
                </span>
                <h3 className="text-xl font-black uppercase tracking-[0.1em] text-white mt-1">
                  DERECHOS DE AUTOR Y LICENCIA DE SOFTWARE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#D8A814] border border-[#D8A814]/40 px-3 py-1 bg-[#141414]">
                © 2026 INAGERLIS® • ALL RIGHTS RESERVED
              </span>
            </div>

            <div className="space-y-6 text-xs text-[#D1D5DB] leading-relaxed">
              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  1. TITULARIDAD EXCLUSIVA DE DERECHOS DE AUTOR
                </h4>
                <p>
                  El código fuente, código objeto, estructura de base de datos, arquitectura de sincronización offline, interfaces gráficas de usuario, diseño de componentes, logotipos, marcas comerciales y documentación técnica del software <strong>Inagerlis® POS &amp; CRM</strong> son propiedad intelectual exclusiva de <strong>Adán Cancino Mendoza</strong> y/o <strong>Inagerlis Technologies</strong>.
                </p>
                <p className="mt-2 text-[#9CA3AF]">
                  Dicha obra se encuentra plenamente protegida por la <em>Ley Federal del Derecho de Autor (INDAUTOR)</em>, la <em>Ley Federal de Protección a la Propiedad Industrial</em> de los Estados Unidos Mexicanos y por los tratados internacionales en materia de propiedad intelectual, incluyendo el <em>Convenio de Berna</em> y el <em>Tratado de la OMPI sobre Derecho de Autor</em>.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  2. ALCANCE DE LA LICENCIA OTORGADA (LICENCIA SAAS)
                </h4>
                <p>
                  La contratación de cualquier plan de servicio (Básico, Pro, Enterprise) otorga al Suscriptor una licencia de uso de software con las siguientes características indispensables:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 font-mono text-[11px]">
                  <div className="bg-[#141414] border border-[#262626] p-3 text-center">
                    <span className="text-[#D8A814] block font-bold mb-1">NO EXCLUSIVA</span>
                    <span className="text-[#888888]">Uso compartido del servicio cloud multitenant.</span>
                  </div>
                  <div className="bg-[#141414] border border-[#262626] p-3 text-center">
                    <span className="text-[#D8A814] block font-bold mb-1">INTRANSFERIBLE</span>
                    <span className="text-[#888888]">Válida únicamente para la empresa registrada.</span>
                  </div>
                  <div className="bg-[#141414] border border-[#262626] p-3 text-center">
                    <span className="text-[#D8A814] block font-bold mb-1">TEMPORAL</span>
                    <span className="text-[#888888]">Sujeta al pago continuo de la membresía activa.</span>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  3. PROHIBICIONES ESTRICTAS (PIRATERÍA E INGENIERÍA INVERSA)
                </h4>
                <p>Bajo ninguna circunstancia se autoriza al usuario o a terceros a:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-[#9CA3AF]">
                  <li>Descompilar, desensamblar, aplicar ingeniería inversa o intentar descubrir el código fuente de los microservicios, el backend o los módulos de seguridad.</li>
                  <li>Copiar, reproducir, clonar, distribuir, revender, arrendar o explotar comercialmente la plataforma bajo otra marca (marcado blanco no autorizado).</li>
                  <li>Alterar o remover cualquier aviso legal de marca, copyright, logotipo o leyenda de propiedad industrial insertada en el software o tickets emitidos.</li>
                  <li>Desarrollar productos derivados o competidores basados en la arquitectura patentable o propietaria de sincronización offline de Inagerlis.</li>
                </ul>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  4. PROPIEDAD DE LOS DATOS COMERCIALES
                </h4>
                <p>
                  Para tranquilidad total del comerciante: <strong>la información comercial introducida en el sistema</strong> (catálogo de productos, precios, márgenes de venta, inventarios, base de datos de clientes e ingresos) <strong>es y seguirá siendo propiedad única y exclusiva del Suscriptor</strong>. Inagerlis únicamente funge como custodio y procesador tecnológico de dicha información.
                </p>
              </div>

              <div className="border-l-2 border-[#D8A814] pl-4 py-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-1">
                  5. SANCIONES POR INFRACCIÓN
                </h4>
                <p>
                  Cualquier violación a los derechos de propiedad intelectual, piratería o robo de código dará lugar a la rescisión inmediata del servicio sin derecho a reembolso, así como al ejercicio de las acciones legales civiles de indemnización por daños y perjuicios y a las acciones penales tipificadas en el <em>Código Penal Federal</em> en materia de delitos contra los derechos de autor y secretos industriales.
                </p>
              </div>
            </div>

            {/* Cuadro de Copyright Institucional */}
            <div className="bg-[#141414] border-2 border-[#D8A814] p-5 text-center mt-8">
              <span className="text-[10px] font-mono font-bold tracking-[0.24em] text-[#D8A814] uppercase block">
                DECLARACIÓN OFICIAL DE COPYRIGHT
              </span>
              <p className="text-sm font-black text-white uppercase tracking-wider mt-1">
                © 2026 INAGERLIS®. TODOS LOS DERECHOS RESERVADOS.
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
                Desarrollado y registrado por Adán Cancino Mendoza • Puebla, México.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Legal Global */}
      <footer className="border-t border-[#1F1F1F] bg-[#0A0A0A] py-8 px-6 text-center text-xs text-[#777777] font-mono">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">INAGERLIS® POS</span>
            <span>•</span>
            <span>Comercio Unificado en la Nube</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider">
            <button
              onClick={() => setTabActiva("terminos")}
              className={`hover:text-[#D8A814] transition-colors cursor-pointer ${
                tabActiva === "terminos" ? "text-[#D8A814] font-bold" : ""
              }`}
            >
              Términos
            </button>
            <button
              onClick={() => setTabActiva("privacidad")}
              className={`hover:text-[#D8A814] transition-colors cursor-pointer ${
                tabActiva === "privacidad" ? "text-[#D8A814] font-bold" : ""
              }`}
            >
              Privacidad
            </button>
            <button
              onClick={() => setTabActiva("derechos")}
              className={`hover:text-[#D8A814] transition-colors cursor-pointer ${
                tabActiva === "derechos" ? "text-[#D8A814] font-bold" : ""
              }`}
            >
              Derechos de Autor
            </button>
          </div>

          <div>
            <span>Contacto: </span>
            <a href="mailto:contacto@inagerlis.com" className="text-[#D8A814] hover:underline">
              contacto@inagerlis.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LegalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-xs font-mono text-[#D8A814]">
          Cargando Centro Legal Inagerlis...
        </div>
      }
    >
      <LegalContent />
    </Suspense>
  );
}
