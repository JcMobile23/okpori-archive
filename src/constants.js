export const STORAGE_KEYS = {
  LINEAGE: 'okpori_lineage',
  GALLERY: 'okpori_gallery',
  ARCHIVE_FILENAME: 'okpori_complete_archive.json',
};

export const HONOREE_CONFIG = {
  id: 'ayodele-ef',
  name: 'AYODELE',
  title: "Today's Birthday Honoree",
  greeting: "Happy Birthday, Ayodele! May the ancestors illuminate your path with joy, long life, and boundless grace.",
  blessing: "Ndụ, udo na ngọzi (Life, peace, and divine blessings) upon you on this special day.",
};

export const isHonoree = (person) => {
  if (!person) return false;
  const name = String(person.name || '').trim().toUpperCase();
  const id = String(person.id || '').trim().toLowerCase();
  return (
    id === 'ayodele-ef' ||
    id.includes('ayodele') ||
    name === 'AYODELE' ||
    name.includes('AYODELE')
  );
};
