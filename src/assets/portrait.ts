const portraitModules = import.meta.glob<string>('./business-portrait.png', {
  eager: true,
  import: 'default',
  query: '?url',
});

export const businessPortraitUrl = portraitModules['./business-portrait.png'];
