# 🤖 AI Tarif Kalite Kontrol Sistemi Dokümantasyonu

## 📋 **Genel Bakış**
Kullanıcıların eklediği tarifleri arka planda otomatik olarak analiz eden AI sistemi. Kalite kontrolü, spam tespiti ve kullanıcı deneyimini iyileştirme amaçlı.

---

## 🔍 **Analiz Kategorileri**

### 1. **📝 Metin Kalite Analizi**

#### **Yazım ve Dilbilgisi**
- Türkçe yazım kuralları kontrolü
- Noktalama işaretleri
- Büyük/küçük harf kullanımı
- Cümle yapısı ve akıcılık

#### **İçerik Kalitesi**
- Tarif başlığı ile içerik uyumu
- Anlaşılır ve net talimatlar
- Eksik bilgi tespiti (süre, sıcaklık, porsiyon)
- Teknik terimler doğru kullanılmış mı?

#### **Spam ve Uygunsuz İçerik**
- Reklam içeriği (marka adları, linkler)
- Spam kelimeler ve tekrarlar
- Küfür, hakaret, argo ifadeler
- Alakasız içerik (yemek dışı konular)
- Kişisel bilgi paylaşımı

---

### 2. **🥘 Tarif Mantık Kontrolü**

#### **Malzeme Analizi**
- Malzeme miktarları gerçekçi mi?
- Malzemeler birbirine uyumlu mu?
- Eksik temel malzemeler var mı?
- Saçma malzeme kombinasyonları (örn: 1 kg tuz)

#### **Süre ve Zorluk Değerlendirmesi**
- Hazırlık süresi gerçekçi mi?
- Pişirme süresi mantıklı mı?
- Zorluk seviyesi tarif ile uyumlu mu?
- Toplam süre hesabı doğru mu?

#### **Pişirme Teknikleri**
- Sıcaklık değerleri doğru mu?
- Pişirme yöntemleri uygun mu?
- Sıralama mantıklı mı? (önce doğrama, sonra pişirme)
- Güvenlik uyarıları gerekli mi?

---

### 3. **🌍 Mutfak Kategorisi Tespiti**

#### **Otomatik Kategorizasyon**
- **Türk Mutfağı**: Döner, kebap, pilav, börek, baklava
- **İtalyan Mutfağı**: Pizza, makarna, risotto, tiramisu
- **Uzak Doğu**: Sushi, ramen, pad thai, dim sum
- **Akdeniz**: Hummus, falafel, tabule, moussaka
- **Amerikan**: Burger, hot dog, pancake, cheesecake
- **Fransız**: Croissant, quiche, ratatouille, crème brûlée

#### **Kategori Doğrulama**
- Kullanıcının seçtiği kategori doğru mu?
- Malzemeler kategoriye uygun mu?
- Pişirme teknikleri tipik mi?

---

### 4. **📸 Görsel Kalite Analizi**

#### **Fotoğraf Kalitesi**
- Çözünürlük yeterli mi? (min 800x600)
- Bulanıklık seviyesi
- Aydınlatma kalitesi
- Renk dengesi ve doygunluk

#### **İçerik Uygunluğu**
- Gerçekten yemek fotoğrafı mı?
- Tarif ile fotoğraf uyumlu mu?
- Sunum kalitesi nasıl?
- Uygunsuz görsel var mı?

#### **Teknik Kontroller**
- Fotoğraf formatı destekleniyor mu?
- Dosya boyutu uygun mu?
- EXIF verisi temiz mi?

---

### 5. **🔢 Beslenme Değerleri**

#### **Kalori Hesabı**
- Malzeme bazlı kalori hesaplama
- Porsiyon başına kalori
- Gerçekçi değerler mi?

#### **Besin Değerleri**
- Protein, karbonhidrat, yağ oranları
- Vitamin ve mineral içeriği
- Diyet uyumluluğu (vegan, glutensiz vb.)

---

## ⚙️ **Teknik Uygulama**

### **AI Servisleri**
```javascript
// Örnek AI Pipeline
const recipeAnalyzer = {
  textAnalysis: "OpenAI GPT-4 Turbo",
  imageAnalysis: "Google Vision API",
  spamDetection: "Azure Content Moderator",
  nutritionAPI: "Edamam Food Database"
};
```

### **Puanlama Sistemi**
```javascript
const qualityScore = {
  textQuality: 0-100,      // Yazım, dilbilgisi, anlaşılırlık
  recipeLogic: 0-100,      // Mantık, tutarlılık
  imageQuality: 0-100,     // Görsel kalite
  contentSafety: 0-100,    // Spam, uygunsuz içerik
  categoryAccuracy: 0-100  // Kategori doğruluğu
};

// Genel kalite puanı
const overallScore = (textQuality + recipeLogic + imageQuality + contentSafety + categoryAccuracy) / 5;
```

### **Aksiyonlar**
- **90-100 puan**: Otomatik onay, öne çıkar
- **70-89 puan**: Otomatik onay, normal gösterim
- **50-69 puan**: Kullanıcıya iyileştirme önerileri
- **30-49 puan**: Moderatör incelemesi
- **0-29 puan**: Otomatik red, kullanıcıya bildirim

---

## 🎯 **Kullanıcı Deneyimi**

### **Otomatik Düzeltmeler**
- Küçük yazım hatalarını düzelt
- Eksik noktalama ekle
- Kategori önerisi sun

### **Akıllı Öneriler**
- "Pişirme süresini belirtmeyi unutmuşsunuz"
- "Bu tarif için fotoğraf eklemenizi öneriyoruz"
- "Malzeme miktarlarını kontrol edin"

### **Kalite Rozetleri**
- ⭐ **Kaliteli Tarif**: 85+ puan
- 🏆 **Editörün Seçimi**: 95+ puan
- ✅ **Doğrulanmış**: AI + moderatör onayı

---

## 📊 **Raporlama ve İyileştirme**

### **Analitik Metrikleri**
- Ortalama kalite puanı
- Kategori dağılımı
- Yaygın hatalar
- Kullanıcı iyileştirme oranları

### **Sürekli Öğrenme**
- Kullanıcı geri bildirimlerinden öğren
- Yanlış kategorize edilen tarifleri düzelt
- Yeni spam türlerini tespit et

---

## 🚀 **Uygulama Planı**

### **Faz 1: Temel Metin Analizi**
- Yazım kontrol sistemi
- Spam tespiti
- Kategori sınıflandırma

### **Faz 2: Görsel Analiz**
- Fotoğraf kalite kontrol
- İçerik uygunluk tespiti
- Otomatik etiketleme

### **Faz 3: Gelişmiş Analiz**
- Beslenme değeri hesaplama
- Tarif mantık kontrolü
- Akıllı öneriler

### **Faz 4: Makine Öğrenmesi**
- Kullanıcı geri bildirimlerinden öğrenme
- Sürekli iyileştirme
- Kişiselleştirilmiş öneriler

---

## 🔧 **Teknik Gereksinimler**

### **Backend Servisleri**
- AI analiz pipeline
- Queue sistemi (Redis/RabbitMQ)
- Notification servisi
- Analytics dashboard

### **Database Schema**
```sql
-- Tarif kalite puanları
CREATE TABLE recipe_quality_scores (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  text_quality INTEGER,
  recipe_logic INTEGER,
  image_quality INTEGER,
  content_safety INTEGER,
  category_accuracy INTEGER,
  overall_score INTEGER,
  analysis_date TIMESTAMP,
  ai_feedback JSONB
);

-- AI analiz sonuçları
CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  analysis_type VARCHAR(50),
  result JSONB,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP
);
```

### **API Endpoints**
```javascript
// Tarif analiz etme
POST /api/ai/analyze-recipe
{
  "recipeId": "uuid",
  "analysisTypes": ["text", "image", "nutrition"]
}

// Analiz sonuçlarını getirme
GET /api/ai/analysis-results/:recipeId

// Kalite puanlarını getirme
GET /api/ai/quality-scores/:recipeId
```

Bu sistem sayesinde hem kullanıcı deneyimi iyileşir hem de platform kalitesi yükselir! 🚀 