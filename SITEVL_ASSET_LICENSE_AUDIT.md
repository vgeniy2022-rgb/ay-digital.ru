# SITEVL — asset license audit

Дата аудита: 30 августа 2026 года.

## Итог

**PASS WITH DISCLOSED LIMITATION** — текущий LAB NEXT релиз не добавляет сторонние игровые изображения, WAD, музыку, шрифты или промо-материалы. Игры и SITEVL FARM построены на оригинальном коде, Canvas/CSS-композициях, Lucide и WebAudio.

## Проверено

- **PASS:** CORE SHOOTER не содержит DOOM WAD, sprites, textures или sounds.
- **PASS:** BLOCKS не использует бренд Tetris или его графические материалы.
- **PASS:** SITEVL MATCH не использует Candy Crush assets или UI-копии.
- **PASS:** SITEVL FARM не использует Hay Day assets, персонажей, карту, музыку или названия.
- **PASS:** в LAB нет Rockstar/GTA logos, официальных screenshots или promo art.
- **PASS:** Retro не содержит оригинальные Apple/Microsoft icons, wallpapers или system assets.
- **PASS:** в текущем untracked diff нет новых бинарных изображений, audio, video или 3D-моделей.
- **PASS:** `lucide-react` используется как установленная open-source icon library; игровые visuals процедурные.

## Публичные editorial assets

Файл `public/images/editorial/README.md` хранит локальный реестр происхождения:

- оптимизированные копии Unsplash с авторами и image ID;
- `data-transfer-iphones.avif` с пометкой о генерации специально для SITEVL через OpenAI;
- `sitevl-home-capture.avif` и `web-studio-capture.avif` как локальные screenshots проекта.

## Известное ограничение

- **NOT VERIFIED:** существующий `public/images/web-studio/vladivostok-jdm-night.avif`/`.webp` появился в более ранней истории проекта как предоставленный/подготовленный для SITEVL визуал, но не содержит embedded metadata или отдельного license record. Текущий релиз его не добавляет и не изменяет. Перед передачей проекта третьей стороне рекомендуется сохранить отдельное письменное подтверждение происхождения этого изображения.
- **BLOCKED:** лицензированная музыкальная тема для Farm не была предоставлена. Чтобы не добавлять случайный или нелицензированный audio asset, релиз использует только короткие синтезированные WebAudio-сигналы.

