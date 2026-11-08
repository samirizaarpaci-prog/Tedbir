/* Telefon uygulamasının yerel bağlantıları. scripts/hazirla.mjs bunu www/native.js olarak paketler.
   Tarayıcıda bu dosya yoktur; uygulama yine çalışır. */
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

if (Capacitor.isNativePlatform()) {
  // Geri tuşu: açık bir sayfa (tedbir düzenleme, ayarlar) varsa önce onu kapatır, yoksa uygulamadan çıkar.
  App.addListener('backButton', () => {
    if (window.tedbirBack && window.tedbirBack()) return;
    App.exitApp();
  });
  // Uygulama arka plana geçerken kayıtları hemen yaz.
  App.addListener('pause', () => {
    if (window.tedbirSave) window.tedbirSave();
  });
}

window.TEDBIR_NATIVE = { isNative: Capacitor.isNativePlatform(), platform: Capacitor.getPlatform() };
