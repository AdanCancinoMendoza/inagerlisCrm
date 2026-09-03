import Image from "next/image";
import Link from "next/link";

export default function LoginForm() {
  return (
    <section
      className="
        relative
        flex
        h-screen
        max-h-screen
        w-full
        self-start
        items-center
        justify-center
        overflow-hidden
        bg-white
        lg:sticky
        lg:top-0
        lg:w-[48%]
      "
    >
      {/* Línea dorada divisoria */}
      <div className="absolute bottom-0 left-0 top-0 hidden w-[3px] bg-[#D8A814] lg:block" />

      <div className="w-full max-w-[440px] px-8">
        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <div className="h-[200] w-[200px]">
            <Image
              src="/logo.png"
              alt="Logo CRM"
              width={200}
              height={200}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Encabezado */}
        <div className="mb-5">
          <h2 className="text-[2rem] font-bold leading-tight text-[#D8A814]">
            Bienvenido de nuevo
          </h2>

          <p className="mt-1 text-[15px] text-[#666666]">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-4">
          {/* Correo */}
          <div>
            <label className="mb-2 block text-sm font-bold text-black">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="ejemplo@empresa.com"
              className="
                h-[52px]
                w-full
                border border-[#D8A814]
                bg-white
                px-4
                text-[15px]
                text-black
                outline-none
                placeholder:text-[#999999]
                transition-colors
                focus:border-black
              "
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="mb-2 block text-sm font-bold text-black">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className="
                h-[52px]
                w-full
                border border-[#D8A814]
                bg-white
                px-4
                text-[15px]
                text-black
                outline-none
                placeholder:text-[#999999]
                transition-colors
                focus:border-black
              "
            />
          </div>

          {/* Opciones */}
          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#D8A814]"
              />

              Recordarme
            </label>

            <button
              type="button"
              className="
                text-sm
                font-medium
                text-[#D8A814]
                transition-colors
                hover:text-black
              "
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="
              h-[52px]
              w-full
              bg-[#D8A814]
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-white
              transition-colors
              hover:bg-black
            "
          >
            Iniciar sesión
          </button>
        </form>

        <Link
          href="/organizaciones/nueva"
          className="mt-4 flex h-[52px] w-full items-center justify-center border border-[#D8A814] text-sm font-bold uppercase tracking-wide text-[#D8A814] transition-colors hover:bg-[#D8A814] hover:text-white"
        >
          Registrar sucursal
        </Link>

        {/* Footer */}
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#D8A814]" />

            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                border
                border-[#D8A814]
                text-[11px]
                font-bold
                text-[#D8A814]
              "
            >
              C
            </div>

            <div className="h-px flex-1 bg-[#D8A814]" />
          </div>

          <p className="text-center text-[11px] text-[#666666]">
            © 2026 CRM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </section>
  );
}