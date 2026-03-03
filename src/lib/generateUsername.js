const ADJETIVOS = [
  "Agil",
  "Bravo",
  "Calmo",
  "Veloz",
  "Sabio",
  "Forte",
  "Vivo",
  "Audaz",
  "Fiel",
  "Leal",
  "Astuto",
  "Feroz",
];
const ANIMAIS = [
  "Onca",
  "Capivara",
  "Tucano",
  "Arara",
  "Sucuri",
  "Jacare",
  "Preguica",
  "Piranha",
  "Gaviao",
  "Tamandua",
];

export function generateUsername() {
  const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
  const animal = ANIMAIS[Math.floor(Math.random() * ANIMAIS.length)];
  const numero = Math.floor(Math.random() * 900) + 100; // always 3 digits
  return `${adjetivo}${animal}${numero}`;
}
