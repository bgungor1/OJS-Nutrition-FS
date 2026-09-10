import { randomBytes } from 'crypto';
import { ORDER_NO_PREFIX } from '../order.constants';

export class OrderNoGeneratorHelper {
  private static counter = 0;

  static generate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePart = `${year}${month}${day}`;

    this.counter = (this.counter + 1) % 46656;
    const counterPart = this.counter
      .toString(36)
      .padStart(3, '0')
      .toUpperCase();
    const randomPart = randomBytes(2).toString('hex').slice(0, 3).toUpperCase();

    return `${ORDER_NO_PREFIX}-${datePart}-${counterPart}${randomPart}`;
  }
}
