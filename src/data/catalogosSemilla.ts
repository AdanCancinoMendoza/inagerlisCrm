export interface DemoProduct {
  codigo: string; // Código de barras real (EAN-13 / UPC)
  nombre: string;
  familia: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  unidad: string;
  stockInicial: number;
}

export interface CatalogoPaisInfo {
  pais: string;
  codigoPais: string;
  bandera: string;
  monedaSimbolo: string;
  monedaCodigo: string;
  productos: DemoProduct[];
}

// ---------------------------------------------------------------------------
// 🇲🇽 MÉXICO (Prefijo EAN-13: 750 / Moneda: MXN $)
// ---------------------------------------------------------------------------
export const PRODUCTOS_MEXICO: DemoProduct[] = [
  // Bebidas
  { codigo: "750105530001", nombre: "Coca-Cola Original 600 ml", familia: "Bebidas y Refrescos", precioCompra: 13.5, precioVenta: 18.0, unidad: "Pieza", stockInicial: 30 },
  { codigo: "750105530002", nombre: "Coca-Cola Sin Azúcar 600 ml", familia: "Bebidas y Refrescos", precioCompra: 13.5, precioVenta: 18.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750101111234", nombre: "Agua Mineral Peñafiel 600 ml", familia: "Bebidas y Refrescos", precioCompra: 11.0, precioVenta: 15.0, unidad: "Pieza", stockInicial: 24 },
  { codigo: "750105530055", nombre: "Jugo del Valle Mango 413 ml", familia: "Bebidas y Refrescos", precioCompra: 12.0, precioVenta: 16.5, unidad: "Pieza", stockInicial: 18 },
  { codigo: "750112510203", nombre: "Electrolit Fresa 625 ml", familia: "Bebidas y Refrescos", precioCompra: 22.0, precioVenta: 30.0, unidad: "Pieza", stockInicial: 15 },
  { codigo: "750105530099", nombre: "Agua Purificada Ciel 1 L", familia: "Bebidas y Refrescos", precioCompra: 9.0, precioVenta: 13.0, unidad: "Pieza", stockInicial: 24 },
  // Botanas
  { codigo: "750101110001", nombre: "Papas Sabritas Sal 45 g", familia: "Botanas y Snacks", precioCompra: 15.0, precioVenta: 20.0, unidad: "Pieza", stockInicial: 25 },
  { codigo: "750101110002", nombre: "Doritos Nacho Sabritas 58 g", familia: "Botanas y Snacks", precioCompra: 15.0, precioVenta: 20.0, unidad: "Pieza", stockInicial: 25 },
  { codigo: "750101110003", nombre: "Ruffles Queso 50 g", familia: "Botanas y Snacks", precioCompra: 15.0, precioVenta: 20.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750101110004", nombre: "Cheetos Torciditos 55 g", familia: "Botanas y Snacks", precioCompra: 12.0, precioVenta: 16.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750101110044", nombre: "Cacahuates Japoneses Karate 150 g", familia: "Botanas y Snacks", precioCompra: 13.0, precioVenta: 18.5, unidad: "Pieza", stockInicial: 15 },
  // Lácteos
  { codigo: "750102051234", nombre: "Leche Lala Entera 1 L", familia: "Lácteos y Derivados", precioCompra: 22.0, precioVenta: 28.0, unidad: "Pieza", stockInicial: 24 },
  { codigo: "750102051235", nombre: "Leche Lala Deslactosada 1 L", familia: "Lácteos y Derivados", precioCompra: 23.0, precioVenta: 29.5, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750102055678", nombre: "Queso Panela Nochebuena 400 g", familia: "Lácteos y Derivados", precioCompra: 45.0, precioVenta: 62.0, unidad: "Pieza", stockInicial: 10 },
  { codigo: "750102059999", nombre: "Yoghurt Danone Fresa 220 g", familia: "Lácteos y Derivados", precioCompra: 11.0, precioVenta: 15.5, unidad: "Pieza", stockInicial: 16 },
  { codigo: "750102058888", nombre: "Huevo Blanco San Juan 12 pzas", familia: "Lácteos y Derivados", precioCompra: 34.0, precioVenta: 45.0, unidad: "Pieza", stockInicial: 15 },
  // Panadería
  { codigo: "750100011111", nombre: "Pan Blanco Bimbo Grande 680 g", familia: "Panadería y Galletas", precioCompra: 38.0, precioVenta: 48.0, unidad: "Pieza", stockInicial: 12 },
  { codigo: "750100012222", nombre: "Galletas Emperador Chocolate Gamesa 101 g", familia: "Panadería y Galletas", precioCompra: 14.0, precioVenta: 19.0, unidad: "Pieza", stockInicial: 25 },
  { codigo: "750100013333", nombre: "Galletas Marías Gamesa 170 g", familia: "Panadería y Galletas", precioCompra: 13.0, precioVenta: 18.0, unidad: "Pieza", stockInicial: 30 },
  { codigo: "750100014444", nombre: "Donas Bimbo Espolvoreadas 105 g", familia: "Panadería y Galletas", precioCompra: 17.0, precioVenta: 23.0, unidad: "Pieza", stockInicial: 15 },
  // Despensa
  { codigo: "750103011111", nombre: "Arroz Súper Extra Verde Valle 900 g", familia: "Despensa y Enlatados", precioCompra: 26.0, precioVenta: 34.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750103012222", nombre: "Frijol Negro Verde Valle 900 g", familia: "Despensa y Enlatados", precioCompra: 32.0, precioVenta: 42.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750103013333", nombre: "Aceite Vegetal Nutrioli 850 ml", familia: "Despensa y Enlatados", precioCompra: 36.0, precioVenta: 46.5, unidad: "Pieza", stockInicial: 18 },
  { codigo: "750103014444", nombre: "Atún Dolores en Agua 140 g", familia: "Despensa y Enlatados", precioCompra: 17.5, precioVenta: 23.5, unidad: "Pieza", stockInicial: 30 },
  { codigo: "750103015555", nombre: "Pasta La Moderna Espagueti 200 g", familia: "Despensa y Enlatados", precioCompra: 8.5, precioVenta: 12.0, unidad: "Pieza", stockInicial: 35 },
  { codigo: "750103016666", nombre: "Mayonesa McCormick con Limón 390 g", familia: "Despensa y Enlatados", precioCompra: 28.0, precioVenta: 38.0, unidad: "Pieza", stockInicial: 15 },
  // Limpieza
  { codigo: "750104011111", nombre: "Detergente en Polvo Ariel 1 kg", familia: "Cuidado del Hogar y Limpieza", precioCompra: 32.0, precioVenta: 42.0, unidad: "Pieza", stockInicial: 15 },
  { codigo: "750104012222", nombre: "Limpiador Líquido Fabuloso Lavanda 1 L", familia: "Cuidado del Hogar y Limpieza", precioCompra: 20.0, precioVenta: 28.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750104013333", nombre: "Papel Higiénico Pétalo 4 rollos", familia: "Cuidado del Hogar y Limpieza", precioCompra: 25.0, precioVenta: 35.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750104014444", nombre: "Jabón de Lavandería Zote Blanco 400 g", familia: "Cuidado del Hogar y Limpieza", precioCompra: 17.0, precioVenta: 23.0, unidad: "Pieza", stockInicial: 25 },
];

// ---------------------------------------------------------------------------
// 🇨🇴 COLOMBIA (Prefijo EAN-13: 770 / Moneda: COP $)
// ---------------------------------------------------------------------------
export const PRODUCTOS_COLOMBIA: DemoProduct[] = [
  // Bebidas
  { codigo: "770200100123", nombre: "Gaseosa Postobón Manzana 400 ml", familia: "Bebidas y Cafés", precioCompra: 1800, precioVenta: 2500, unidad: "Pieza", stockInicial: 30 },
  { codigo: "770200400101", nombre: "Pony Malta Botella 330 ml", familia: "Bebidas y Cafés", precioCompra: 2000, precioVenta: 2800, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770200105544", nombre: "Jugo Hit Mango 500 ml", familia: "Bebidas y Cafés", precioCompra: 2300, precioVenta: 3200, unidad: "Pieza", stockInicial: 20 },
  { codigo: "770201012345", nombre: "Café Sello Rojo Molido 250 g", familia: "Bebidas y Cafés", precioCompra: 9500, precioVenta: 12500, unidad: "Pieza", stockInicial: 18 },
  { codigo: "770201018899", nombre: "Café Soluble Colcafé Clásico 100 g", familia: "Bebidas y Cafés", precioCompra: 10500, precioVenta: 14000, unidad: "Pieza", stockInicial: 15 },
  { codigo: "770200108877", nombre: "Agua Cristal sin Gas 600 ml", familia: "Bebidas y Cafés", precioCompra: 1400, precioVenta: 2000, unidad: "Pieza", stockInicial: 24 },
  // Snacks
  { codigo: "770208001001", nombre: "Chocolatina Jet Tradicional 12 g", familia: "Snacks y Golosinas", precioCompra: 700, precioVenta: 1000, unidad: "Pieza", stockInicial: 50 },
  { codigo: "770208002233", nombre: "Chocoramo Bimbo Ponqué 65 g", familia: "Snacks y Golosinas", precioCompra: 1900, precioVenta: 2600, unidad: "Pieza", stockInicial: 30 },
  { codigo: "770201104455", nombre: "Papas Margarita Pollo 40 g", familia: "Snacks y Golosinas", precioCompra: 1800, precioVenta: 2500, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770201109988", nombre: "Platanitos Natuchips Limón 45 g", familia: "Snacks y Golosinas", precioCompra: 1800, precioVenta: 2500, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770201106677", nombre: "DeTodito Familiar 120 g", familia: "Snacks y Golosinas", precioCompra: 4200, precioVenta: 5800, unidad: "Pieza", stockInicial: 15 },
  // Lácteos
  { codigo: "770202500001", nombre: "Leche Entera Alquería Larga Vida 1 L", familia: "Lácteos y Derivados", precioCompra: 3700, precioVenta: 4800, unidad: "Pieza", stockInicial: 24 },
  { codigo: "770202500112", nombre: "Leche Deslactosada Colanta 1 L", familia: "Lácteos y Derivados", precioCompra: 4000, precioVenta: 5200, unidad: "Pieza", stockInicial: 20 },
  { codigo: "770202500334", nombre: "Quesito Colombiano Colanta 250 g", familia: "Lácteos y Derivados", precioCompra: 5800, precioVenta: 7500, unidad: "Pieza", stockInicial: 12 },
  { codigo: "770202500556", nombre: "Arequipe Alpina 220 g", familia: "Lácteos y Derivados", precioCompra: 4900, precioVenta: 6500, unidad: "Pieza", stockInicial: 16 },
  { codigo: "770202500778", nombre: "Yox Alpina Fresa Melocotón 100 g", familia: "Lácteos y Derivados", precioCompra: 1700, precioVenta: 2400, unidad: "Pieza", stockInicial: 20 },
  // Panadería
  { codigo: "770209001010", nombre: "Galletas Ducales Noel 294 g", familia: "Panadería y Galletas", precioCompra: 4700, precioVenta: 6200, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770209002020", nombre: "Galletas Festival Chocolate Noel 403 g", familia: "Panadería y Galletas", precioCompra: 5600, precioVenta: 7400, unidad: "Pieza", stockInicial: 20 },
  { codigo: "770209003030", nombre: "Galletas Saltín Noel 3 Tacos 400 g", familia: "Panadería y Galletas", precioCompra: 4400, precioVenta: 5800, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770200800111", nombre: "Pan Artesano Bimbo Blanco 500 g", familia: "Panadería y Galletas", precioCompra: 6500, precioVenta: 8500, unidad: "Pieza", stockInicial: 12 },
  // Despensa
  { codigo: "770205001234", nombre: "Harina P.A.N. Blanca Maíz 1 kg", familia: "Despensa y Granos", precioCompra: 4100, precioVenta: 5500, unidad: "Pieza", stockInicial: 30 },
  { codigo: "770205005678", nombre: "Arroz Diana Blanco 1 kg", familia: "Despensa y Granos", precioCompra: 3800, precioVenta: 4900, unidad: "Pieza", stockInicial: 30 },
  { codigo: "770205009900", nombre: "Aceite Gourmet Familia 1 L", familia: "Despensa y Granos", precioCompra: 12500, precioVenta: 16500, unidad: "Pieza", stockInicial: 16 },
  { codigo: "770205003322", nombre: "Atún Van Camp's Lomitos en Aceite 160 g", familia: "Despensa y Granos", precioCompra: 6100, precioVenta: 7900, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770205004411", nombre: "Pastas Doria Spaghetti 250 g", familia: "Despensa y Granos", precioCompra: 2100, precioVenta: 2800, unidad: "Pieza", stockInicial: 30 },
  { codigo: "770205008833", nombre: "Frijol Cargamanto Rojo Diana 500 g", familia: "Despensa y Granos", precioCompra: 4800, precioVenta: 6400, unidad: "Pieza", stockInicial: 20 },
  // Limpieza
  { codigo: "770204001111", nombre: "Detergente Líquido Fab Floral 1 L", familia: "Aseo y Limpieza", precioCompra: 10200, precioVenta: 13500, unidad: "Pieza", stockInicial: 15 },
  { codigo: "770204002222", nombre: "Blanqueador Clorox Original 1 L", familia: "Aseo y Limpieza", precioCompra: 4100, precioVenta: 5500, unidad: "Pieza", stockInicial: 20 },
  { codigo: "770204003333", nombre: "Jabón de Baño Protex Antibacterial 110 g", familia: "Aseo y Limpieza", precioCompra: 2800, precioVenta: 3800, unidad: "Pieza", stockInicial: 25 },
  { codigo: "770204004444", nombre: "Papel Higiénico Familia 4 Rollos", familia: "Aseo y Limpieza", precioCompra: 6200, precioVenta: 8200, unidad: "Pieza", stockInicial: 20 },
];

// ---------------------------------------------------------------------------
// 🇺🇸 ESTADOS UNIDOS (Prefijo UPC / EAN: 0... / Moneda: USD $)
// ---------------------------------------------------------------------------
export const PRODUCTOS_USA: DemoProduct[] = [
  // Beverages
  { codigo: "049000028904", nombre: "Coca-Cola Classic Soda 20 fl oz", familia: "Beverages & Drinks", precioCompra: 1.65, precioVenta: 2.49, unidad: "Pieza", stockInicial: 30 },
  { codigo: "049000028911", nombre: "Diet Coke Soda 20 fl oz", familia: "Beverages & Drinks", precioCompra: 1.65, precioVenta: 2.49, unidad: "Pieza", stockInicial: 20 },
  { codigo: "078000082403", nombre: "Dr Pepper Soda 20 fl oz", familia: "Beverages & Drinks", precioCompra: 1.65, precioVenta: 2.49, unidad: "Pieza", stockInicial: 20 },
  { codigo: "012000000133", nombre: "Pepsi Cola Bottle 20 fl oz", familia: "Beverages & Drinks", precioCompra: 1.5, precioVenta: 2.29, unidad: "Pieza", stockInicial: 24 },
  { codigo: "052000328678", nombre: "Gatorade Lemon-Lime 28 fl oz", familia: "Beverages & Drinks", precioCompra: 1.8, precioVenta: 2.79, unidad: "Pieza", stockInicial: 20 },
  { codigo: "068274000101", nombre: "Pure Life Purified Water 16.9 oz", familia: "Beverages & Drinks", precioCompra: 0.65, precioVenta: 1.29, unidad: "Pieza", stockInicial: 35 },
  // Snacks
  { codigo: "028400040112", nombre: "Lay's Classic Potato Chips 8 oz", familia: "Snacks & Chips", precioCompra: 3.1, precioVenta: 4.59, unidad: "Pieza", stockInicial: 25 },
  { codigo: "028400064118", nombre: "Doritos Nacho Cheese Chips 9.25 oz", familia: "Snacks & Chips", precioCompra: 3.4, precioVenta: 4.99, unidad: "Pieza", stockInicial: 25 },
  { codigo: "028400072113", nombre: "Cheetos Crunchy Cheese 8.5 oz", familia: "Snacks & Chips", precioCompra: 3.2, precioVenta: 4.79, unidad: "Pieza", stockInicial: 20 },
  { codigo: "044000032029", nombre: "Oreo Original Sandwich Cookies 14.3 oz", familia: "Snacks & Chips", precioCompra: 3.3, precioVenta: 4.89, unidad: "Pieza", stockInicial: 25 },
  { codigo: "034000002405", nombre: "Hershey's Milk Chocolate Bar 1.55 oz", familia: "Snacks & Chips", precioCompra: 1.1, precioVenta: 1.79, unidad: "Pieza", stockInicial: 40 },
  { codigo: "040000004463", nombre: "M&M's Milk Chocolate Candies 3.14 oz", familia: "Snacks & Chips", precioCompra: 1.45, precioVenta: 2.29, unidad: "Pieza", stockInicial: 30 },
  // Dairy
  { codigo: "011110000123", nombre: "Great Value Whole Milk 1 Gallon", familia: "Dairy & Breakfast", precioCompra: 2.65, precioVenta: 3.89, unidad: "Pieza", stockInicial: 16 },
  { codigo: "038000198514", nombre: "Kellogg's Corn Flakes Cereal 18 oz", familia: "Dairy & Breakfast", precioCompra: 3.7, precioVenta: 5.49, unidad: "Pieza", stockInicial: 15 },
  { codigo: "016000275270", nombre: "Honey Nut Cheerios Cereal 15.4 oz", familia: "Dairy & Breakfast", precioCompra: 3.9, precioVenta: 5.79, unidad: "Pieza", stockInicial: 15 },
  { codigo: "041303001001", nombre: "Kraft American Cheese Singles 16ct", familia: "Dairy & Breakfast", precioCompra: 2.9, precioVenta: 4.29, unidad: "Pieza", stockInicial: 20 },
  { codigo: "070470003001", nombre: "Yoplait Strawberry Yogurt 6 oz", familia: "Dairy & Breakfast", precioCompra: 0.55, precioVenta: 0.99, unidad: "Pieza", stockInicial: 25 },
  // Pantry
  { codigo: "013000006030", nombre: "Heinz Tomato Ketchup Bottle 20 oz", familia: "Pantry & Groceries", precioCompra: 2.65, precioVenta: 3.99, unidad: "Pieza", stockInicial: 20 },
  { codigo: "051000000115", nombre: "Campbell's Condensed Tomato Soup 10.75 oz", familia: "Pantry & Groceries", precioCompra: 1.15, precioVenta: 1.89, unidad: "Pieza", stockInicial: 24 },
  { codigo: "048001000101", nombre: "Hellmann's Real Mayonnaise 30 fl oz", familia: "Pantry & Groceries", precioCompra: 4.1, precioVenta: 5.99, unidad: "Pieza", stockInicial: 15 },
  { codigo: "071514000101", nombre: "Barilla Spaghetti Pasta 16 oz", familia: "Pantry & Groceries", precioCompra: 1.35, precioVenta: 2.19, unidad: "Pieza", stockInicial: 30 },
  { codigo: "073420000101", nombre: "Jif Creamy Peanut Butter 16 oz", familia: "Pantry & Groceries", precioCompra: 2.3, precioVenta: 3.49, unidad: "Pieza", stockInicial: 18 },
  { codigo: "070000000101", nombre: "StarKist Chunk Light Tuna 5 oz", familia: "Pantry & Groceries", precioCompra: 0.95, precioVenta: 1.59, unidad: "Pieza", stockInicial: 30 },
  // Household
  { codigo: "037000123456", nombre: "Tide PODS Liquid Laundry 31 ct", familia: "Household & Cleaning", precioCompra: 8.9, precioVenta: 12.99, unidad: "Pieza", stockInicial: 12 },
  { codigo: "044600010011", nombre: "Clorox Disinfecting Wipes 75 ct", familia: "Household & Cleaning", precioCompra: 3.65, precioVenta: 5.49, unidad: "Pieza", stockInicial: 18 },
  { codigo: "037000001010", nombre: "Dawn Ultra Dishwashing Liquid 19.4 oz", familia: "Household & Cleaning", precioCompra: 2.65, precioVenta: 3.99, unidad: "Pieza", stockInicial: 20 },
  { codigo: "036000241001", nombre: "Scott ComfortPlus Toilet Paper 12ct", familia: "Household & Cleaning", precioCompra: 6.1, precioVenta: 8.99, unidad: "Pieza", stockInicial: 15 },
];

// ---------------------------------------------------------------------------
// 🇪🇸 ESPAÑA (Prefijo EAN-13: 84 / Moneda: EUR €)
// ---------------------------------------------------------------------------
export const PRODUCTOS_ESPANA: DemoProduct[] = [
  // Bebidas
  { codigo: "841010001001", nombre: "Cerveza Mahou Cinco Estrellas 33 cl", familia: "Bebidas y Cervezas", precioCompra: 0.75, precioVenta: 1.20, unidad: "Pieza", stockInicial: 36 },
  { codigo: "841000050001", nombre: "Agua Mineral Bezoya 1.5 L", familia: "Bebidas y Cervezas", precioCompra: 0.50, precioVenta: 0.85, unidad: "Pieza", stockInicial: 30 },
  { codigo: "841000600101", nombre: "ColaCao Original 400 g", familia: "Bebidas y Cervezas", precioCompra: 2.70, precioVenta: 3.95, unidad: "Pieza", stockInicial: 18 },
  { codigo: "841000012345", nombre: "Café Marcilla Gran Aroma 250 g", familia: "Bebidas y Cervezas", precioCompra: 2.30, precioVenta: 3.40, unidad: "Pieza", stockInicial: 20 },
  { codigo: "841000789012", nombre: "Zumo Don Simón Naranja 1 L", familia: "Bebidas y Cervezas", precioCompra: 0.95, precioVenta: 1.55, unidad: "Pieza", stockInicial: 20 },
  // Charcutería
  { codigo: "841007601001", nombre: "Jamón Serrano Navidul Loncheado 100 g", familia: "Charcutería y Quesos", precioCompra: 2.50, precioVenta: 3.75, unidad: "Pieza", stockInicial: 25 },
  { codigo: "841007602002", nombre: "Chorizo Ibérico Campofrío 100 g", familia: "Charcutería y Quesos", precioCompra: 1.85, precioVenta: 2.80, unidad: "Pieza", stockInicial: 20 },
  { codigo: "848000012345", nombre: "Leche Entera Pascual 1 L", familia: "Charcutería y Quesos", precioCompra: 0.78, precioVenta: 1.15, unidad: "Pieza", stockInicial: 24 },
  { codigo: "841008800101", nombre: "Queso Manchego García Baquero 250 g", familia: "Charcutería y Quesos", precioCompra: 3.30, precioVenta: 4.90, unidad: "Pieza", stockInicial: 15 },
  { codigo: "841009900202", nombre: "Yogur Danone Natural Pack 4x125 g", familia: "Charcutería y Quesos", precioCompra: 1.20, precioVenta: 1.85, unidad: "Pieza", stockInicial: 16 },
  // Despensa
  { codigo: "841000000101", nombre: "Aceite Oliva Virgen Extra Carbonell 1 L", familia: "Aceites y Despensa Española", precioCompra: 6.20, precioVenta: 8.95, unidad: "Pieza", stockInicial: 15 },
  { codigo: "841012300001", nombre: "Tomate Frito Solís Estilo Casero 350 g", familia: "Aceites y Despensa Española", precioCompra: 0.85, precioVenta: 1.35, unidad: "Pieza", stockInicial: 30 },
  { codigo: "841013400001", nombre: "Arroz SOS Grano Redondo 1 kg", familia: "Aceites y Despensa Española", precioCompra: 1.40, precioVenta: 2.10, unidad: "Pieza", stockInicial: 25 },
  { codigo: "841014500001", nombre: "Atún Claro Calvo en Aceite Oliva 3x80 g", familia: "Aceites y Despensa Española", precioCompra: 2.45, precioVenta: 3.60, unidad: "Pieza", stockInicial: 25 },
  { codigo: "841015600001", nombre: "Pasta Gallo Macarrones 500 g", familia: "Aceites y Despensa Española", precioCompra: 0.90, precioVenta: 1.40, unidad: "Pieza", stockInicial: 30 },
  { codigo: "841016700001", nombre: "Garbanzo Pedrosillano Luengo 500 g", familia: "Aceites y Despensa Española", precioCompra: 1.25, precioVenta: 1.90, unidad: "Pieza", stockInicial: 20 },
  // Galletas
  { codigo: "841001400001", nombre: "Galletas Gullón María 800 g", familia: "Galletas y Snacks", precioCompra: 1.45, precioVenta: 2.20, unidad: "Pieza", stockInicial: 20 },
  { codigo: "841001402233", nombre: "Galletas Príncipe de Lu Chocolate 300 g", familia: "Galletas y Snacks", precioCompra: 1.65, precioVenta: 2.45, unidad: "Pieza", stockInicial: 25 },
  { codigo: "841002200111", nombre: "Patatas Fritas Lay's Sal 150 g", familia: "Galletas y Snacks", precioCompra: 1.35, precioVenta: 2.10, unidad: "Pieza", stockInicial: 20 },
  { codigo: "841003300222", nombre: "Pipas Grefusa con Sal 100 g", familia: "Galletas y Snacks", precioCompra: 0.80, precioVenta: 1.30, unidad: "Pieza", stockInicial: 30 },
  // Limpieza
  { codigo: "841020000101", nombre: "Detergente Ariel Líquido 30 Lavados", familia: "Droguería y Limpieza", precioCompra: 5.80, precioVenta: 8.50, unidad: "Pieza", stockInicial: 12 },
  { codigo: "841020000202", nombre: "Suavizante Flor Azul 60 Lavados", familia: "Droguería y Limpieza", precioCompra: 2.60, precioVenta: 3.95, unidad: "Pieza", stockInicial: 18 },
  { codigo: "841020000303", nombre: "Fregasuelos Mistol Limón 1 L", familia: "Droguería y Limpieza", precioCompra: 1.40, precioVenta: 2.20, unidad: "Pieza", stockInicial: 20 },
  { codigo: "841020000404", nombre: "Papel Higiénico Scottex 12 Rollos", familia: "Droguería y Limpieza", precioCompra: 3.20, precioVenta: 4.80, unidad: "Pieza", stockInicial: 15 },
];

// ---------------------------------------------------------------------------
// 🇦🇷 ARGENTINA (Prefijo EAN-13: 779 / Moneda: ARS $)
// ---------------------------------------------------------------------------
export const PRODUCTOS_ARGENTINA: DemoProduct[] = [
  // Yerba & Bebidas
  { codigo: "779004000010", nombre: "Yerba Mate Taragüi 500 g", familia: "Yerba Mate y Bebidas", precioCompra: 1700, precioVenta: 2400, unidad: "Pieza", stockInicial: 30 },
  { codigo: "779004000020", nombre: "Yerba Mate Playadito 500 g", familia: "Yerba Mate y Bebidas", precioCompra: 1950, precioVenta: 2800, unidad: "Pieza", stockInicial: 30 },
  { codigo: "779004500001", nombre: "Fernet Branca 750 ml", familia: "Yerba Mate y Bebidas", precioCompra: 7200, precioVenta: 9800, unidad: "Pieza", stockInicial: 15 },
  { codigo: "779004000030", nombre: "Té La Virginia Clásico 25 saquitos", familia: "Yerba Mate y Bebidas", precioCompra: 850, precioVenta: 1200, unidad: "Pieza", stockInicial: 25 },
  // Alfajores
  { codigo: "779089500001", nombre: "Alfajores Havanna Chocolate 6 u", familia: "Alfajores y Galletitas", precioCompra: 6200, precioVenta: 8500, unidad: "Caja", stockInicial: 15 },
  { codigo: "779089500111", nombre: "Alfajor Guaymallén Triple Chocolate", familia: "Alfajores y Galletitas", precioCompra: 480, precioVenta: 700, unidad: "Pieza", stockInicial: 40 },
  { codigo: "779058012345", nombre: "Galletitas Chocolinas Bagley 250 g", familia: "Alfajores y Galletitas", precioCompra: 1500, precioVenta: 2100, unidad: "Pieza", stockInicial: 25 },
  { codigo: "779058013456", nombre: "Galletitas Criollitas 300 g", familia: "Alfajores y Galletitas", precioCompra: 1100, precioVenta: 1600, unidad: "Pieza", stockInicial: 25 },
  { codigo: "779004001122", nombre: "Bon o Bon Chocolate Arcor 270 g", familia: "Alfajores y Galletitas", precioCompra: 1650, precioVenta: 2400, unidad: "Pieza", stockInicial: 20 },
  // Lácteos
  { codigo: "779007012345", nombre: "Dulce de Leche La Serenísima 400 g", familia: "Lácteos y Dulce de Leche", precioCompra: 2300, precioVenta: 3200, unidad: "Pieza", stockInicial: 25 },
  { codigo: "779007018899", nombre: "Leche Entera La Serenísima 1 L", familia: "Lácteos y Dulce de Leche", precioCompra: 980, precioVenta: 1400, unidad: "Pieza", stockInicial: 24 },
  { codigo: "779007015544", nombre: "Manteca La Serenísima Clásica 200 g", familia: "Lácteos y Dulce de Leche", precioCompra: 1850, precioVenta: 2600, unidad: "Pieza", stockInicial: 18 },
  { codigo: "779007019900", nombre: "Queso Cremoso Cremón 500 g", familia: "Lácteos y Dulce de Leche", precioCompra: 3700, precioVenta: 5100, unidad: "Pieza", stockInicial: 12 },
  // Almacén
  { codigo: "779008001001", nombre: "Aceite de Girasol Cocinero 900 ml", familia: "Almacén y Comestibles", precioCompra: 1450, precioVenta: 2100, unidad: "Pieza", stockInicial: 20 },
  { codigo: "779008002002", nombre: "Fideos Matarazzo Tallarines 500 g", familia: "Almacén y Comestibles", precioCompra: 1050, precioVenta: 1500, unidad: "Pieza", stockInicial: 30 },
  { codigo: "779008003003", nombre: "Harina Pureza 0000 1 kg", familia: "Almacén y Comestibles", precioCompra: 920, precioVenta: 1300, unidad: "Pieza", stockInicial: 25 },
  { codigo: "779008004004", nombre: "Puré de Tomate Arcor 520 g", familia: "Almacén y Comestibles", precioCompra: 760, precioVenta: 1100, unidad: "Pieza", stockInicial: 30 },
  { codigo: "779008005005", nombre: "Atún La Campagnola en Trozos 170 g", familia: "Almacén y Comestibles", precioCompra: 2500, precioVenta: 3500, unidad: "Pieza", stockInicial: 20 },
  // Limpieza
  { codigo: "779009001001", nombre: "Jabón en Polvo Ala Clásico 800 g", familia: "Limpieza y Perfumería", precioCompra: 2100, precioVenta: 2900, unidad: "Pieza", stockInicial: 15 },
  { codigo: "779009002002", nombre: "Lavandina Ayudín Común 1 L", familia: "Limpieza y Perfumería", precioCompra: 850, precioVenta: 1200, unidad: "Pieza", stockInicial: 20 },
  { codigo: "779009003003", nombre: "Papel Higiénico Higienol 4 Rollos", familia: "Limpieza y Perfumería", precioCompra: 1550, precioVenta: 2200, unidad: "Pieza", stockInicial: 18 },
];

// ---------------------------------------------------------------------------
// 🇵🇪 PERÚ (Prefijo EAN-13: 775 / Moneda: PEN S/)
// ---------------------------------------------------------------------------
export const PRODUCTOS_PERU: DemoProduct[] = [
  // Bebidas
  { codigo: "775010100010", nombre: "Gaseosa Inca Kola Original 500 ml", familia: "Bebidas y Cervezas", precioCompra: 2.40, precioVenta: 3.50, unidad: "Pieza", stockInicial: 30 },
  { codigo: "775024300001", nombre: "Cerveza Cusqueña Dorada 330 ml", familia: "Bebidas y Cervezas", precioCompra: 4.60, precioVenta: 6.50, unidad: "Pieza", stockInicial: 24 },
  { codigo: "775024300022", nombre: "Cerveza Pilsen Callao 330 ml", familia: "Bebidas y Cervezas", precioCompra: 3.80, precioVenta: 5.50, unidad: "Pieza", stockInicial: 24 },
  { codigo: "775010100033", nombre: "Agua San Luis sin Gas 625 ml", familia: "Bebidas y Cervezas", precioCompra: 1.40, precioVenta: 2.20, unidad: "Pieza", stockInicial: 30 },
  // Snacks
  { codigo: "775088500001", nombre: "Galletas Casino Menta 6pk", familia: "Snacks y Golosinas", precioCompra: 2.90, precioVenta: 4.20, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775088500011", nombre: "Galletas Margarita Clásicas 6pk", familia: "Snacks y Golosinas", precioCompra: 2.60, precioVenta: 3.80, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775000100555", nombre: "Chocolate Sublime Clásico 30 g", familia: "Snacks y Golosinas", precioCompra: 1.70, precioVenta: 2.50, unidad: "Pieza", stockInicial: 40 },
  { codigo: "775000100666", nombre: "Barra Cua Cua 18 g", familia: "Snacks y Golosinas", precioCompra: 0.95, precioVenta: 1.50, unidad: "Pieza", stockInicial: 40 },
  { codigo: "775012300888", nombre: "Chifles Piuranos Salados 100 g", familia: "Snacks y Golosinas", precioCompra: 2.80, precioVenta: 4.00, unidad: "Pieza", stockInicial: 20 },
  // Lácteos
  { codigo: "775000100101", nombre: "Leche Gloria Evaporada Azul 400 g", familia: "Lácteos y Desayuno", precioCompra: 3.10, precioVenta: 4.20, unidad: "Pieza", stockInicial: 35 },
  { codigo: "775000100202", nombre: "Leche Gloria Deslactosada 400 g", familia: "Lácteos y Desayuno", precioCompra: 3.30, precioVenta: 4.50, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775000100303", nombre: "Mantequilla Gloria con Sal 200 g", familia: "Lácteos y Desayuno", precioCompra: 5.40, precioVenta: 7.50, unidad: "Pieza", stockInicial: 15 },
  // Abarrotes
  { codigo: "775012300001", nombre: "Fideos Don Vittorio Spaghetti 500 g", familia: "Abarrotes y Salsas Peruanas", precioCompra: 2.30, precioVenta: 3.40, unidad: "Pieza", stockInicial: 30 },
  { codigo: "775012300111", nombre: "Arroz Costeño Extra 750 g", familia: "Abarrotes y Salsas Peruanas", precioCompra: 3.40, precioVenta: 4.80, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775012300222", nombre: "Aceite Primor Premium 900 ml", familia: "Abarrotes y Salsas Peruanas", precioCompra: 6.50, precioVenta: 8.90, unidad: "Pieza", stockInicial: 20 },
  { codigo: "775012300333", nombre: "Atún Primor en Aceite 170 g", familia: "Abarrotes y Salsas Peruanas", precioCompra: 4.10, precioVenta: 5.80, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775012300444", nombre: "Crema de Ají Tarí Alacena 85 g", familia: "Abarrotes y Salsas Peruanas", precioCompra: 2.20, precioVenta: 3.20, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775012300555", nombre: "Mayonesa Alacena Tradicional 95 g", familia: "Abarrotes y Salsas Peruanas", precioCompra: 2.10, precioVenta: 3.00, unidad: "Pieza", stockInicial: 25 },
  // Limpieza
  { codigo: "775020000101", nombre: "Detergente Bolívar Floral 800 g", familia: "Limpieza del Hogar", precioCompra: 4.90, precioVenta: 6.90, unidad: "Pieza", stockInicial: 18 },
  { codigo: "775020000202", nombre: "Jabón Bolívar Azul en Barra 200 g", familia: "Limpieza del Hogar", precioCompra: 1.90, precioVenta: 2.80, unidad: "Pieza", stockInicial: 25 },
  { codigo: "775020000303", nombre: "Papel Higiénico Suave Doble Hoja 4u", familia: "Limpieza del Hogar", precioCompra: 3.40, precioVenta: 4.90, unidad: "Pieza", stockInicial: 20 },
];

// ---------------------------------------------------------------------------
// 🇨🇱 CHILE (Prefijo EAN-13: 780 / Moneda: CLP $)
// ---------------------------------------------------------------------------
export const PRODUCTOS_CHILE: DemoProduct[] = [
  // Bebidas
  { codigo: "780123456789", nombre: "Gaseosa Bilz 1.5 L", familia: "Bebidas y Cervezas", precioCompra: 1300, precioVenta: 1890, unidad: "Pieza", stockInicial: 24 },
  { codigo: "780123456790", nombre: "Gaseosa Pap 1.5 L", familia: "Bebidas y Cervezas", precioCompra: 1300, precioVenta: 1890, unidad: "Pieza", stockInicial: 24 },
  { codigo: "780100000101", nombre: "Cerveza Cristal Lata 350 cc", familia: "Bebidas y Cervezas", precioCompra: 750, precioVenta: 1100, unidad: "Pieza", stockInicial: 30 },
  { codigo: "780100000202", nombre: "Té Supremo Ceylan 100 bolsitas", familia: "Bebidas y Cervezas", precioCompra: 2200, precioVenta: 3200, unidad: "Pieza", stockInicial: 20 },
  // Galletas y Dulces
  { codigo: "780161000101", nombre: "Galletas McKay Criollitas 140 g", familia: "Galletas y Dulces", precioCompra: 680, precioVenta: 990, unidad: "Pieza", stockInicial: 30 },
  { codigo: "780161000202", nombre: "Galletas Triton Chocolate 126 g", familia: "Galletas y Dulces", precioCompra: 750, precioVenta: 1100, unidad: "Pieza", stockInicial: 25 },
  { codigo: "780161000404", nombre: "Chocolate Sahne-Nuss Nestlé 100 g", familia: "Galletas y Dulces", precioCompra: 1750, precioVenta: 2490, unidad: "Pieza", stockInicial: 20 },
  { codigo: "780200000101", nombre: "Manjar Colun Tradicional 400 g", familia: "Galletas y Dulces", precioCompra: 1550, precioVenta: 2190, unidad: "Pieza", stockInicial: 20 },
  { codigo: "780250000101", nombre: "Leche Soprole Entera 1 L", familia: "Galletas y Dulces", precioCompra: 890, precioVenta: 1290, unidad: "Pieza", stockInicial: 24 },
  // Abarrotes
  { codigo: "780400000101", nombre: "Fideos Carozzi Spaghetti 5 400 g", familia: "Abarrotes y Despensa", precioCompra: 750, precioVenta: 1090, unidad: "Pieza", stockInicial: 30 },
  { codigo: "780400000202", nombre: "Salsa de Tomates Carozzi Italiana 200 g", familia: "Abarrotes y Despensa", precioCompra: 450, precioVenta: 690, unidad: "Pieza", stockInicial: 30 },
  { codigo: "780400000303", nombre: "Arroz Tucapel Grano Largo 1 kg", familia: "Abarrotes y Despensa", precioCompra: 1250, precioVenta: 1790, unidad: "Pieza", stockInicial: 25 },
  { codigo: "780400000404", nombre: "Aceite Vegetal Belmont 900 ml", familia: "Abarrotes y Despensa", precioCompra: 1800, precioVenta: 2590, unidad: "Pieza", stockInicial: 20 },
  { codigo: "780400000505", nombre: "Atún San José en Aceite 160 g", familia: "Abarrotes y Despensa", precioCompra: 1150, precioVenta: 1690, unidad: "Pieza", stockInicial: 25 },
  // Limpieza
  { codigo: "780500000101", nombre: "Detergente Omo Polvo 800 g", familia: "Limpieza del Hogar", precioCompra: 2400, precioVenta: 3490, unidad: "Pieza", stockInicial: 15 },
  { codigo: "780500000202", nombre: "Cloro Clorox Tradicional 1 L", familia: "Limpieza del Hogar", precioCompra: 980, precioVenta: 1490, unidad: "Pieza", stockInicial: 20 },
  { codigo: "780500000303", nombre: "Papel Higiénico Confort 4 Rollos", familia: "Limpieza del Hogar", precioCompra: 1450, precioVenta: 2190, unidad: "Pieza", stockInicial: 20 },
];

// ---------------------------------------------------------------------------
// 💊 FARMACIA (Multi-país)
// ---------------------------------------------------------------------------
export const PRODUCTOS_FARMACIA: DemoProduct[] = [
  { codigo: "750110010001", nombre: "Paracetamol 500 mg 10 tabletas", familia: "Medicamentos de Libre Venta", precioCompra: 12.0, precioVenta: 22.0, unidad: "Caja", stockInicial: 30 },
  { codigo: "750110010002", nombre: "Ibuprofeno 400 mg 10 cápsulas", familia: "Medicamentos de Libre Venta", precioCompra: 18.0, precioVenta: 32.0, unidad: "Caja", stockInicial: 25 },
  { codigo: "750110010003", nombre: "Aspirina 500 mg 20 tabletas", familia: "Medicamentos de Libre Venta", precioCompra: 24.0, precioVenta: 38.0, unidad: "Caja", stockInicial: 20 },
  { codigo: "750110010004", nombre: "Alka-Seltzer 10 sobres", familia: "Medicamentos de Libre Venta", precioCompra: 28.0, precioVenta: 44.0, unidad: "Caja", stockInicial: 20 },
  { codigo: "750110020001", nombre: "Alcohol Desnaturalizado 70% 500 ml", familia: "Primeros Auxilios y Curación", precioCompra: 20.0, precioVenta: 32.0, unidad: "Pieza", stockInicial: 20 },
  { codigo: "750110020002", nombre: "Curitas Adhesivas Caja 20 pzas", familia: "Primeros Auxilios y Curación", precioCompra: 15.0, precioVenta: 25.0, unidad: "Caja", stockInicial: 25 },
];

// Mapeo por país
export const MAPA_CATALOGOS: Record<string, CatalogoPaisInfo> = {
  "México": {
    pais: "México",
    codigoPais: "MX",
    bandera: "🇲🇽",
    monedaSimbolo: "$",
    monedaCodigo: "MXN",
    productos: PRODUCTOS_MEXICO,
  },
  "Colombia": {
    pais: "Colombia",
    codigoPais: "CO",
    bandera: "🇨🇴",
    monedaSimbolo: "$",
    monedaCodigo: "COP",
    productos: PRODUCTOS_COLOMBIA,
  },
  "Estados Unidos": {
    pais: "Estados Unidos",
    codigoPais: "US",
    bandera: "🇺🇸",
    monedaSimbolo: "$",
    monedaCodigo: "USD",
    productos: PRODUCTOS_USA,
  },
  "España": {
    pais: "España",
    codigoPais: "ES",
    bandera: "🇪🇸",
    monedaSimbolo: "€",
    monedaCodigo: "EUR",
    productos: PRODUCTOS_ESPANA,
  },
  "Argentina": {
    pais: "Argentina",
    codigoPais: "AR",
    bandera: "🇦🇷",
    monedaSimbolo: "$",
    monedaCodigo: "ARS",
    productos: PRODUCTOS_ARGENTINA,
  },
  "Perú": {
    pais: "Perú",
    codigoPais: "PE",
    bandera: "🇵🇪",
    monedaSimbolo: "S/",
    monedaCodigo: "PEN",
    productos: PRODUCTOS_PERU,
  },
  "Chile": {
    pais: "Chile",
    codigoPais: "CL",
    bandera: "🇨🇱",
    monedaSimbolo: "$",
    monedaCodigo: "CLP",
    productos: PRODUCTOS_CHILE,
  },
};

export function getCatalogoSemillaFrontend(pais?: string, giro?: string): CatalogoPaisInfo {
  const g = (giro || "").toUpperCase();
  if (g.includes("FARMACIA") || g.includes("SALUD") || g.includes("MEDICA")) {
    return {
      pais: pais || "México",
      codigoPais: "GEN",
      bandera: "🏥",
      monedaSimbolo: "$",
      monedaCodigo: "LOCAL",
      productos: PRODUCTOS_FARMACIA,
    };
  }

  const p = (pais || "México").trim();

  // Búsqueda directa
  if (MAPA_CATALOGOS[p]) {
    return MAPA_CATALOGOS[p];
  }

  // Búsqueda aproximada
  const pUpper = p.toUpperCase();
  if (pUpper.includes("COLOMBIA")) return MAPA_CATALOGOS["Colombia"];
  if (pUpper.includes("ESTADOS UNIDOS") || pUpper.includes("USA") || pUpper.includes("UNITED STATES")) return MAPA_CATALOGOS["Estados Unidos"];
  if (pUpper.includes("ESPAÑA") || pUpper.includes("ESPANA") || pUpper.includes("SPAIN")) return MAPA_CATALOGOS["España"];
  if (pUpper.includes("ARGENTINA")) return MAPA_CATALOGOS["Argentina"];
  if (pUpper.includes("PERU") || pUpper.includes("PERÚ")) return MAPA_CATALOGOS["Perú"];
  if (pUpper.includes("CHILE")) return MAPA_CATALOGOS["Chile"];

  // Por defecto México
  return MAPA_CATALOGOS["México"];
}
