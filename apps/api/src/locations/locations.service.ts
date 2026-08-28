import { Injectable } from '@nestjs/common';

/**
 * Faz 2 — BACKEND_PLAN §5.4. Ülke -> il -> ilçe lookup (adres formu için).
 * Seyrek değişen referans veri; kısa TTL cache düşünülebilir
 * (ENGINEERING_STANDARDS §5.2).
 */
@Injectable()
export class LocationsService {}
