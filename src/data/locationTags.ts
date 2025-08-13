export const LOCATION_TAGS: Record<'es'|'en'|'ca', readonly string[]> = {
  es: [
    'Bar', 'Carretera', 'Casa', 'Calle', 'Oficina', 'Hospital', 'Hotel',
    'Apartamento', 'Restaurante', 'Bosque', 'Playa', 'Montaña', 'Desierto',
    'Iglesia', 'Cementerio', 'Tienda', 'Almacén', 'Estación', 'Aeropuerto',
    'Puerto', 'Coche', 'Metro', 'Autobús', 'Parque', 'Instituto', 'Universidad',
    'Laboratorio', 'Comisaría', 'Prisión', 'Teatro', 'Cine', 'Museo', 'Nave',
  ],
  en: [
    'Bar', 'Highway', 'House', 'Street', 'Office', 'Hospital', 'Hotel',
    'Apartment', 'Restaurant', 'Forest', 'Beach', 'Mountain', 'Desert',
    'Church', 'Cemetery', 'Shop', 'Warehouse', 'Station', 'Airport',
    'Harbor', 'Car', 'Subway', 'Bus', 'Park', 'High School', 'University',
    'Laboratory', 'Police Station', 'Prison', 'Theater', 'Cinema', 'Museum', 'Ship',
  ],
  ca: [
    'Bar', 'Carretera', 'Casa', 'Carrer', 'Oficina', 'Hospital', 'Hotel',
    'Apartament', 'Restaurant', 'Bosc', 'Platja', 'Muntanya', 'Desert',
    'Església', 'Cementiri', 'Botiga', 'Magatzem', 'Estació', 'Aeroport',
    'Port', 'Cotxe', 'Metro', 'Autobús', 'Parc', 'Institut', 'Universitat',
    'Laboratori', 'Comissaria', 'Presó', 'Teatre', 'Cinema', 'Museu', 'Vaixell',
  ],
} as const;
