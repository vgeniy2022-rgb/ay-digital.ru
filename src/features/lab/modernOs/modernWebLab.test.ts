import assert from 'node:assert/strict';
import test from 'node:test';
import { createModernWebLabDocument, sanitizeModernHtml } from './modernWebLab';

test('Modern WEB LAB removes scripts, handlers and executable URLs', () => {
  const result = sanitizeModernHtml('<main onclick="alert(1)"><script>alert(1)</script><a href="javascript:alert(2)">Link</a><p>Safe</p></main>');
  assert.equal(result.includes('<script'), false);
  assert.equal(result.includes('onclick'), false);
  assert.equal(result.includes('javascript:'), false);
  assert.equal(result.includes('<p>Safe</p>'), true);
});

test('Modern WEB LAB creates a sandbox-oriented document without imported CSS or JavaScript', () => {
  const document = createModernWebLabDocument('<h1>Тест</h1>', '@import url(https://bad.example/style.css); h1 { color: blue; }');
  assert.match(document, /Content-Security-Policy/);
  assert.equal(document.includes('@import'), false);
  assert.equal(document.includes('<script'), false);
  assert.match(document, /<h1>Тест<\/h1>/);
});
