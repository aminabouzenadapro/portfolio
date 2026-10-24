// Demo lesson videos: short clips from Wikimedia Commons under free licenses,
// trimmed and compressed (client/public/media). The teacher replaces them with her own uploads.

const commons = (file) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const MEDIA = {
  machine: { author: "Pannini", license: "CC BY-SA 4.0", source: commons("Sewing_with_a_1894_Singer_sewing_machine.webm") },
  "machine-seam": { author: "Amuzujoe", license: "CC BY-SA 4.0", source: commons("Sewing_002.webm") },
  "straight-stitch": { author: "PatriciaCamposMartinez", license: "CC BY-SA 4.0", source: commons("Videopuntadarecta.webm") },
  "zigzag-stitch": { author: "PatriciaCamposMartinez", license: "CC BY-SA 4.0", source: commons("Puntada_zig_zag_en_máquina_de_coser.webm") },
  overlock: { author: "Juandev", license: "CC BY-SA 3.0", source: commons("Seznámení_s_overlockem.webm") },
  "measure-cut": { author: "Modest Baliqees", license: "CC BY 3.0", source: commons("DIY!_Cutting_and_stitching_of_triangular-V_hijab(Easy_tutorial).webm") },
  "sew-seam": { author: "Modest Baliqees", license: "CC BY 3.0", source: commons("DIY!_Cutting_and_stitching_of_triangular-V_hijab(Easy_tutorial).webm") },
  mannequin: { author: "Perea.jpg (derivative work)", license: "CC BY-SA 3.0", source: commons("Colocación_bolducs_de_líneas_a_un_maniquí.webm") },
  embroidery: { author: "Clément Bucco-Lechat", license: "CC BY-SA 3.0", source: commons("Embroidery_(close-up).webm") },
  tailor: { author: "daSupremo", license: "CC BY-SA 4.0", source: commons("Tailor_1.webm") },
};

// Lesson video for a demo clip
export const clip = (name) => ({ src: `media/${name}.mp4`, poster: `media/${name}.jpg`, credit: { name, ...MEDIA[name] } });
