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
  return person.id === HONOREE_CONFIG.id || person.name?.toUpperCase() === HONOREE_CONFIG.name;
};
