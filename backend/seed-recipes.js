const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Özel ve orijinal tarifler - sıradan değil!
const specialRecipes = [
  {
    title: "Kremalı Mantarlı Tavuk Sote",
    description: "Yumuşacık tavuk parçaları, taze mantarlar ve krema ile hazırlanan lezzetli sote. Akşam yemeği için mükemmel bir seçim.",
    difficulty: "medium",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    cuisineType: "Türk-Fusion",
    categories: ["ana yemek", "tavuk", "kremalı"],
    caloriesPerServing: 380,
    nutritionInfo: {
      protein: 32,
      carbs: 8,
      fat: 24,
      fiber: 2
    },
    ingredients: [
      "600 gr tavuk göğsü (küp küp doğranmış)",
      "300 gr karışık mantar (champignon, istiridye)",
      "200 ml krema",
      "1 adet orta boy soğan",
      "3 diş sarımsak",
      "2 yemek kaşığı tereyağı",
      "1 yemek kaşığı zeytinyağı",
      "1 tatlı kaşığı kekik",
      "1 tatlı kaşığı biberiye",
      "Tuz, karabiber",
      "Taze maydanoz (servis için)"
    ],
    instructions: [
      "Tavuk etlerini küp küp doğrayın ve tuz, karabiber ile marine edin.",
      "Mantarları temizleyip dilimleyin, soğan ve sarımsağı ince doğrayın.",
      "Geniş bir tavada tereyağı ve zeytinyağını ısıtın.",
      "Tavuk etlerini tavaya alın ve her tarafı pembe olana kadar pişirin.",
      "Tavukları bir tabağa alın, aynı tavada soğanları kavurun.",
      "Sarımsak ve mantarları ekleyip 5 dakika soteleyin.",
      "Tavukları tekrar tavaya alın, kekik ve biberiye ekleyin.",
      "Kremayı döküp karıştırın, 10 dakika kısık ateşte pişirin.",
      "Tuz, karabiber ile tatlandırın ve maydanoz ile servis edin."
    ],
    images: ["https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Kremalı+Mantarlı+Tavuk"]
  },
  
  {
    title: "Ev Yapımı Bolonez Soslu Makarna",
    description: "İtalyan usulü hazırlanmış gerçek bolonez sosu ile makarna. Uzun pişirme süresi ile aromaların birleştiği muhteşem lezzet.",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 90,
    servings: 6,
    cuisineType: "İtalyan",
    categories: ["ana yemek", "makarna", "kıymalı"],
    caloriesPerServing: 450,
    nutritionInfo: {
      protein: 28,
      carbs: 52,
      fat: 18,
      fiber: 4
    },
    ingredients: [
      "500 gr spagetti",
      "400 gr dana kıyması",
      "100 gr pancetta veya pastırma (küp doğranmış)",
      "1 adet büyük soğan (ince doğranmış)",
      "2 adet havuç (küp doğranmış)",
      "2 adet kereviz sapı (ince doğranmış)",
      "4 diş sarımsak",
      "400 gr konserve domates (ezilmiş)",
      "2 yemek kaşığı domates salçası",
      "250 ml kırmızı şarap",
      "500 ml dana suyu veya tavuk suyu",
      "200 ml süt",
      "Taze fesleğen yaprakları",
      "Parmesan peyniri (rendelenmiş)",
      "Zeytinyağı, tuz, karabiber"
    ],
    instructions: [
      "Büyük bir tencerede zeytinyağını ısıtın, pancetta'yı çıtır olana kadar kavurun.",
      "Soğan, havuç ve kerevizi ekleyip yumuşayana kadar soteleyin (10 dk).",
      "Sarımsağı ekleyip 1 dakika karıştırın.",
      "Dana kıymasını ekleyip parçalanana kadar kavurun (8-10 dk).",
      "Domates salçasını ekleyip 2 dakika pişirin.",
      "Kırmızı şarabı döküp alkol buharlaşana kadar pişirin.",
      "Ezilmiş domatesleri ve dana suyunu ekleyin.",
      "Kaynayınca ateşi kısın ve 1 saat ara ara karıştırarak pişirin.",
      "Sütü ekleyip 15 dakika daha pişirin.",
      "Makarnayı al dente olana kadar pişirin, süzün.",
      "Sosla karıştırıp parmesan ve fesleğen ile servis edin."
    ],
    images: ["https://via.placeholder.com/400x300/DC143C/FFFFFF?text=Bolonez+Makarna"]
  },

  {
    title: "Fırında Parmesanlı Kabak Graten",
    description: "Katmanlar halinde dizilen kabaklar, krema ve parmesan peyniri ile fırında pişirilen nefis yan yemek.",
    difficulty: "easy",
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    cuisineType: "Fransız",
    categories: ["yan yemek", "sebze", "fırın"],
    caloriesPerServing: 220,
    nutritionInfo: {
      protein: 12,
      carbs: 15,
      fat: 14,
      fiber: 3
    },
    ingredients: [
      "1 kg kabak (ince dilimlenmiş)",
      "300 ml krema",
      "150 gr parmesan peyniri (rendelenmiş)",
      "100 gr gruyere peyniri (rendelenmiş)",
      "2 diş sarımsak (ezilmiş)",
      "2 yemek kaşığı tereyağı",
      "Taze kekik",
      "Muskat",
      "Tuz, beyaz biber"
    ],
    instructions: [
      "Fırını 180°C'ye ısıtın.",
      "Kabakları 5 mm kalınlığında dilimleyin, tuzlayıp 15 dk bekletin.",
      "Kabakları kağıt havlu ile kurulayın.",
      "Kremayı sarımsak, kekik, muskat, tuz ve biberle karıştırın.",
      "Fırın kabını tereyağı ile yağlayın.",
      "Kabak dilimlerini katmanlar halinde dizin.",
      "Her katman arasına krema karışımı ve peynir serpin.",
      "En üste bol parmesan serpip folyo ile örtün.",
      "30 dakika pişirin, son 15 dakika folyoyu açın.",
      "Üzeri altın sarısı olunca fırından çıkarın."
    ],
    images: ["https://via.placeholder.com/400x300/32CD32/FFFFFF?text=Kabak+Graten"]
  },

  {
    title: "Akdeniz Usulü Levrek Fileto",
    description: "Zeytinyağı, limon ve akdeniz otları ile marine edilmiş levrek filetosu. Hafif ve sağlıklı bir ana yemek.",
    difficulty: "easy",
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    cuisineType: "Akdeniz",
    categories: ["ana yemek", "balık", "sağlıklı"],
    caloriesPerServing: 280,
    nutritionInfo: {
      protein: 35,
      carbs: 4,
      fat: 12,
      fiber: 1
    },
    ingredients: [
      "4 adet levrek fileto (150 gr'lık)",
      "3 yemek kaşığı zeytinyağı",
      "2 adet limon suyu",
      "3 diş sarımsak (ince dilimlenmiş)",
      "1 demet taze dereotu",
      "1 demet taze maydanoz",
      "10 adet siyah zeytin",
      "200 gr kiraz domates (yarıya bölünmüş)",
      "1 adet kırmızı soğan (ince dilimlenmiş)",
      "Kekik, fesleğen",
      "Deniz tuzu, karabiber"
    ],
    instructions: [
      "Levrek filetolarını tuz ve karabiber ile marine edin.",
      "Zeytinyağı, limon suyu, sarımsak ve otları karıştırın.",
      "Balıkları bu karışımda 20 dakika marine edin.",
      "Tavayı orta ateşte ısıtın, az zeytinyağı ekleyin.",
      "Balıkları deri tarafı aşağı gelecek şekilde koyun.",
      "3-4 dakika pişirin, çevirin ve 2 dakika daha pişirin.",
      "Balıkları tabağa alın, aynı tavada soğanları soteleyin.",
      "Kiraz domatesleri ve zeytinleri ekleyip 2 dakika karıştırın.",
      "Marine sosunu döküp 1 dakika kaynatın.",
      "Balıkların üzerine döküp taze otlarla servis edin."
    ],
    images: ["https://via.placeholder.com/400x300/4169E1/FFFFFF?text=Levrek+Fileto"]
  },

  {
    title: "Trüflü Mantarlı Risotto",
    description: "İtalyan Arborio pirinci ile hazırlanan kremalı risotto. Trüf yağı ve parmesan ile lüks bir lezzet deneyimi.",
    difficulty: "hard",
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    cuisineType: "İtalyan",
    categories: ["ana yemek", "pirinç", "premium"],
    caloriesPerServing: 420,
    nutritionInfo: {
      protein: 16,
      carbs: 58,
      fat: 16,
      fiber: 2
    },
    ingredients: [
      "300 gr Arborio pirinci",
      "1 lt sıcak tavuk suyu",
      "200 gr karışık mantar (porcini, champignon)",
      "1 adet soğan (ince doğranmış)",
      "2 diş sarımsak",
      "125 ml beyaz şarap",
      "100 gr parmesan peyniri",
      "3 yemek kaşığı tereyağı",
      "2 yemek kaşığı zeytinyağı",
      "1 yemek kaşığı trüf yağı",
      "Taze maydanoz",
      "Tuz, beyaz biber"
    ],
    instructions: [
      "Tavuk suyunu sürekli sıcak tutun.",
      "Mantarları temizleyip dilimleyin, tavada tereyağı ile soteleyin.",
      "Ayrı bir tencerede zeytinyağını ısıtın, soğanı kavurun.",
      "Sarımsağı ekleyip 1 dakika karıştırın.",
      "Pirinci ekleyip şeffaf olana kadar kavurun (2-3 dk).",
      "Şarabı döküp buharlaşana kadar karıştırın.",
      "Sıcak suyu kepçe kepçe ekleyip sürekli karıştırın.",
      "Her kepçe suyu iyice emildikten sonra yenisini ekleyin (18-20 dk).",
      "Pirinç al dente olunca mantarları ekleyin.",
      "Ateşten alın, parmesan ve kalan tereyağını ekleyin.",
      "Trüf yağı ve maydanoz ile servis edin."
    ],
    images: ["https://via.placeholder.com/400x300/DAA520/FFFFFF?text=Trüflü+Risotto"]
  },

  {
    title: "Thai Usulü Köri Soslu Karides",
    description: "Hindistan cevizi sütü, kırmızı köri ve taze otlarla hazırlanan egzotik karides yemeği. Jasmin pirinci ile servis edilir.",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    cuisineType: "Tayland",
    categories: ["ana yemek", "deniz ürünü", "baharatlı"],
    caloriesPerServing: 340,
    nutritionInfo: {
      protein: 28,
      carbs: 12,
      fat: 22,
      fiber: 3
    },
    ingredients: [
      "500 gr büyük karides (temizlenmiş)",
      "400 ml hindistan cevizi sütü",
      "2 yemek kaşığı kırmızı köri ezmesi",
      "1 adet kırmızı biber (julyen)",
      "1 adet sarı biber (julyen)",
      "100 gr taze fasulye (uçları alınmış)",
      "1 adet soğan (dilimlenmiş)",
      "3 diş sarımsak",
      "2 cm taze zencefil",
      "2 adet lime (suyu)",
      "2 yemek kaşığı balık sosu",
      "1 yemek kaşığı esmer şeker",
      "Taze fesleğen ve nane",
      "Kırmızı biber",
      "Hindistan cevizi yağı"
    ],
    instructions: [
      "Karidesleri tuz ve karabiber ile marine edin.",
      "Tavada hindistan cevizi yağını ısıtın, köri ezmesini kavurun.",
      "Soğan, sarımsak ve zencefili ekleyip 3 dakika soteleyin.",
      "Hindistan cevizi sütünün yarısını ekleyip kaynatın.",
      "Biberleri ve fasulyeları ekleyip 5 dakika pişirin.",
      "Karidesleri ekleyip 3-4 dakika pişirin.",
      "Kalan hindistan cevizi sütü, balık sosu ve şekeri ekleyin.",
      "Lime suyu ile tatlandırın ve 2 dakika daha pişirin.",
      "Taze otlar ve kırmızı biber ile süsleyip servis edin.",
      "Jasmin pirinci ile birlikte sıcak servis yapın."
    ],
    images: ["https://via.placeholder.com/400x300/FF6347/FFFFFF?text=Thai+Karides"]
  }
];

async function seedRecipes() {
  try {
    console.log('🌱 Özel tarifler ekleniyor...');

    // Admin kullanıcısı oluştur (eğer yoksa)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@yemekkocu.com' },
      update: {},
      create: {
        email: 'admin@yemekkocu.com',
        username: 'yemekkocu_admin',
        name: 'Yemek Koçu',
        password: adminPassword,
        bio: 'Yemek Koçu resmi hesabı - En lezzetli tariflerin adresi!'
      }
    });

    console.log('👨‍🍳 Admin kullanıcı hazır:', adminUser.username);

    // alirtaskiran kullanıcısı ekleniyor
    const alirizaPassword = await bcrypt.hash('Ali3838!!', 10);
    const alirizaUser = await prisma.user.upsert({
      where: { email: 'alirtaskiran@gmail.com' },
      update: {},
      create: {
        email: 'alirtaskiran@gmail.com',
        username: 'alirtaskiran',
        name: 'Ali Rıza Taşkıran',
        password: alirizaPassword,
        bio: 'Yemek Koçu gerçek admini',
        isAdmin: true
      }
    });
    console.log('👨‍💻 alirtaskiran admin kullanıcı hazır:', alirizaUser.username);

    // Tarifleri ekle
    for (const recipeData of specialRecipes) {
      // Aynı başlığa sahip tarif var mı kontrol et
      const existing = await prisma.recipe.findFirst({
        where: { title: recipeData.title }
      });
      if (existing) {
        console.log(`⚠️  "${recipeData.title}" zaten var, atlanıyor.`);
        continue;
      }
      const recipe = await prisma.recipe.create({
        data: {
          userId: adminUser.id,
          title: recipeData.title,
          description: recipeData.description,
          difficulty: recipeData.difficulty,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          servings: recipeData.servings,
          cuisineType: recipeData.cuisineType,
          categories: JSON.stringify(recipeData.categories),
          caloriesPerServing: recipeData.caloriesPerServing,
          nutritionInfo: JSON.stringify(recipeData.nutritionInfo),
          ingredients: JSON.stringify(recipeData.ingredients),
          instructions: JSON.stringify(recipeData.instructions),
          images: JSON.stringify(recipeData.images),
          isApproved: true // Admin tarifler otomatik onaylı
        }
      });
      console.log(`✅ "${recipe.title}" tarifi eklendi`);
    }

    console.log('🎉 Tüm özel tarifler başarıyla eklendi!');
    console.log(`📊 Toplam ${specialRecipes.length} tarif veritabanına kaydedildi.`);

  } catch (error) {
    console.error('❌ Tarif ekleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
seedRecipes(); 