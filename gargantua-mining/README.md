# GARGANTUA MINING 🕳⛏

Interstellar filmindeki Gargantua kara deliğinden esinlenen, mobil öncelikli
bir web madencilik oyunu. Derleme adımı yok — tek bir `index.html` dosyası.

## Oynanış

- **Diske dokun** → egzotik madde (EM) hasat et. %8 ihtimalle 5× kritik vuruş.
- **Sürükle** → kamerayı kara deliğin etrafında çevir.
- **Yörünge kaydırıcısı** → olay ufkuna yaklaş: verim ×5'e kadar artar ama
  gemi ısınır ve zaman genleşmesi büyür ("Dünya'da geçen süre" hızlanır).
- **Isı** → %100'e ulaşırsa sistemler 8 saniyeliğine kapanır.
- **Yükseltmeler** → Maden Lazeri, Ranger Dronu (otomatik gelir),
  Soğutma Sistemi, Rafineri (kalıcı ×1.25 çarpan).
- **Çevrimdışı kazanç** → dronlar sen yokken %50 verimle çalışır (8 saate kadar).
- İlerleme `localStorage`'a otomatik kaydedilir.

## Görselleştirme

Kara delik, WebGL fragment shader'ında gerçek zamanlı render edilir:

- **Yerçekimsel mercekleme** — foton jeodeziği yaklaşımı
  (`a = -1.5 h² r̂ / r⁴`) ile ışınlar adım adım bükülür; arka plandaki
  yıldız alanı ve diskin "arkadan görünen" üst/alt görüntüsü kendiliğinden
  oluşur.
- **Akresyon diski** — diferansiyel dönüşlü (iç kısım hızlı) prosedürel
  gaz iplikçikleri, içten dışa akkor beyaz → derin turuncu sıcaklık gradyanı.
- **Doppler ışıması** — yaklaşan taraf belirgin şekilde daha parlak ve
  hafif mavimsi (filmdeki asimetrik parlaklık).
- **Foton halkası**, ton eşleme, vinyet ve aşırı ısınmada ekran kenarı
  kızarması.
- **Uyarlanabilir kalite** — kare süresine göre çözünürlük ölçeği ve
  ışın adımı sayısı otomatik ayarlanır; düşük donanımlı telefonlarda da akıcı.

## Çalıştırma

```bash
cd gargantua-mining
python3 -m http.server 8080
# http://localhost:8080  (veya dosyayı doğrudan tarayıcıda aç)
```

Telefonda tam ekran deneyim için tarayıcıdan "Ana ekrana ekle" kullanılabilir.
