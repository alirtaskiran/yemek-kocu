const fs = require('fs');
const path = require('path');

// Backup klasörü oluştur
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Veritabanı dosya yolu
const dbPath = path.join(__dirname, 'prisma', 'dev.db');

// Backup dosya adı (tarih + saat)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `dev.db.backup.${timestamp}`);

try {
  // Veritabanını kopyala
  fs.copyFileSync(dbPath, backupPath);
  
  console.log('✅ Backup başarıyla oluşturuldu!');
  console.log(`📁 Konum: ${backupPath}`);
  console.log(`📊 Boyut: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);
  
  // Eski backup'ları temizle (7 günden eski)
  const files = fs.readdirSync(backupDir);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  files.forEach(file => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime < sevenDaysAgo) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Eski backup silindi: ${file}`);
    }
  });
  
} catch (error) {
  console.error('❌ Backup hatası:', error.message);
} 