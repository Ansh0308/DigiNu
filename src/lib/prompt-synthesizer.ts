/**
 * DigiNu — Culinary Prompt Synthesizer
 *
 * Synthesizes studio-grade food photography prompts from dish metadata,
 * culinary attributes, category context, and authentic Indian dining plating rules.
 *
 * Invariant: Produces structured photographic directives targeting
 * Cloudflare Workers AI flux-1-schnell model.
 */

export interface DishPromptInput {
  name: string;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  dietaryFlags?: string[];
}

/**
 * Returns specialized authentic Indian presentation directives based on dish keywords.
 */
function getIndianCulinaryDirectives(dishName: string, category: string): string {
  const text = `${dishName} ${category}`.toLowerCase();

  if (text.includes("biryani") || text.includes("pulao") || text.includes("rice")) {
    return "served in a royal Indian copper handi with brass handles, aromatic long-grain basmati rice with vibrant saffron streaks, crowned with crispy golden fried onions (birista) and fresh mint leaves, side of cucumber raita and sliced lemon, luxury royal Indian dining";
  }

  if (text.includes("paneer") || text.includes("kadai") || text.includes("handi") || text.includes("masala") || text.includes("shahi") || text.includes("palak")) {
    return "served in an authentic hammered Indian copper handi, rich velvety glossy gravy, soft succulent paneer cubes, drizzled with a delicate swirl of fresh malai (cream), garnished with finely julienned ginger and chopped fresh green coriander, warm tandoori roti nearby, premium Indian restaurant presentation";
  }

  if (text.includes("dal") || text.includes("tadka") || text.includes("fry")) {
    return "served in an authentic Indian copper serving bowl, golden yellow lentils topped with a sizzling aromatic desi ghee tadka of cumin seeds, garlic slivers, and whole dried red chilies, sprinkled with fresh cilantro, steam rising, traditional authentic Indian dhaba style";
  }

  if (text.includes("pavbhaji") || text.includes("pav bhaji")) {
    return "authentic Mumbai street-style pavbhaji in a shallow platter, rich red spiced bhaji crowned with a large melting slab of butter, finely chopped red onions and fresh cilantro on top, paired with golden butter-toasted fluffy pav buns and lime wedges";
  }

  if (text.includes("manchurian") || text.includes("noodles") || text.includes("fried rice") || text.includes("chinese") || text.includes("choupsey")) {
    return "authentic Indo-Chinese restaurant presentation in a modern matte black bowl, vibrant stir-fried bell peppers, chopped spring onion greens, glossy dark chili garlic sauce glaze, light steam rising, appetizing texture";
  }

  if (text.includes("kabab") || text.includes("kebab") || text.includes("crispy") || text.includes("chilli dry") || text.includes("starter")) {
    return "sizzling tandoori starter platter, charred tandoor grill marks, vibrant natural spices, accompanied by fresh spicy green mint chutney, thin red onion rings, and lime wedge, fine dining Indian restaurant plating";
  }

  if (text.includes("lassi") || text.includes("butter milk") || text.includes("chaas") || text.includes("curd")) {
    return "served in an authentic Indian rustic earthen clay kulhad (matka), thick creamy rich froth on top, garnished with crushed green pistachios, saffron strands, and crushed cardamom, condensation on clay surface, chilled and refreshing";
  }

  if (text.includes("soup") || text.includes("manchow")) {
    return "steaming hot restaurant soup served in a rustic stoneware bowl, topped with crispy fried noodles, fresh herbs, rich glossy broth, aromatic steam gently rising";
  }

  if (text.includes("papad") || text.includes("salad")) {
    return "crispy roasted Indian papad with authentic blistered bubbles, dusted with red chili and chaat masala, served with colorful sliced cucumber, red tomatoes, and fresh lemon wedges on a handcrafted brass platter";
  }

  return "authentic Indian restaurant presentation, served in traditional hammered copper or brass tableware, rich authentic spices, fresh coriander garnish, warm golden hour ambient lighting, delicate rising steam";
}

export function synthesizeCulinaryPrompt(
  item: DishPromptInput,
  categoryName?: string
): string {
  const dishName = item.name.trim();
  const descRaw = (item.shortDescription || item.detailedDescription || "").trim();
  const description = descRaw.length > 80 ? `${descRaw.substring(0, 80)}...` : descRaw;

  const category = categoryName ? categoryName.trim() : "";
  const indianStyling = getIndianCulinaryDirectives(dishName, category);

  const dietaryContext =
    item.dietaryFlags && item.dietaryFlags.length > 0
      ? `(${item.dietaryFlags.join(", ")} preparation)`
      : "";

  const categoryContext = categoryName ? `Category: ${categoryName.trim()}` : "";

  const promptParts = [
    `Award-winning commercial food photography of authentic Indian dish "${dishName}"`,
    description ? `featuring ${description}` : "",
    indianStyling,
    "45-degree overhead angle, macro culinary lighting",
    "fresh garnish, vibrant textures, restaurant-quality presentation",
    "warm natural side lighting, subtle candlelight bokeh in background, shallow depth of field, food magazine style",
    "photorealistic, 8k resolution, appetizing culinary steam",
    dietaryContext,
    categoryContext,
    "--no plastic, cartoon, blurry, distorted, raw ingredients, artificial looking, watermark, text, logo, fingers, human hands",
  ];

  return promptParts.filter(Boolean).join(", ");
}
