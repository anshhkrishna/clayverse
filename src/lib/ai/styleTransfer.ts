// ─── Ceramic Style Types ──────────────────────────────────────────────────────

export interface CeramicStyle {
  id: string;
  name: string;
  origin: string;
  era: string;
  description: string;
  characteristics: string[];
  colorPalette: string[]; // hex colors
  suggestedGlazes: string[];
  formLanguage: string;
}

// ─── Ceramic Styles Library ───────────────────────────────────────────────────

export const CERAMIC_STYLES: CeramicStyle[] = [
  {
    id: "song-celadon",
    name: "Song Dynasty Celadon",
    origin: "China",
    era: "960–1279 CE",
    description:
      "Ethereal jade-green glazes covering refined, restrained forms. The Song potters achieved an unmatched stillness in their work — vessels that feel like frozen water or pale jade carved by time.",
    characteristics: [
      "jade-green glaze",
      "refined proportions",
      "subtle surface texture",
      "carved or impressed decoration",
      "quiet elegance",
      "thin walls",
    ],
    colorPalette: ["#a8c5a0", "#7fa882", "#c9dcc4", "#e8f0e4", "#5e8a68", "#d4e8cf"],
    suggestedGlazes: [
      "Pale celadon with slight blue tone",
      "Guan ware crackle celadon",
      "Longquan deep green celadon",
    ],
    formLanguage:
      "Gentle curves with restrained proportions, carved lotus or floral motifs, quiet foot rings, forms that breathe stillness",
  },
  {
    id: "jomon",
    name: "Jōmon Pottery",
    origin: "Japan",
    era: "14,000–300 BCE",
    description:
      "Among the world's oldest ceramics, Jōmon ware is primal and alive with texture. Cord-marked surfaces, flame-like rims, and deep earthen forms speak directly from the hands of the ancient world.",
    characteristics: [
      "cord-impressed texture",
      "flame rims",
      "coil-built construction",
      "organic asymmetry",
      "unglazed surfaces",
      "deep vessel forms",
    ],
    colorPalette: ["#8b6347", "#c4956a", "#5c3d2e", "#d4a574", "#3d2614", "#a07050"],
    suggestedGlazes: [
      "Unglazed, burnished",
      "Natural ash glaze",
      "Iron-rich slip with wood firing",
    ],
    formLanguage:
      "Deep cylindrical or rounded vessels with exuberant textured surfaces, asymmetric rims that reach upward like flames, raw and tactile",
  },
  {
    id: "raku",
    name: "Raku",
    origin: "Japan / USA (traditional / contemporary)",
    era: "16th century – present",
    description:
      "Born in the tea ceremony tradition of Kyoto, Raku celebrates imperfection and the hand. Each piece is a record of fire itself — unpredictable, immediate, unrepeatable. Contemporary American Raku adds smoke and flash-fire drama.",
    characteristics: [
      "hand-shaped, not wheel-thrown",
      "irregular form",
      "thick walls",
      "low-fire glazes",
      "reduction markings",
      "pit or post-fire reduction",
    ],
    colorPalette: ["#1a1a1a", "#c8a96e", "#e8dcc8", "#4a3728", "#8c7a5e", "#2c2420"],
    suggestedGlazes: [
      "Traditional black Raku glaze",
      "White Raku with red iron",
      "Copper matte with post-fire reduction",
      "Crackle white",
    ],
    formLanguage:
      "Irregular, squeezed, and pinched forms that record the warmth of the hand; tea bowls with gentle asymmetry, quiet interior and expressive exterior",
  },
  {
    id: "majolica",
    name: "Majolica / Maiolica",
    origin: "Italy / Spain / Netherlands",
    era: "14th century – present",
    description:
      "Sun-drenched Mediterranean tradition of tin-glazed earthenware painted with vivid cobalt, ochre, and manganese pigments. Functional beauty that has graced tables from the Renaissance courts to farmhouse kitchens.",
    characteristics: [
      "tin-opacified white ground",
      "painted decoration",
      "bright cobalt blue",
      "ochre and manganese details",
      "functional forms",
      "earthenware base",
    ],
    colorPalette: ["#2b5ba8", "#e8c84a", "#c84b20", "#3a8c3a", "#ffffff", "#8b4513"],
    suggestedGlazes: [
      "Tin-white opaque base",
      "Cobalt blue painted decoration",
      "Yellow ochre and manganese accents",
    ],
    formLanguage:
      "Rounded functional forms — plates, bowls, pitchers, jars — shaped for use and display, surfaces treated as canvases for narrative painting",
  },
  {
    id: "leach-studio",
    name: "Studio Pottery (Leach Tradition)",
    origin: "UK / International",
    era: "1920s – present",
    description:
      "Bernard Leach and Shoji Hamada synthesized East and West into a living tradition of functional beauty. Forms that honor the material, the hand, and daily use — pots that are poems of usefulness.",
    characteristics: [
      "functional forms",
      "tenmoku or celadon glazes",
      "thrown on the wheel",
      "modest scale",
      "subtle decoration",
      "East-West synthesis",
    ],
    colorPalette: ["#4a3728", "#8b6914", "#2c4a2c", "#c8a064", "#6e8c6e", "#1a1a14"],
    suggestedGlazes: [
      "Tenmoku iron glaze",
      "Oatmeal stoneware glaze",
      "Kaki (persimmon) glaze",
      "Shino white",
    ],
    formLanguage:
      "Wheel-thrown forms with quiet dignity — mugs, bowls, jugs, bottles — proportioned for the hand, decorated with wax resist, brushwork, or impressed marks",
  },
  {
    id: "voulkos-sculptural",
    name: "Sculptural (Voulkos Style)",
    origin: "USA",
    era: "1950s – present",
    description:
      "Peter Voulkos shattered the boundary between pottery and sculpture. Stacked, torn, and punctured vessels that carry the energy of Abstract Expressionism — clay as gesture, form as argument.",
    characteristics: [
      "large scale",
      "gestural marks",
      "punctured or torn surfaces",
      "stacked forms",
      "raw energy",
      "abstract expressionist influence",
    ],
    colorPalette: ["#1c1c1c", "#8c5a3c", "#c87840", "#3c2c1c", "#e8c8a0", "#604028"],
    suggestedGlazes: [
      "Iron-saturate drips and pours",
      "Raw fire marks, unglazed sections",
      "Ash and flashing slips",
    ],
    formLanguage:
      "Large, assertive forms that defy function — stacked elements, deep cuts, dramatic surface breaks; the vessel as pretext for sculpture",
  },
  {
    id: "korean-moon-jar",
    name: "Korean Moon Jar",
    origin: "Korea",
    era: "17th–18th century Joseon – present",
    description:
      "The Joseon Dynasty moon jar — two half-spheres joined into an imperfect whole — embodies the Korean aesthetic of buncheong: unhurried, humble, luminously white. Imperfection is not a flaw but the source of warmth.",
    characteristics: [
      "large rounded form",
      "soft white glaze",
      "subtle asymmetry",
      "thick walls",
      "quiet presence",
      "buncheong tradition",
    ],
    colorPalette: ["#f5f0ea", "#e8dfd2", "#d4c8b8", "#c0b0a0", "#a89080", "#f8f4ee"],
    suggestedGlazes: [
      "Milky white porcelain glaze",
      "Pale blue-white with iron spotting",
      "Unglazed with natural wood-ash blush",
    ],
    formLanguage:
      "Large spherical or near-spherical forms assembled from two joined halves, allowed to sag and settle naturally; a fullness that breathes like a slow inhale",
  },
  {
    id: "oribe",
    name: "Oribe",
    origin: "Japan",
    era: "Late 16th century – present",
    description:
      "Named for the tea master Furuta Oribe, this iconoclastic Momoyama-era style delights in irregular shapes, bold green and black glazes, and playful geometric painting. A deliberate break from Raku's quietude into something stranger and more alive.",
    characteristics: [
      "bold green copper glaze",
      "black iron glaze",
      "geometric painted decoration",
      "irregular distorted forms",
      "white areas with painting",
      "playful asymmetry",
    ],
    colorPalette: ["#2d7a3a", "#1a1a1a", "#f0e8d0", "#8b3a14", "#4a8c50", "#d4c090"],
    suggestedGlazes: [
      "Oribe green copper glaze",
      "Paired black and green",
      "White slip with painted iron brushwork",
    ],
    formLanguage:
      "Deliberately warped and irregular shapes — trays, bowls, water containers — that celebrate the quirky and unexpected while maintaining functional purpose",
  },
  {
    id: "mino-ware",
    name: "Mino Ware",
    origin: "Japan (Gifu Prefecture)",
    era: "16th century – present",
    description:
      "The kilns of Mino produced some of Japan's most beloved ceramics: Shino, Oribe, Yellow Seto, and Black Seto. Together these traditions represent a golden era of Japanese ceramic innovation tied to the tea ceremony.",
    characteristics: [
      "Shino white feldspar glaze",
      "yellow seto ochre glaze",
      "wood-fired",
      "tea ceremony forms",
      "controlled irregularity",
      "iron-painted decoration",
    ],
    colorPalette: ["#f5f0e8", "#e8c060", "#8c4a20", "#3c2c14", "#c8a868", "#f0e0c0"],
    suggestedGlazes: [
      "Shino feldspar white with red flashing",
      "Yellow Seto with iron decoration",
      "Black Seto iron glaze",
    ],
    formLanguage:
      "Tea bowls, water jars, dishes — forms that carry both ruggedness and refinement, surfaces that record the fire, decoration that breathes",
  },
  {
    id: "soda-fired",
    name: "Soda Fired",
    origin: "Contemporary (USA / International)",
    era: "1990s – present",
    description:
      "Soda firing creates unpredictable, atmospheric surfaces as sodium carbonate is introduced into a hot kiln. Each piece emerges unique — flushed with orange and pink, marked by flashing and halos of color at clay-to-glaze boundaries.",
    characteristics: [
      "atmospheric surface variation",
      "flashing and blush",
      "orange peel texture",
      "color from kiln placement",
      "subtle gradient effects",
      "functional or sculptural",
    ],
    colorPalette: ["#e8906a", "#c4d8e8", "#f0c890", "#d8a878", "#a8c4d4", "#e0b090"],
    suggestedGlazes: [
      "Simple slip that catches soda flashing",
      "Light ash glaze receptive to soda",
      "Bare clay with strategic wax resist",
    ],
    formLanguage:
      "Forms designed with surface in mind — gentle curves that catch soda deposits, areas left bare to blush in the fire, textural marks that invite the flame",
  },
  {
    id: "contemporary-minimalist",
    name: "Contemporary Minimalist",
    origin: "International",
    era: "2000s – present",
    description:
      "Spare, precise, and deeply considered. Minimalist ceramics strip away the decorative to reveal pure form — the curve of a wall, the weight of a base, the quality of a matte surface. Less as more, always.",
    characteristics: [
      "minimal decoration",
      "matte glazes",
      "precise proportions",
      "neutral colors",
      "geometric clarity",
      "surface perfection",
    ],
    colorPalette: ["#e8e4de", "#d0cac2", "#b8b0a8", "#a09890", "#888078", "#f0ede8"],
    suggestedGlazes: [
      "Matte white or off-white",
      "Satin light grey",
      "Matte warm beige",
      "Dry speckled matte",
    ],
    formLanguage:
      "Precise cylindrical or ovoid forms with careful proportions, minimal foot rings, unadorned surfaces that invite the eye to rest in the form itself",
  },
  {
    id: "folk-pottery",
    name: "Folk Pottery",
    origin: "International (Appalachia, Southern US, Mexico, Portugal)",
    era: "17th century – present",
    description:
      "Folk pottery carries the spirit of community and daily life. Utilitarian in origin but elevated by generations of practice, these wares have a directness and vitality that academic studio pottery sometimes lacks.",
    characteristics: [
      "utilitarian forms",
      "alkaline glazes",
      "salt glazed tradition",
      "Albany slip",
      "cobalt blue decoration",
      "face jugs",
    ],
    colorPalette: ["#8b5a2b", "#4a7a4a", "#2b4a8b", "#c8a064", "#1a1a1a", "#d4b880"],
    suggestedGlazes: [
      "Alkaline ash glaze (green or brown)",
      "Albany slip dark brown",
      "Salt glaze with cobalt blue decoration",
    ],
    formLanguage:
      "Jugs, crocks, churns, face vessels — forms shaped by generations of use and need, decoration that tells stories, surfaces worn with the character of time",
  },
  {
    id: "wood-fired-ash",
    name: "Wood Fired Ash",
    origin: "Japan / USA / International",
    era: "Ancient – present",
    description:
      "Anagama and noborigama kilns burn for days; the wood ash settles on forms and melts into natural glazes of extraordinary beauty. Each piece is a collaboration with fire, time, and the specific wood that fed the kiln.",
    characteristics: [
      "natural ash glaze",
      "fire marks and scorch",
      "long firing cycles",
      "toasted surfaces",
      "vitrified clay",
      "built-up ash deposits",
    ],
    colorPalette: ["#6e4a2e", "#3c2c1c", "#c8905a", "#8c6840", "#f0d8b0", "#4a3828"],
    suggestedGlazes: [
      "Natural wood ash (no applied glaze)",
      "Light slip that catches fly ash",
      "Iron-rich slip with ash overlay",
    ],
    formLanguage:
      "Strong, elemental forms built for long kilns — squared shoulders, generous foot rings, surfaces left open to receive what the fire brings",
  },
  {
    id: "mediterranean-earthenware",
    name: "Mediterranean Earthenware",
    origin: "Greece, Turkey, Morocco, Spain",
    era: "Ancient – present",
    description:
      "The warm terracotta tradition of the Mediterranean basin — olives stored in amphorae, water cooled in unglazed pots, tagines steaming over coals. These pots are inseparable from the landscapes that made them.",
    characteristics: [
      "terracotta red body",
      "unglazed or partially glazed",
      "functional forms",
      "sgraffito decoration",
      "stamped patterns",
      "burnished surfaces",
    ],
    colorPalette: ["#c8603a", "#a84828", "#e89060", "#8c4820", "#d4845a", "#f0c0a0"],
    suggestedGlazes: [
      "Partial clear glaze on interior only",
      "Lead-free copper green glaze",
      "Burnished slip, unglazed",
    ],
    formLanguage:
      "Amphorae, tagines, bowls, storage jars — forms that have not changed much because they work; geometry shaped by function, decorated with the patterns of daily life",
  },
  {
    id: "pacific-northwest-coast",
    name: "Pacific Northwest Coast",
    origin: "Pacific Northwest, USA / Canada",
    era: "Contemporary",
    description:
      "The lush rainforest edge between mountain and sea inspires ceramics of deep greens, slate blues, and organic forms. Influenced by the First Nations traditions of the region and the extraordinary natural landscape.",
    characteristics: [
      "deep forest greens",
      "slate blue-grey glazes",
      "organic forms",
      "fluid surfaces",
      "textural references to bark and stone",
      "Northwest Coast motifs",
    ],
    colorPalette: ["#2c5a4a", "#4a7868", "#8cb0a0", "#1a3428", "#90b8a8", "#c8d8d0"],
    suggestedGlazes: [
      "Deep forest green with iron spots",
      "Slate blue with copper blue flashes",
      "Textured ash grey-green",
    ],
    formLanguage:
      "Organic forms that reference the natural world — carved or modeled surfaces evoking bark, stone, water; forms that could have washed up on a rocky beach",
  },
];

// ─── Style Matching ───────────────────────────────────────────────────────────

// Keyword map for matching descriptions to styles
const STYLE_KEYWORDS: Record<string, string[]> = {
  "song-celadon": ["celadon", "chinese", "jade", "green", "delicate", "refined", "Song", "carved", "lotus", "quiet"],
  "jomon": ["ancient", "primitive", "primal", "textured", "cord", "flame", "japanese", "Jomon", "prehistoric", "rough"],
  "raku": ["raku", "tea", "wabi", "imperfect", "japanese", "fire", "irregular", "ceremony", "immediate", "smoke"],
  "majolica": ["majolica", "maiolica", "italian", "painted", "colorful", "mediterranean", "tin", "renaissance", "blue", "cobalt"],
  "leach-studio": ["studio", "leach", "functional", "tenmoku", "hamada", "utilitarian", "stoneware", "british", "East", "West"],
  "voulkos-sculptural": ["sculptural", "abstract", "voulkos", "expressive", "bold", "large", "torn", "stacked", "gestural", "modern"],
  "korean-moon-jar": ["moon jar", "korean", "joseon", "white", "round", "sphere", "buncheong", "milky", "large", "minimal"],
  "oribe": ["oribe", "green", "japanese", "irregular", "geometric", "playful", "distorted", "tea"],
  "mino-ware": ["shino", "mino", "japanese", "seto", "oribe", "tea", "wood fired", "feldspar", "traditional"],
  "soda-fired": ["soda", "atmospheric", "blush", "orange", "flashing", "contemporary", "flash", "kiln"],
  "contemporary-minimalist": ["minimal", "minimalist", "modern", "clean", "simple", "matte", "neutral", "precise", "spare"],
  "folk-pottery": ["folk", "traditional", "utilitarian", "salt", "appalachian", "face jug", "alkaline", "country", "practical"],
  "wood-fired-ash": ["wood fire", "anagama", "ash", "wood", "fired", "natural", "kiln", "flame", "mark", "ancient"],
  "mediterranean-earthenware": ["terracotta", "mediterranean", "moroccan", "greek", "turkish", "earthenware", "tagine", "warm", "rustic", "amphorae"],
  "pacific-northwest-coast": ["northwest", "pacific", "forest", "green", "organic", "coastal", "rain", "nature", "bark", "stone"],
};

export function matchStyleToDescription(description: string): CeramicStyle[] {
  const lower = description.toLowerCase();
  const scores: Record<string, number> = {};

  for (const style of CERAMIC_STYLES) {
    scores[style.id] = 0;
  }

  for (const [styleId, keywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        scores[styleId] = (scores[styleId] ?? 0) + 1;
      }
    }
  }

  return CERAMIC_STYLES
    .filter((s) => scores[s.id] > 0)
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    .slice(0, 3);
}
