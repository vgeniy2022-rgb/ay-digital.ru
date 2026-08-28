# SITEVL Retro Phase 4 — аудит

Дата: 29 августа 2026 года.

## Состояние до Phase 4

Phase 3 добавила третью систему CLASSIC MONO, безопасный Retro Browser, общую файловую модель v3, A:/D:, корзину и семь достижений. DESK 95, CLASSIC DESK и CLASSIC MONO использовали общий React window manager и отличались launcher/menu/taskbar и CSS chrome. Существующие Paint, Notes, Calculator, Terminal и Snake сохранились из ранней версии.

## Переиспользовано

- `/lab/retro`, `LabShell`, LAB persistence и progression.
- Три системных идентификатора: `desk95`, `classic`, `mono`.
- Существующий window manager, boot WebAudio, CRT, mobile full-window layout.
- `RetroState`, URL validator, Browser, File Manager, Paint, Notes, Terminal и игры.

## Архитектурные проблемы

- v3 не хранила окна, сеть, почту, приложения или quest.
- Статические приложения нельзя было связать общими событиями adventure.
- Внешний iframe нельзя надёжно диагностировать через X-Frame-Options из client-side JavaScript.
- Большие camera/audio Blob нельзя безопасно масштабировать в localStorage.
- Три системы пока используют общую app-бизнес-логику и window engine; различия оболочек есть, но отдельные file-manager adapters требуют следующего прохода.

## Приоритет реализации

В соответствии с заданным quality order реализованы filesystem v4, desktop/window persistence, Browser/internal network, virtual network, LAB-SERVER, installer state, Mail, Chat, BASIC, HTML LAB, quest events и backup. Медиа-приложения и декоративные системные функции не имитировались фальшивыми кнопками.

## Производительность

Новые модели не запускают фоновые canvas/audio/media циклы. BASIC WAIT ограничен 3000 мс. Browser history ограничена 100 записями, quest events — 100 событиями. Camera/Mic не добавлялись без IndexedDB media layer.
