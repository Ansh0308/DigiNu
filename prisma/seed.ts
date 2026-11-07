import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const MENU_DATA = [
  {
    category: "Papad & Salad",
    subtitle: "Crispy appetizers & fresh garden salads",
    items: [
      { name: "Roasted Papad", price: 10, shortDescription: "Crispy fire-roasted lentil papadum", isVeg: true, dietary: ["VEGETARIAN", "VEGAN", "JAIN"] },
      { name: "Fried Papad", price: 20, shortDescription: "Deep-fried golden crunchy papad", isVeg: true, dietary: ["VEGETARIAN", "VEGAN"] },
      { name: "Masala Papad", price: 30, shortDescription: "Topped with freshly diced onions, tomatoes, coriander & chaat masala", isVeg: true, dietary: ["VEGETARIAN", "VEGAN", "SPICY"] },
      { name: "Cheese Masala Papad", price: 50, shortDescription: "Crunchy papad loaded with spiced salad and grated processed cheese", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Tomato Salad", price: 30, shortDescription: "Freshly sliced farm tomatoes with lemon and rock salt", isVeg: true, dietary: ["VEGETARIAN", "VEGAN", "JAIN"] },
      { name: "Green Salad", price: 40, shortDescription: "Crisp cucumber, carrots, tomatoes and onions with green chillies", isVeg: true, dietary: ["VEGETARIAN", "VEGAN"] },
    ],
  },
  {
    category: "Extra",
    subtitle: "Refreshing drinks, curd & traditional accompaniments",
    items: [
      { name: "Butter Milk", price: 15, shortDescription: "Chilled spiced traditional chaas with roasted cumin", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Cold Drinks", price: 20, shortDescription: "Assorted chilled carbonated beverages", isVeg: true, dietary: ["VEGETARIAN", "VEGAN"] },
      { name: "Mineral Water", price: 20, shortDescription: "Packaged purified drinking water (1L)", isVeg: true, dietary: ["VEGETARIAN", "VEGAN", "JAIN"] },
      { name: "Curd", price: 30, shortDescription: "Freshly set thick homemade creamy dahi", isVeg: true, dietary: ["VEGETARIAN", "JAIN"] },
      { name: "Sweet Lassi", price: 40, shortDescription: "Thick creamy churned yogurt sweetened with cardamom", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Salted Lassi", price: 40, shortDescription: "Savory whisked yogurt with black salt and toasted cumin", isVeg: true, dietary: ["VEGETARIAN"] },
    ],
  },
  {
    category: "Rice & Biryani",
    subtitle: "Aromatic long-grain basmati preparations & royal biryanis",
    items: [
      { name: "Plain Rice", price: 80, shortDescription: "Steamed fluffy long-grain basmati rice", isVeg: true, dietary: ["VEGETARIAN", "VEGAN", "JAIN"] },
      { name: "Jeera Rice", price: 90, shortDescription: "Fragrant basmati rice tempered with ghee and cumin seeds", isVeg: true, dietary: ["VEGETARIAN", "JAIN"] },
      { name: "Masala Rice", price: 120, shortDescription: "Basmati rice tossed with aromatic whole spices and herbs", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Veg. Pulao", price: 120, shortDescription: "Mildly spiced basmati rice simmered with garden vegetables", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Paneer Pulao", price: 150, shortDescription: "Fragrant pulao garnished with golden shallow-fried paneer cubes", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Veg. Biriyani", price: 140, shortDescription: "Layered dum biryani with assorted vegetables and saffron", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Handi Biriyani", price: 140, shortDescription: "Slow-cooked in a clay handi with rich Mughlai spices", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Veg. Hydrabadi Biriyani", price: 140, shortDescription: "Authentic Hyderabadi style spicy biryani with mint and fried onions", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Biriyani", price: 160, shortDescription: "Richly spiced dum biryani loaded with marinated soft paneer", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Red Apple Special", price: 180, shortDescription: "Chef's signature royal biryani with dry fruits, paneer and saffron", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
    ],
  },
  {
    category: "Dal",
    subtitle: "Slow-simmered lentils tempered with desi ghee",
    items: [
      { name: "Dal Fry", price: 100, shortDescription: "Yellow toor dal tempered with tomatoes, onions, garlic and spices", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Dal Tadka", price: 120, shortDescription: "Slow-cooked yellow lentils finished with a smoking ghee & dry red chilli tadka", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
    ],
  },
  {
    category: "Pavbhaji",
    subtitle: "Mumbai street style mashed vegetable bhaji with buttery pav",
    items: [
      { name: "Pavbhaji", price: 70, shortDescription: "Signature spiced mashed vegetable curry served with 2 soft butter pavs", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Butter Pavbhaji", price: 80, shortDescription: "Rich bhaji loaded with golden Amul butter, lemon and chopped onions", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Cheese Pavbhaji", price: 100, shortDescription: "Smothered in a generous snowfall of grated cheddar cheese", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Extra Pav", price: 10, shortDescription: "Pair of fresh pav toasted on the tava with Amul butter", isVeg: true, dietary: ["VEGETARIAN"] },
    ],
  },
  {
    category: "Soups",
    subtitle: "Warm, appetizing broths & comforting Indo-Chinese soups",
    items: [
      { name: "Tomato Soup", price: 70, shortDescription: "Velvety spiced ripe tomato soup served with crispy bread croutons", isVeg: true, dietary: ["VEGETARIAN", "JAIN"] },
      { name: "Manchurian Soup", price: 70, shortDescription: "Savory garlic broth packed with mini vegetable Manchurian dumplings", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Manchow Soup", price: 70, shortDescription: "Popular dark soya broth topped with a heap of crunchy fried noodles", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Veg. Noodles Soup", price: 70, shortDescription: "Clear vegetable soup simmered with fine noodles and Asian greens", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Hot & Sour Soup", price: 80, shortDescription: "Tangy and fiery pepper broth packed with shredded cabbage, carrots & mushrooms", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
    ],
  },
  {
    category: "Starters",
    subtitle: "Crisp tandoori bites & sizzling appetizer platters",
    items: [
      { name: "Manchurian Gravy", price: 100, shortDescription: "Crispy vegetable balls tossed in rich ginger, garlic and soy sauce gravy", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Manchurian Dry", price: 100, shortDescription: "Golden vegetable dumplings wok-tossed with spring onions and capsicum", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Dragon Potato", price: 120, shortDescription: "Crisp potato fingers glazed in spicy sweet chilli dragon sauce", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Mushroom Chilli Dry", price: 140, shortDescription: "Fresh button mushrooms wok-fried with fiery green chillies and bell peppers", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Veg. Crispy", price: 150, shortDescription: "Assorted battered garden vegetables fried ultra-crisp and tossed in Schezwan", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Chilli Gravy", price: 140, shortDescription: "Soft cottage cheese cubes in thick hot garlic soy chilli gravy", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Chilli Dry", price: 140, shortDescription: "Wok-tossed paneer cubes with bell peppers, onions and crushed black pepper", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Veg. Harabhara Kabab", price: 170, shortDescription: "Pan-fried patties made with spinach, green peas, potatoes and aromatic spices", isVeg: true, dietary: ["VEGETARIAN"] },
    ],
  },
  {
    category: "Chinese",
    subtitle: "Wok-tossed noodles, fried rice & oriental bhel",
    items: [
      { name: "Hakka Noodles", price: 100, shortDescription: "Classic wok-tossed noodles with shredded cabbage, carrots and capsicum", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Singapuri Noodles", price: 90, shortDescription: "Thin noodles tossed with mild curry powder and crunchy julienned veggies", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Manchurian Noodles", price: 110, shortDescription: "Noodles tossed together with mini vegetable Manchurian dumplings", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Schezwan Noodles", price: 100, shortDescription: "Fiery noodles wok-tossed in homemade spicy red Schezwan sauce", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Chinese Bhel", price: 110, shortDescription: "Crunchy fried noodles tossed with sweet chilli sauce and fresh shredded greens", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Veg. Choupsey", price: 100, shortDescription: "Crispy noodles crowned with sweet and sour vegetable gravy", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Veg. Fried Rice", price: 110, shortDescription: "Wok-fried long-grain basmati rice with finely diced seasonal vegetables", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Manchurian Fried Rice", price: 110, shortDescription: "Flavorful fried rice loaded with vegetable Manchurian balls", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Schezwan Fried Rice", price: 110, shortDescription: "Spicy wok-tossed rice with red chillies, garlic and Schezwan pepper", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Mushroom Fried Rice", price: 120, shortDescription: "Fragrant rice stir-fried with fresh button mushrooms and spring onions", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Tripple Fried Rice", price: 150, shortDescription: "Indo-Chinese feast: Fried rice, Hakka noodles, crispy noodles and Manchurian gravy", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
    ],
  },
  {
    category: "Paneer Ke Kamaal",
    subtitle: "Artisanal cottage cheese cooked in opulent Indian gravies",
    items: [
      { name: "Palak Paneer", price: 130, shortDescription: "Tender paneer cubes simmered in smooth spiced spinach gravy", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Paneer Tikka Masala", price: 130, shortDescription: "Charcoal-grilled paneer tikka tossed in robust tomato-onion masala", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Tawa Masala", price: 150, shortDescription: "Paneer cooked on an open flat tawa with crushed roasted spices", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Butter Masala", price: 150, shortDescription: "All-time favorite: Paneer cubes in velvety butter-laden makhani gravy", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Paneer Kadai", price: 150, shortDescription: "Cottage cheese and bell peppers cooked with freshly ground kadai coriander seeds", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Jalfrezi", price: 150, shortDescription: "Stir-fried paneer strips with colourful peppers, onions and tangy tomato gravy", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Handi", price: 160, shortDescription: "Slow-simmered in an earthen handi with aromatic whole spices and curd", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Shahi Paneer (Sweet)", price: 160, shortDescription: "Royal Mughlai preparation in rich, mildly sweet cashew-cream gravy", isVeg: true, dietary: ["VEGETARIAN", "JAIN"] },
      { name: "Paneer Toofani", price: 160, shortDescription: "Fiery and spicy red gravy with succulent cottage cheese blocks", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Begam Bahar", price: 170, shortDescription: "Chef's regal creation with stuffed paneer in a luxurious saffron-tinged gravy", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Paneer Chatpatta", price: 160, shortDescription: "Zesty, tangy and medium-spiced gravy with tender paneer pieces", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Bhurji", price: 160, shortDescription: "Crumbled fresh paneer tossed with onions, green chillies, tomatoes and herbs", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Paneer Pasanda", price: 160, shortDescription: "Stuffed paneer sandwiches shallow-fried and served in rich onion-cashew gravy", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Paneer Dhamaka", price: 170, shortDescription: "An explosive blend of hot spices and tender paneer for spicy food lovers", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Pativala", price: 170, shortDescription: "Punjabi style rich double-layered gravy served with roll paneer", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Paneer Angara", price: 180, shortDescription: "Smoky charcoal-infused spicy red gravy with marinated paneer", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Red Apple Special", price: 190, shortDescription: "Chef's ultimate signature preparation with three-gravy paneer extravaganza", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
    ],
  },
  {
    category: "Kaju Ka Kamaal",
    subtitle: "Decadent whole and roasted cashew curries",
    items: [
      { name: "Khoya Kaju (Sweet)", price: 180, shortDescription: "Roasted golden cashews simmered in rich sweet mawa and cream gravy", isVeg: true, dietary: ["VEGETARIAN", "JAIN"] },
      { name: "Kaju Curry (Spicy)", price: 180, shortDescription: "Whole roasted cashews cooked in fiery tomato-onion North Indian curry", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
      { name: "Kaju Butter Masala", price: 180, shortDescription: "Crispy cashews swimming in creamy butter makhani sauce", isVeg: true, dietary: ["VEGETARIAN"] },
      { name: "Kaju Paneer", price: 180, shortDescription: "Exquisite combination of soft cottage cheese and roasted cashew nuts", isVeg: true, dietary: ["VEGETARIAN", "SPICY"] },
    ],
  },
];

async function main() {
  console.log("🌱 Starting DigiNu database seed with authentic Red Apple Indian Menu...");

  const restaurantName = "Red Apple Restaurant";
  const restaurantSlug = "red-apple";
  const initialEmail = process.env.INITIAL_OWNER_EMAIL || "owner@bella-italia.com";
  const initialPassword = process.env.INITIAL_OWNER_PASSWORD || "TemporarySecurePassword123!";

  // 1. Seed or Update RestaurantProfile with INR currency
  const profile = await prisma.restaurantProfile.upsert({
    where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
    update: {
      name: restaurantName,
      slug: restaurantSlug,
      tagline: "Authentic Multi-Cuisine Indian Dining, Pavbhaji & Chinese Delicacies",
      aboutStory: "Serving authentic North Indian, sizzling starters, authentic Chinese, rich paneer specialties, and fresh pavbhaji prepared with premium ingredients and time-honored recipes.",
      address: "Station Road, Commercial Hub",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      currencyCode: "INR",
      currencySymbol: "₹",
      currencyPosition: "PREFIX",
      themePreset: "warm-cream",
      primaryColor: "#C85A32",
      accentColor: "#F59E0B",
    },
    create: {
      singletonKey: "RESTAURANT_PROFILE_SINGLETON",
      name: restaurantName,
      slug: restaurantSlug,
      tagline: "Authentic Multi-Cuisine Indian Dining, Pavbhaji & Chinese Delicacies",
      aboutStory: "Serving authentic North Indian, sizzling starters, authentic Chinese, rich paneer specialties, and fresh pavbhaji prepared with premium ingredients and time-honored recipes.",
      address: "Station Road, Commercial Hub",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      currencyCode: "INR",
      currencySymbol: "₹",
      currencyPosition: "PREFIX",
      themePreset: "warm-cream",
      primaryColor: "#C85A32",
      accentColor: "#F59E0B",
      aiCreditsBalance: 30,
      aiCreditsMonthlyLimit: 30,
    },
  });
  console.log(`✅ Configured RestaurantProfile: ${profile.name} (Currency: ${profile.currencySymbol} / ${profile.currencyCode})`);

  // 2. Seed Single OwnerAccount with bcrypt hash (salt rounds = 12)
  const passwordHash = await bcrypt.hash(initialPassword, 12);
  const owner = await prisma.ownerAccount.upsert({
    where: { singletonKey: "OWNER_ACCOUNT_SINGLETON" },
    update: {
      email: initialEmail.toLowerCase().trim(),
      passwordHash,
      isActive: true,
    },
    create: {
      singletonKey: "OWNER_ACCOUNT_SINGLETON",
      email: initialEmail.toLowerCase().trim(),
      passwordHash,
      fullName: "Restaurant General Manager",
      isActive: true,
    },
  });
  console.log(`✅ Seeded Single OwnerAccount: ${owner.email}`);

  // 3. Seed QRCodeConfig Singleton
  await prisma.qRCodeConfig.upsert({
    where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
    update: {},
    create: {
      singletonKey: "QR_CODE_CONFIG_SINGLETON",
      foregroundColor: "#000000",
      embedLogo: true,
      dotStyle: "rounded",
      downloadCount: 0,
    },
  });
  console.log("✅ Seeded QRCodeConfig singleton");

  // 4. Seed OperatingHours (7 days: Sunday=0 to Saturday=6)
  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: {
        dayOfWeek: day,
        openTime: "11:00",
        closeTime: "23:00",
        isClosed: false,
      },
    });
  }
  console.log("✅ Seeded 7 days OperatingHours (11:00 - 23:00)");

  // 5. Clean up old categories & items to ensure pristine catalog
  console.log("🧹 Clearing previous catalog items...");
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});

  // 6. Seed all 10 Categories and Food Items
  let totalItemsCount = 0;

  for (let catIndex = 0; catIndex < MENU_DATA.length; catIndex++) {
    const catData = MENU_DATA[catIndex];
    const category = await prisma.menuCategory.create({
      data: {
        name: catData.category,
        subtitle: catData.subtitle,
        displayOrder: catIndex,
        isActive: true,
      },
    });

    for (let itemIndex = 0; itemIndex < catData.items.length; itemIndex++) {
      const itemData = catData.items[itemIndex];
      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: itemData.name,
          price: itemData.price,
          shortDescription: itemData.shortDescription,
          isVegetarian: itemData.isVeg,
          dietaryFlags: itemData.dietary,
          allergenFlags: [],
          isAvailable: true,
          isVisible: true,
          isFeatured: itemData.name.includes("Special"),
          displayOrder: itemIndex,
        },
      });
      totalItemsCount++;
    }

    console.log(`  📁 [${catIndex + 1}/${MENU_DATA.length}] ${category.name} (${catData.items.length} dishes)`);
  }

  console.log(`\n🎉 DigiNu database seed completed: ${MENU_DATA.length} categories, ${totalItemsCount} dishes seeded with currency INR (₹).`);
  process.exit(0);
}

main()
  .catch((e) => {
    console.error("❌ Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
