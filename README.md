# 🍳 Yemek Koçu

AI destekli sosyal yemek yapma ve tarif uygulaması. Aile planlama, gamification ve mentor özellikler ile yemek yapma deneyimini yeniden tanımlıyor.

## ✨ Özellikler

### 🤖 AI Özellikleri
- **AI Mentor Modu**: Adım adım görsel kontrol ve geri bildirim
- **"Hey Koç" Sesli Asistan**: Hands-free yemek pişirme deneyimi
- **Günlük Menü Önerileri**: AI tarafından oluşturulan dengeli yemek kombinasyonları
- **Görsel Analiz**: Kesme teknikleri, kıvam kontrolü ve pişirme derecesi kontrolü

### 👨‍👩‍👧‍👦 Aile Özellikleri
- **Haftalık Planlama**: AI destekli aile menü planlaması
- **Grup Kararları**: "Bu akşam ne yesek?" oylaması
- **Paylaşımlı Alışveriş**: Aile üyeleri arası market listesi
- **Beslenme Takibi**: Aile üyelerinin beslenme hedefleri ve tercihleri

### 🏆 Gamification
- **Rozet Sistemi**: Mutfak becerilerinizi geliştirirken rozetler kazanın
- **Başarı Takibi**: İlerlemenizi takip edin ve hedefler belirleyin
- **Sosyal Etkileşim**: Diğer kullanıcıları takip edin ve deneyimlerinizi paylaşın

### 🔍 Akıllı Keşfet
- **Malzeme Bazlı Arama**: "Elimdekilerle" yemek yapın
- **Kategori Bazlı Filtreleme**: 15 dakikada, öğrenci dostu, bütçe dostu tarifler
- **Beslenme Filtresi**: Kalori, makro besin değerleri, diyet türleri

## 🏗️ Teknoloji Stack'i

### Frontend
- **React Native** (iOS/Android)
- **React** (Web)
- **TypeScript**
- **Tailwind CSS** (Web)
- **React Navigation**
- **React Hook Form**

### State Management
- **Zustand** (Global state)
- **TanStack Query** (Server state)

### Backend
- **Node.js** + **NestJS**
- **PostgreSQL** (Ana veritabanı)
- **Redis** (Cache)
- **AWS S3** (Medya depolama)

### AI Entegrasyonu
- **OpenAI Vision API** (Görsel analiz)
- **Whisper API** (Ses tanıma)
- **Custom ML Models** (Yemek tanıma)

## 📁 Proje Yapısı

```
yemek-kocu/
├── docs/                       # Dokümantasyon
│   └── PROJECT_DOCUMENTATION.md
├── mobile/                     # React Native app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── recipe/
│   │   │   ├── user/
│   │   │   ├── ai/
│   │   │   ├── family/
│   │   │   └── achievement/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   └── constants/
│   └── package.json
├── web/                        # React web app
├── backend/                    # NestJS API
├── shared/                     # Paylaşılan tipler ve utils
└── .cursorrules               # Cursor AI kuralları
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- React Native CLI
- iOS Simulator / Android Emulator
- PostgreSQL
- Redis

### Kurulum Adımları

1. **Projeyi klonlayın**
```bash
git clone https://github.com/[username]/yemek-kocu.git
cd yemek-kocu
```

2. **Dependencies yükleyin**
```bash
# Backend
cd backend && npm install

# Mobile
cd ../mobile && npm install

# Web
cd ../web && npm install
```

3. **Environment variables ayarlayın**
```bash
# Backend için .env dosyası oluşturun
cp backend/.env.example backend/.env
```

4. **Veritabanını kurun**
```bash
cd backend
npm run db:setup
npm run db:seed
```

5. **Uygulamayı başlatın**
```bash
# Backend
cd backend && npm run dev

# Mobile
cd mobile && npm run ios # veya npm run android

# Web
cd web && npm run dev
```

## 🛠️ Geliştirme Roadmap'i

### Faz 1: Temel Özellikler (3-4 ay)
- [x] Proje dokümantasyonu
- [x] Teknik spesifikasyonlar
- [ ] Kullanıcı auth sistemi
- [ ] Basic tarif CRUD
- [ ] Admin panel

### Faz 2: AI Özellikleri (2-3 ay)
- [ ] Görsel analiz entegrasyonu
- [ ] Sesli asistan
- [ ] AI mentor modu

### Faz 3: Sosyal & Aile (2-3 ay)
- [ ] Takip sistemi
- [ ] Aile planlama
- [ ] Rozet sistemi

## 🎯 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Commit Kuralları
Conventional Commits formatını kullanıyoruz:
- `feat:` - Yeni özellik
- `fix:` - Bug düzeltme
- `docs:` - Dokümantasyon
- `style:` - Kod formatı
- `refactor:` - Kod yeniden düzenleme
- `test:` - Test ekleme
- `chore:` - Diğer değişiklikler

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 📞 İletişim

- **GitHub**: [Proje Deposu](https://github.com/[username]/yemek-kocu)
- **Issues**: [GitHub Issues](https://github.com/[username]/yemek-kocu/issues)

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın! 