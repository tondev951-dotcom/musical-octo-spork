# GARGANTUA · GRAV PROTOKOLÜ 🕳⬡

Interstellar filmindeki Gargantua kara deliğinden esinlenen, **pasif** uzay
madenciliği web3-tarzı miniapp'i. Tap-to-earn değil: strateji kur, protokol
çalışsın. Derleme adımı yok — tek bir `index.html` dosyası.

## Sistemler (v3)

### Kaynaklar — gerçek uzay madenciliği hedefleri
| Kaynak | Gerçek karşılığı | Rolü |
|---|---|---|
| 💧 H₂O | Su buzu — roket yakıtı hammaddesi | Elektrolizle yakıta dönüşür |
| ☄ ³He | Helyum-3 — füzyon yakıtı adayı | Füzyon peleti üretimi |
| ⬙ PGM | Platin grubu metaller | Gemi bileşeni, yükseltmeler |
| ✦ EXO | Egzotik madde (olay ufku yakını) | Kuantum teknolojileri |
| ⚡ ERG | Penrose süreci enerji hasadı | Rafineri partilerinin "elektriği" |

### Çekirdek döngü
1. **Sondaj konuşlandır** — 4 yörünge kuşağı, her birinin kaynak karışımı,
   fırtına riski ve zaman genleşmesi farklı. Pasif üretim; hasadı topla.
2. **Rafine et** — zamanlı partiler (30dk–8sa): H₂O→LH₂ yakıt, ³He→füzyon
   peleti, PGM→gemi bileşeni, EXO→kuantum çekirdeği. ERG tüketir.
3. **Sat / teslim et** — dalgalı fiyatlı emtia pazarı (günlük NPC alım
   kotası) + günlük kontratlar (seri bonusu). ⬡ GRAV yalnız buradan,
   seferlerden ve seviye ödüllerinden kazanılır — kotalı musluklar.
4. **Sefer** — yakıt harca, sondajı riskli derin sefere yolla: GRAV + EXO
   kumarı.

### Komutan Seviyesi
Her eylem XP verir. Seviye; yörünge kuşaklarını (B-1 sv3 → B-3 sv10),
rafineri tariflerini/slotlarını ve teknoloji katmanlarını açar.

### Teknoloji Ağacı — 4 katman, gerçek terimler
- **K1:** İyon İtki · Spektrometre Dizisi · Elektroliz Tesisi
- **K2:** ISRU Rafinerisi · Kütle Sürücüsü · MHD Kalkanı
- **K3:** ³He Füzyon Reaktörü · Lagrange Deposu (L4) · Robotik Sondaj Hattı
- **K4 · Kuantum Çağı:** Kuantum Radar · Kuantum Dolanıklık İletişimi ·
  **Alcubierre Sürücü Prototipi**

Araştırma kaynak + GRAV + zaman ister; tek laboratuvar slotu vardır.

### Konsorsiyum Statüsü (VIP)
Günlük giriş, kontrat, sefer ve GRAV harcamalarından puan birikir.
ADAY → YÖNETİM KURULU arası 11 rütbe; kalıcı ayrıcalıklar: verim +%2/rütbe,
onarım indirimi, ekstra kontrat, ERG üretimi, ekstra rafineri slotu, süre
kısaltması…

### Diğer
- Kütleçekim fırtınaları sondajları vurur (ücretli onarım), MHD/Kuantum
  Radar riski düşürür.
- Çevrimdışı üretim 24 saate kadar (Lagrange Deposu ile 48, statüyle +12).
- Stake: her ⬡100 kilit → verim +%2 (maks +%50).
- Sahte cüzdan/tx-hash'li işlem defteri (yerel simülasyon — zincir yok;
  TON entegrasyonu yol haritasında F2+).
- `?dev=1` parametresi tüm süreleri 60× hızlandırır (test için).

## Görselleştirme
WebGL fragment shader: foton jeodeziği yaklaşımıyla yerçekimsel mercekleme,
diferansiyel dönüşlü akresyon diski, Doppler ışıması, foton halkası.
Dolu kuşaklar diskte renkli halka + dönen sondaj kıvılcımları olarak görünür.
Uyarlanabilir kalite + WebGL context-loss kurtarma.

## Çalıştırma
```bash
cd gargantua-mining
python3 -m http.server 8080   # http://localhost:8080
```
