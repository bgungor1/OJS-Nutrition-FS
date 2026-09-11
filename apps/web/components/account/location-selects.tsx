'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { getRegions, getSubregions } from '@/lib/api/locations';
import type { Country, Region, Subregion } from '@/types';

interface LocationSelectsProps {
  countries: Country[];
  countryId: number | '';
  regionId: number | '';
  subregionId: number | '';
  onCountryChange: (id: number) => void;
  onRegionChange: (id: number) => void;
  onSubregionChange: (id: number) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const LocationSelects: React.FC<LocationSelectsProps> = ({
  countries,
  countryId,
  regionId,
  subregionId,
  onCountryChange,
  onRegionChange,
  onSubregionChange,
  errors = {},
  disabled = false,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [subregions, setSubregions] = useState<Subregion[]>([]);
  const [loadingRegions, startLoadingRegions] = useTransition();
  const [loadingSubregions, startLoadingSubregions] = useTransition();

  useEffect(() => {
    if (!countryId) {
      setRegions([]);
      setSubregions([]);
      return;
    }

    startLoadingRegions(async () => {
      try {
        const fetchedRegions = await getRegions(Number(countryId));
        setRegions(fetchedRegions);
      } catch {
        setRegions([]);
      }
    });
  }, [countryId]);

  useEffect(() => {
    if (!regionId) {
      setSubregions([]);
      return;
    }

    startLoadingSubregions(async () => {
      try {
        const fetchedSubregions = await getSubregions(Number(regionId));
        setSubregions(fetchedSubregions);
      } catch {
        setSubregions([]);
      }
    });
  }, [regionId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="country_id">Ülke</Label>
        <Select
          id="country_id"
          name="country_id"
          value={countryId}
          disabled={disabled || countries.length === 0}
          onChange={(e) => onCountryChange(Number(e.target.value))}
          aria-invalid={!!errors.country_id}
        >
          <option value="">Ülke Seçiniz</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        {errors.country_id && (
          <p className="text-xs text-destructive">{errors.country_id}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="region_id">İl</Label>
        <Select
          id="region_id"
          name="region_id"
          value={regionId}
          disabled={disabled || !countryId || loadingRegions}
          onChange={(e) => onRegionChange(Number(e.target.value))}
          aria-invalid={!!errors.region_id}
        >
          <option value="">{loadingRegions ? 'Yükleniyor...' : 'İl Seçiniz'}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
        {errors.region_id && (
          <p className="text-xs text-destructive">{errors.region_id}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subregion_id">İlçe</Label>
        <Select
          id="subregion_id"
          name="subregion_id"
          value={subregionId}
          disabled={disabled || !regionId || loadingSubregions}
          onChange={(e) => onSubregionChange(Number(e.target.value))}
          aria-invalid={!!errors.subregion_id}
        >
          <option value="">{loadingSubregions ? 'Yükleniyor...' : 'İlçe Seçiniz'}</option>
          {subregions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        {errors.subregion_id && (
          <p className="text-xs text-destructive">{errors.subregion_id}</p>
        )}
      </div>
    </div>
  );
};
