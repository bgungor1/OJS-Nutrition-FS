import React from 'react';
import Image from 'next/image';

const CERTIFICATES = [
  { name: 'ISO Sertifikası', src: '/about/iso.png' },
  { name: 'Helal Sertifikası', src: '/about/helal.png' },
  { name: 'Gıda Güvenliği', src: '/about/gıda-guvenligi.png' },
  { name: 'GMP Sertifikası', src: '/about/gmp.png' },
  { name: 'Sertifikalı Şirket', src: '/about/certified-company.png' },
  { name: 'GHP Sertifikası', src: '/about/ghp.png' },
];

export function AboutCertificates() {
  return (
    <div className="mb-16">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Sertifikalarımız & Kalite Güvencemiz
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Uluslararası standartlarda hijyen, gıda güvenliği ve iyi üretim uygulamaları sertifikalarımız.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center justify-items-center rounded-2xl border border-border bg-card p-6 shadow-xs">
        {CERTIFICATES.map((cert) => (
          <div
            key={cert.name}
            className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative h-20 w-24 flex items-center justify-center">
              <Image
                src={cert.src}
                alt={cert.name}
                width={96}
                height={80}
                className="max-h-16 w-auto object-contain"
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground mt-2 text-center">
              {cert.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
