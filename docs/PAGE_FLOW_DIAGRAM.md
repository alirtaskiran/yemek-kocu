# 🗺️ **Yemek Koçu - Sayfa Akış Grafiği**

```mermaid
graph TD
    Start([Uygulama Başlangıç]) --> Auth{Kullanıcı Giriş Yapmış mı?}
    
    %% Kimlik Doğrulama Akışı
    Auth -->|Hayır| AuthScreen[Giriş Ekranı - Giriş/Kayıt]
    AuthScreen --> Login[Giriş Yap]
    AuthScreen --> Register[Kayıt Ol]
    Login --> MainApp[Ana Uygulama]
    Register --> MainApp
    
    %% Ana Navigasyon
    Auth -->|Evet| MainApp
    MainApp --> TabNavigator{Ana Tab Navigasyonu}
    
    %% Ana Sayfa Tab Akışı
    TabNavigator --> HomeScreen[Ana Sayfa - Kalori Takibi]
    HomeScreen --> CalorieModal[Kalori Giriş Modal]
    CalorieModal --> HomeScreen
    
    %% Keşfet Tab Akışı
    TabNavigator --> ExploreScreen[Keşfet Sayfası - Tarif Arama]
    ExploreScreen --> RecipeDetail[Tarif Detayı - Tam Bilgi]
    RecipeDetail --> CookingMode[Pişirme Modu - Adım Adım]
    CookingMode --> RecipeDetail
    RecipeDetail --> ExploreScreen
    
    %% Aile Tab Akışı
    TabNavigator --> FamilyScreen[Aile Sayfası - Grup Yönetimi]
    FamilyScreen --> CreateFamily[Aile Oluştur Modal]
    FamilyScreen --> JoinFamily[Aileye Katıl Modal]
    FamilyScreen --> VotingDetail[Oylama Detayı - Yemek Seçimi]
    CreateFamily --> FamilyScreen
    JoinFamily --> FamilyScreen
    VotingDetail --> FamilyScreen
    
    %% Profil Tab Akışı
    TabNavigator --> ProfileScreen[Profil Sayfası - Kişisel Bilgiler]
    
    %% Profil Alt Sayfaları
    ProfileScreen --> EditCalorie[Kalori Hedefi Düzenleme]
    ProfileScreen --> EditProfile[Profil Düzenle - Bilgi Güncelle]
    ProfileScreen --> NotificationSettings[Bildirim Ayarları - Tercihler]
    ProfileScreen --> AboutScreen[Hakkında - Uygulama Bilgisi]
    ProfileScreen --> Logout[Çıkış Yap]
    
    %% Profil Düzenleme Alt Akışları
    EditProfile --> EditUsername[Kullanıcı Adı Değiştir]
    EditProfile --> EditEmail[Email Adresi Değiştir]
    EditEmail --> EmailVerification[Email Doğrulama - 6 Haneli Kod]
    EditProfile --> EditPassword[Şifre Değiştir - Güvenlik]
    EditProfile --> EditBio[Biyografi Düzenle]
    EditProfile --> EditPhoto[Profil Fotoğrafı Değiştir]
    
    %% Geri Dönüş Akışları
    EditCalorie --> ProfileScreen
    EditProfile --> ProfileScreen
    NotificationSettings --> ProfileScreen
    AboutScreen --> ProfileScreen
    EditUsername --> EditProfile
    EditEmail --> EditProfile
    EmailVerification --> EditProfile
    EditPassword --> EditProfile
    EditBio --> EditProfile
    EditPhoto --> EditProfile
    
    %% Çıkış Akışı
    Logout --> AuthScreen
    
    %% Stil Tanımlamaları
    classDef mainTab fill:#FF9500,stroke:#333,stroke-width:3px,color:#fff
    classDef subScreen fill:#1E1E1E,stroke:#FF9500,stroke-width:2px,color:#fff
    classDef modal fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef auth fill:#F44336,stroke:#333,stroke-width:2px,color:#fff
    
    class HomeScreen,ExploreScreen,FamilyScreen,ProfileScreen mainTab
    class RecipeDetail,CookingMode,VotingDetail,EditCalorie,EditProfile,NotificationSettings,AboutScreen subScreen
    class CalorieModal,CreateFamily,JoinFamily,EditUsername,EditEmail,EmailVerification,EditPassword,EditBio,EditPhoto modal
    class AuthScreen,Login,Register,Logout auth
```

## 📋 **Sayfa Kategorileri ve Açıklamaları**

### **🔐 Kimlik Doğrulama (Authentication)**
- **Giriş Ekranı** - Kullanıcı giriş yapma ve kayıt olma sayfası
- **Giriş Yap** - Mevcut hesapla giriş işlemi
- **Kayıt Ol** - Yeni hesap oluşturma işlemi

### **📱 Ana Tab Sayfaları (4 Adet)**
- **🏠 Ana Sayfa** - Günlük kalori takibi ve genel özet
- **🔍 Keşfet Sayfası** - Tarif arama ve kategori filtreleme
- **👥 Aile Sayfası** - Aile üyeleri ve grup oylaması yönetimi
- **👤 Profil Sayfası** - Kişisel bilgiler ve uygulama ayarları

### **📖 Tarif İşlemleri Sayfaları**
- **📖 Tarif Detayı** - Malzemeler, talimatlar ve besin değerleri
- **👨‍🍳 Pişirme Modu** - Adım adım pişirme rehberi

### **👥 Aile Yönetimi Sayfaları**
- **🏠 Aile Oluştur Modal** - Yeni aile grubu kurma
- **👥 Aileye Katıl Modal** - Mevcut aile grubuna katılma
- **🗳️ Oylama Detayı** - Günlük yemek seçimi oylaması

### **👤 Profil Yönetimi Alt Sayfaları (4 Adet)**
- **📊 Kalori Hedefi Düzenleme** - Günlük kalori hedefini belirleme
- **✏️ Profil Düzenle** - Kişisel bilgileri güncelleme ana sayfası
- **🔔 Bildirim Ayarları** - Push notification tercihlerini ayarlama
- **ℹ️ Hakkında** - Uygulama versiyonu ve yasal bilgiler

### **✏️ Profil Düzenleme Detay Sayfaları (6 Adet)**
- **📝 Kullanıcı Adı Değiştir** - Username güncelleme (30 gün kısıtı)
- **📧 Email Adresi Değiştir** - Email güncelleme ve doğrulama
- **✅ Email Doğrulama** - 6 haneli doğrulama kodu girişi
- **🔒 Şifre Değiştir** - Mevcut şifre ile yeni şifre belirleme
- **📄 Biyografi Düzenle** - Kişisel açıklama metni güncelleme
- **📷 Profil Fotoğrafı Değiştir** - Avatar fotoğrafı yükleme

### **📊 Modal/Popup Sayfalar**
- **📊 Kalori Giriş Modal** - Günlük kalori kayıt formu
- **Onay Dialog'ları** - Çıkış, silme gibi kritik işlem onayları

## 🔄 **Temel Kullanıcı Akış Yolları**

### **🆕 İlk Defa Kullanan Kullanıcı**
```
Uygulama Başlangıç → Giriş Ekranı → Kayıt Ol → Ana Sayfa
```

### **🔄 Düzenli Kullanıcı**
```
Uygulama Başlangıç → Ana Sayfa (otomatik giriş)
```

### **🍳 Tarif Keşfi ve Pişirme**
```
Keşfet Sayfası → Tarif Detayı → Pişirme Modu → Tarif Detayı
```

### **👨‍👩‍👧‍👦 Aile Grup İşlemleri**
```
Aile Sayfası → Oylama Detayı (yemek seçimi)
Aile Sayfası → Aile Oluştur/Katıl (grup yönetimi)
```

### **⚙️ Profil ve Ayar Yönetimi**
```
Profil Sayfası → Profil Düzenle → Email Değiştir → Email Doğrulama
Profil Sayfası → Kalori Hedefi (günlük hedef belirleme)
Profil Sayfası → Bildirim Ayarları (tercih yönetimi)
```

## 📊 **Geliştirme Durumu İstatistikleri**

| **Kategori** | **Sayfa Sayısı** | **Durum** | **Açıklama** |
|--------------|------------------|-----------|--------------|
| **Ana Tab'lar** | 4 | ✅ **Tamamlandı** | HomeScreen, ExploreScreen, FamilyScreen, ProfileScreen |
| **Kimlik Doğrulama** | 3 | ✅ **Tamamlandı** | AuthScreen, Login, Register işlemleri |
| **Profil Alt Sayfaları** | 4 | 🚧 **Planlandı** | EditCalorie öncelikli |
| **Profil Düzenleme** | 6 | 🚧 **Planlandı** | Username, Email, Password vb. |
| **Tarif Sayfaları** | 2 | 📋 **Gelecek Sprint** | RecipeDetail, CookingMode |
| **Aile Sayfaları** | 3 | 🚧 **Kısmen Hazır** | VotingDetail eksik |
| **Modal/Popup** | 8+ | 🚧 **Planlandı** | Çeşitli onay ve form modal'ları |

## 🎯 **Geliştirme Öncelik Sıralaması**

### **🔥 Yüksek Öncelik (Bu Sprint)**
1. **📊 EditCalorieGoalScreen** - Kalori hedefi düzenleme (günlük kullanım)
2. **✏️ EditProfileScreen** - Profil düzenleme ana sayfası (temel ihtiyaç)
3. **📖 RecipeDetailScreen** - Tarif detayları (ana özellik)

### **⚡ Orta Öncelik (Sonraki Sprint)**
4. **📝 EditUsername** - Kullanıcı adı değiştirme (30 gün kısıtı)
5. **📧 EditEmail + EmailVerification** - Email değiştirme (güvenlik)
6. **🔔 NotificationSettingsScreen** - Bildirim ayarları (kullanıcı deneyimi)

### **📅 Düşük Öncelik (İleride)**
7. **👨‍🍳 CookingModeScreen** - Pişirme modu (premium özellik)
8. **🗳️ VotingDetailScreen** - Oylama detayları (aile özelliği)
9. **ℹ️ AboutScreen** - Uygulama hakkında (yasal gereklilik)

## 🎨 **Renk Kodları ve Tasarım**

- **🧡 Ana Tab'lar:** `#FF9500` (Turuncu - Ana renk)
- **⚫ Alt Sayfalar:** `#1E1E1E` (Koyu gri - İkincil)
- **🟢 Modal'lar:** `#4CAF50` (Yeşil - Etkileşim)
- **🔴 Kimlik Doğrulama:** `#F44336` (Kırmızı - Güvenlik)

---

**📅 Son Güncelleme:** 28 Haziran 2025  
**📊 Toplam Sayfa:** 25+ sayfa/modal  
**✅ Tamamlanan:** 7 sayfa  
**🚧 Kalan:** 18+ sayfa  
**🎯 Sıradaki:** EditCalorieGoalScreen 