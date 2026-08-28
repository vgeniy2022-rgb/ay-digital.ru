import assert from 'node:assert/strict';
import test from 'node:test';
import { puckRussianDictionary, studioComponentLabels, studioRu } from './ru';

test('critical SITEVL Studio controls have Russian labels', () => {
  assert.deepEqual(studioRu.navigation, {
    blocks: 'Блоки',
    outline: 'Структура',
    pages: 'Страницы',
    components: 'Компоненты',
    assets: 'Медиа',
    style: 'Стиль',
    fields: 'Параметры',
  });

  assert.equal(studioRu.actions.publish, 'Опубликовать');
  assert.equal(studioRu.actions.preview, 'Предпросмотр');
  assert.equal(studioComponentLabels.Hero, 'Первый экран');
  assert.equal(studioComponentLabels.VerticalStack, 'Вертикальный стек');
  assert.equal(studioComponentLabels.LeadForm, 'Форма заявки');
});

test('Puck receives Russian labels through its public dictionary API', () => {
  assert.equal(puckRussianDictionary['header-publish'], 'Опубликовать');
  assert.equal(puckRussianDictionary['header-undo'], 'Отменить');
  assert.equal(puckRussianDictionary['action-delete'], 'Удалить');
  assert.equal(puckRussianDictionary['plugin-blocks'], 'Блоки');
  assert.equal(puckRussianDictionary['plugin-outline'], 'Структура');
  assert.equal(puckRussianDictionary['loader-loading'], 'Загрузка');
});
