import { OrderNoGeneratorHelper } from './order-no-generator.helper';

describe('OrderNoGeneratorHelper', () => {
  it('sipariş numarasını ORD-YYYYMMDD-XXXXXX formatında üretmelidir', () => {
    const orderNo = OrderNoGeneratorHelper.generate();
    const regex = /^ORD-\d{8}-[0-9A-Z]{6}$/;

    expect(orderNo).toMatch(regex);
  });

  it('verilen tarihe göre YYYYMMDD bölümünü doğru formatlamalıdır', () => {
    const fixedDate = new Date(2026, 8, 10, 15, 30, 0);
    const orderNo = OrderNoGeneratorHelper.generate(fixedDate);

    expect(orderNo.startsWith('ORD-20260910-')).toBe(true);
  });

  it('peş peşe üretilen sipariş numaraları benzersiz olmalıdır (çakışma olmamalıdır)', () => {
    const count = 10000;
    const generated = new Set<string>();

    for (let i = 0; i < count; i++) {
      generated.add(OrderNoGeneratorHelper.generate());
    }

    expect(generated.size).toBe(count);
  });
});
