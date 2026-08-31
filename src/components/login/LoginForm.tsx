export default function LoginForm() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-white lg:w-[48%]">
      {/* Línea dorada divisoria */}
      <div className="absolute bottom-0 left-0 top-0 hidden w-[3px] bg-[#D8A814] lg:block" />

      <div className="w-full max-w-[560px] px-10 py-16 lg:px-12">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-4">
          <div
            className="
              flex h-16 w-16
              items-center justify-center
              border-2 border-[#D8A814]
              text-2xl font-bold text-[#D8A814]
            "
          >
            C
          </div>

          <h1 className="text-5xl font-bold tracking-[0.12em] text-black">
            CRM
          </h1>
        </div>

        {/* Encabezado */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#D8A814]">
            Bienvenido de nuevo
          </h2>

          <p className="mt-2 text-lg text-[#555555]">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-7">
          <div>
            <label className="mb-3 block text-base font-bold text-black">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="ejemplo@empresa.com"
              className="
                h-16 w-full
                border border-[#D8A814]
                bg-white
                px-5
                text-base text-black
                outline-none
                placeholder:text-[#999999]
                focus:border-black
              "
            />
          </div>

          <div>
            <label className="mb-3 block text-base font-bold text-black">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className="
                h-16 w-full
                border border-[#D8A814]
                bg-white
                px-5
                text-base text-black
                outline-none
                placeholder:text-[#999999]
                focus:border-black
              "
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-black">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#D8A814]"
              />

              Recordarme
            </label>

            <button
              type="button"
              className="text-sm font-medium text-[#D8A814] transition-colors hover:text-black"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="
              h-16 w-full
              bg-[#D8A814]
              text-base font-bold uppercase
              tracking-wide
              text-white
              transition-colors
              hover:bg-black
            "
          >
            Iniciar sesión
          </button>
        </form>

        {/* Footer */}
        <div className="mt-20">
          <div className="mb-8 flex items-center gap-6">
            <div className="h-px flex-1 bg-[#D8A814]" />

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                border border-[#D8A814]
                text-sm font-bold text-[#D8A814]
              "
            >
              C
            </div>

            <div className="h-px flex-1 bg-[#D8A814]" />
          </div>

          <p className="text-center text-sm text-[#555555]">
            © 2026 CRM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </section>
  );
}