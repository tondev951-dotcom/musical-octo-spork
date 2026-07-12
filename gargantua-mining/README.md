# GARGANTUA · GRAV PROTOKOLÜ 🕳⬡

Interstellar filmindeki Gargantua kara deliğinden esinlenen, **pasif** uzay
madenciliği web3 miniapp'i. Tap-to-earn değil: strateji kur, protokol çalışsın.
Derleme adımı yok — tek bir `index.html` dosyası.

## Oynanış (pasif madencilik)

- **Cüzdan bağla** (yerel simülasyon — zincir bağlantısı yoktur, adres ve
  işlem hash'leri cihazda üretilir) ve ⬡ GRAV bakiyeni yönet.
- **Sondaj konuşlandır** — 4 yörünge kuşağından birini seç:

  | Kuşak | Verim | Fırtına riski | Zaman genleşmesi |
  |---|---|---|---|
  | B-0 Dış Kuşak | 12 ⬡/sa | %2/sa | ×1.02 |
  | B-1 Orta Disk | 30 ⬡/sa | %8/sa | ×1.20 |
  | B-2 İç Kenar | 75 ⬡/sa | %20/sa | ×2.50 |
  | B-3 Foton Sınırı | 180 ⬡/sa | %45/sa | ×9.00 |

- **Pasif üretim** — sondajlar sen uygulamada olmasan da kazar
  (çevrimdışı 24 saate kadar tam verim). Biriken GRAV'ı **TALEP ET** ile
  cüzdana geçir; her talep, sahte tx hash'iyle işlem defterine yazılır.
- **Kütleçekim fırtınaları** — derin kuşaklarda sondajlar hasar alabilir;
  onarım GRAV'a mal olur. Risk/getiri dengesi oyunun kalbi.
- **Derin Sefer** — sondajı 15 dakikalığına kilitle: 4× toplu ödül,
  başarı şansı kuşağın riskine bağlı; başarısızlıkta sondaj hasar alır.
- **Stake** — her ⬡100 kilit, tüm filonun verimine +%2 ekler (maks +%50).
- **Geliştirme** — sondaj seviyesi başına verim ×1.6.
- İlerleme `localStorage`'a otomatik kaydedilir.

## Görselleştirme

Kara delik, WebGL fragment shader'ında gerçek zamanlı render edilir:

- **Yerçekimsel mercekleme** — foton jeodeziği yaklaşımı
  (`a = -1.5 h² r̂ / r⁴`); yıldız alanının bükülmesi ve diskin gölge
  üstünde/altında görünen ikinci görüntüsü kendiliğinden oluşur.
- **Akresyon diski** — diferansiyel dönüşlü prosedürel gaz iplikçikleri,
  akkor beyaz → derin turuncu sıcaklık gradyanı, **Doppler ışıması**
  (yaklaşan taraf parlak/mavimsi), foton halkası, ton eşleme.
- **Canlı filo görselleştirmesi** — dolu kuşaklar diskte renkli halka
  olarak yanar; her kuşakta yörüngede dönen sondaj kıvılcımları görünür.
  Claim anında kuşaklardan parlama dalgası yayılır, fırtınada ekran
  kenarları kızıl flaş verir.
- **Uyarlanabilir kalite** — kare süresine göre çözünürlük ve ışın adımı
  sayısı otomatik ayarlanır; düşük donanımlı telefonlarda da akıcı.

## Çalıştırma

```bash
cd gargantua-mining
python3 -m http.server 8080
# http://localhost:8080  (veya dosyayı doğrudan tarayıcıda aç)
```

Telefonda tam ekran deneyim için tarayıcıdan "Ana ekrana ekle" kullanılabilir.
