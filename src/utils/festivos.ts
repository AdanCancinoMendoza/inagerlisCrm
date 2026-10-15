/**
 * Utilidades y catálogo de Días Festivos Oficiales y Tradicionales en México
 */

export interface DiaFestivo {
  fecha: string; // YYYY-MM-DD
  nombre: string;
  esOficial: boolean; // Descanso obligatorio por Ley Federal del Trabajo
  categoria: 'OFICIAL' | 'TRADICIONAL' | 'COMERCIAL';
  descripcion: string;
}

/**
 * Calcula la fecha del Domingo de Pascua para un año dado (Algoritmo de Butcher)
 */
function calcularPascua(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * Obtiene el enésimo día de la semana en un mes específico
 * @param dayOfWeek 0 = Domingo, 1 = Lunes, etc.
 * @param nth 1 = primer lunes, 3 = tercer lunes, etc.
 */
function getNthDayOfMonth(year: number, monthIndex: number, dayOfWeek: number, nth: number): number {
  let count = 0;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    if (date.getDay() === dayOfWeek) {
      count++;
      if (count === nth) return d;
    }
  }
  return 1;
}

/**
 * Genera el listado completo de días festivos para un año dado
 */
export function getDiasFestivosDelAno(year: number): DiaFestivo[] {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const format = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

  const festivos: DiaFestivo[] = [
    // --- Festivos Fijos Oficiales y Tradicionales ---
    {
      fecha: format(year, 1, 1),
      nombre: 'Año Nuevo',
      esOficial: true,
      categoria: 'OFICIAL',
      descripcion: 'Día festivo no laborable oficial por inicio de año.',
    },
    {
      fecha: format(year, 1, 6),
      nombre: 'Día de Reyes',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Celebración tradicional de los Reyes Magos y Rosca de Reyes.',
    },
    {
      fecha: format(year, 2, 2),
      nombre: 'Día de la Candelaria',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Tradición mexicana de tamales y bendición de velas.',
    },
    {
      fecha: format(year, 2, 14),
      nombre: 'Día del Amor y la Amistad',
      esOficial: false,
      categoria: 'COMERCIAL',
      descripcion: 'Día de San Valentín, alta actividad comercial en regalos y pedidos.',
    },
    {
      fecha: format(year, 3, 8),
      nombre: 'Día Internacional de la Mujer',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Conmemoración de los derechos de la mujer.',
    },
    {
      fecha: format(year, 4, 30),
      nombre: 'Día del Niño',
      esOficial: false,
      categoria: 'COMERCIAL',
      descripcion: 'Celebración infantil con alta demanda de productos y pastelería.',
    },
    {
      fecha: format(year, 5, 1),
      nombre: 'Día del Trabajo',
      esOficial: true,
      categoria: 'OFICIAL',
      descripcion: 'Día festivo oficial no laborable en conmemoración de la clase trabajadora.',
    },
    {
      fecha: format(year, 5, 5),
      nombre: 'Batalla de Puebla',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Conmemoración histórica de la victoria en Puebla en 1862.',
    },
    {
      fecha: format(year, 5, 10),
      nombre: 'Día de las Madres',
      esOficial: false,
      categoria: 'COMERCIAL',
      descripcion: 'Una de las fechas comerciales más concurridas del año en México.',
    },
    {
      fecha: format(year, 5, 15),
      nombre: 'Día del Maestro',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Reconocimiento a profesores y educadores.',
    },
    {
      fecha: format(year, 9, 16),
      nombre: 'Día de la Independencia',
      esOficial: true,
      categoria: 'OFICIAL',
      descripcion: 'Fiesta Patria oficial conmemorando el inicio de la Independencia de México.',
    },
    {
      fecha: format(year, 10, 12),
      nombre: 'Día de la Raza',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Conmemoración del encuentro de dos culturas.',
    },
    {
      fecha: format(year, 11, 1),
      nombre: 'Día de Todos los Santos',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Primera jornada tradicional del Día de Muertos en México.',
    },
    {
      fecha: format(year, 11, 2),
      nombre: 'Día de Muertos',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Patrimonio Cultural Inmaterial de México, ofrendas y flores de cempasúchil.',
    },
    {
      fecha: format(year, 12, 12),
      nombre: 'Día de la Virgen de Guadalupe',
      esOficial: false,
      categoria: 'TRADICIONAL',
      descripcion: 'Fervor popular y peregrinaciones religiosas.',
    },
    {
      fecha: format(year, 12, 24),
      nombre: 'Nochebuena',
      esOficial: false,
      categoria: 'COMERCIAL',
      descripcion: 'Víspera de Navidad y cenas familiares.',
    },
    {
      fecha: format(year, 12, 25),
      nombre: 'Navidad',
      esOficial: true,
      categoria: 'OFICIAL',
      descripcion: 'Día festivo oficial no laborable de Navidad.',
    },
    {
      fecha: format(year, 12, 31),
      nombre: 'Fin de Año',
      esOficial: false,
      categoria: 'COMERCIAL',
      descripcion: 'Cierre del año calendario y festejos nocturnos.',
    },
  ];

  // --- Festivos Móviles Oficiales por Ley en México ---
  // 1. Primer lunes de febrero (Día de la Constitución Mexicana - 5 Feb)
  const primerLunesFeb = getNthDayOfMonth(year, 1, 1, 1);
  festivos.push({
    fecha: format(year, 2, primerLunesFeb),
    nombre: 'Día de la Constitución (Oficial)',
    esOficial: true,
    categoria: 'OFICIAL',
    descripcion: 'Descanso oficial obligatorio en conmemoración de la Constitución de 1917.',
  });

  // 2. Tercer lunes de marzo (Natalicio de Benito Juárez - 21 Mar)
  const tercerLunesMar = getNthDayOfMonth(year, 2, 1, 3);
  festivos.push({
    fecha: format(year, 3, tercerLunesMar),
    nombre: 'Natalicio de Benito Juárez (Oficial)',
    esOficial: true,
    categoria: 'OFICIAL',
    descripcion: 'Descanso oficial obligatorio por el natalicio del Benemérito de las Américas.',
  });

  // 3. Tercer lunes de noviembre (Revolución Mexicana - 20 Nov)
  const tercerLunesNov = getNthDayOfMonth(year, 10, 1, 3);
  festivos.push({
    fecha: format(year, 11, tercerLunesNov),
    nombre: 'Revolución Mexicana (Oficial)',
    esOficial: true,
    categoria: 'OFICIAL',
    descripcion: 'Descanso oficial obligatorio conmemorando el inicio de la Revolución de 1910.',
  });

  // 4. Tercer domingo de junio (Día del Padre)
  const tercerDomJun = getNthDayOfMonth(year, 5, 0, 3);
  festivos.push({
    fecha: format(year, 6, tercerDomJun),
    nombre: 'Día del Padre',
    esOficial: false,
    categoria: 'COMERCIAL',
    descripcion: 'Celebración familiar para los padres de familia.',
  });

  // 5. Semana Santa (Jueves y Viernes Santo calculados a partir de Pascua)
  const pascua = calcularPascua(year);
  const domingoPascuaDate = new Date(year, pascua.month - 1, pascua.day);

  const viernesSantoDate = new Date(domingoPascuaDate);
  viernesSantoDate.setDate(domingoPascuaDate.getDate() - 2);

  const juevesSantoDate = new Date(domingoPascuaDate);
  juevesSantoDate.setDate(domingoPascuaDate.getDate() - 3);

  festivos.push({
    fecha: format(viernesSantoDate.getFullYear(), viernesSantoDate.getMonth() + 1, viernesSantoDate.getDate()),
    nombre: 'Viernes Santo',
    esOficial: false,
    categoria: 'TRADICIONAL',
    descripcion: 'Semana Santa, tradición y descanso en múltiples sectores.',
  });

  festivos.push({
    fecha: format(juevesSantoDate.getFullYear(), juevesSantoDate.getMonth() + 1, juevesSantoDate.getDate()),
    nombre: 'Jueves Santo',
    esOficial: false,
    categoria: 'TRADICIONAL',
    descripcion: 'Jornada tradicional de Semana Santa.',
  });

  return festivos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/**
 * Devuelve el día festivo para una fecha YYYY-MM-DD si existe
 */
export function getFestivoPorFecha(fechaStr: string): DiaFestivo | undefined {
  const parts = fechaStr.split('-');
  if (parts.length < 3) return undefined;
  const year = parseInt(parts[0], 10);
  const festivos = getDiasFestivosDelAno(year);
  return festivos.find((f) => f.fecha === fechaStr);
}
