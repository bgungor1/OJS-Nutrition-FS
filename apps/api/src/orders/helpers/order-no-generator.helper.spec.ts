import { OrderNoGeneratorHelper } from './order-no-generator.helper';

describe('OrderNoGeneratorHelper', () => {
  it('should generate order number in ORD-YYYYMMDD-XXXXXX format', () => {
    const orderNo = OrderNoGeneratorHelper.generate();
    const regex = /^ORD-\d{8}-[0-9A-Z]{6}$/;

    expect(orderNo).toMatch(regex);
  });

  it('should correctly format YYYYMMDD part based on provided date', () => {
    const fixedDate = new Date(2026, 8, 10, 15, 30, 0);
    const orderNo = OrderNoGeneratorHelper.generate(fixedDate);

    expect(orderNo.startsWith('ORD-20260910-')).toBe(true);
  });

  it('should generate unique order numbers without collisions', () => {
    const count = 10000;
    const generated = new Set<string>();

    for (let i = 0; i < count; i++) {
      generated.add(OrderNoGeneratorHelper.generate());
    }

    expect(generated.size).toBe(count);
  });
});
