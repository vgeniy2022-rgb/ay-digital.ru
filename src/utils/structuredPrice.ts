export function structuredPrice(value: string) {
  const values = [...value.matchAll(/\d[\d\s]*/g)]
    .map((match) => Number(match[0].replace(/\s/g, '')))
    .filter((price) => Number.isFinite(price));

  if (!values.length || !/(?:₽|руб)/i.test(value)) return {};

  if (/^\s*от(?:\s|$)/i.test(value)) {
    return {
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'RUB',
        minPrice: values[0],
      },
    };
  }

  if (values.length > 1) {
    return {
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'RUB',
        minPrice: values[0],
        maxPrice: values[1],
      },
    };
  }

  return { price: values[0], priceCurrency: 'RUB' };
}
