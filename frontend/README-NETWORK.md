# Network Configuration Guide

Bu dosya farklı ağlarda (ev, dükkan, ofis) API bağlantısını kolayca değiştirmek için hazırlanmıştır.

## Hızlı Değişiklik

`frontend/src/config/environment.ts` dosyasını açın ve `CURRENT` değerini değiştirin:

```typescript
// Ev ağında
CURRENT: 'HOME',

// Dükkan/Ofis ağında  
CURRENT: 'OFFICE',

// Android emulator için
CURRENT: 'ANDROID_EMU',

// Local development için
CURRENT: 'LOCALHOST',
```

## IP Adreslerini Güncelleme

Yeni bir ağa bağlandığınızda IP adresi değişirse:

1. Terminal'de IP adresinizi bulun:
```bash
ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -1
```

2. `environment.ts` dosyasında ilgili IP adresini güncelleyin:
```typescript
API_URLS: {
  HOME: 'http://YENİ_IP_ADRESİ:3000/api',
  // ...
}
```

## Otomatik Reload

Değişiklik yaptıktan sonra:
- Expo CLI'da `r` tuşuna basın
- Veya uygulamayı shake yapıp "Reload" seçin

## Farklı Ortamlar

- **HOME**: Ev WiFi ağı (şu an: 192.168.1.120)
- **OFFICE**: Dükkan/Ofis ağı (şu an: 192.168.1.109)  
- **ANDROID_EMU**: Android emulator için (10.0.2.2)
- **LOCALHOST**: iOS simulator için (localhost)

## Sorun Giderme

Eğer bağlantı sorunu yaşıyorsanız:

1. Backend'in çalıştığından emin olun
2. IP adresinin doğru olduğunu kontrol edin
3. Firewall ayarlarını kontrol edin
4. Aynı WiFi ağında olduğunuzdan emin olun 