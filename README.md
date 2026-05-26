# Borovi Konfigurátor

## Mappastruktúra
```
borovi-konfigurator/
├── index.html          ← a konfigurátor
├── images/             ← ajtó képek ide kerülnek
│   ├── Szadoma.jpg
│   ├── Szicilia.jpg
│   ├── Szusza.jpg
│   ├── Theba.jpg
│   └── Troja_III.jpg
└── README.md
```

## GitHub feltöltés
1. Másold a képeket az `images/` mappába
2. GitHub → New repository → `borovi-konfigurator`
3. Töltsd fel az összes fájlt
4. Settings → Pages → Branch: main → / (root) → Save
5. Kész! Elérhető: https://[felhasználónév].github.io/borovi-konfigurator/

## Képek hozzáadása új modellhez
Az `index.html`-ben keresd meg a `MODEL_IMAGES` objektumot (~765. sor):
```js
var MODEL_IMAGES={
  'szicilia':'images/Szicilia.jpg',
  'szadoma':'images/Szadoma.jpg',
  // ide add: 'modelid':'images/Fajlnev.jpg',
};
```
A model id-t a MODELS tömbből nézd ki (pl. 'troja1', 'karthago2', stb.)
