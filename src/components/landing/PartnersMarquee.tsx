'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PARTNERS, Partner } from '@/data/partners';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

function PartnerCardItem({ partner }: { partner: Partner }) {
  const [imageError, setImageError] = useState(false);

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="partner-card"
      style={{ '--brand-color': partner.brandColor } as React.CSSProperties}
      title={`${partner.brand} — ${partner.description}`}
    >
      {/* Logo container */}
      <div className="partner-logo-container">
        {!imageError ? (
          <Image
            src={partner.logo}
            alt={`${partner.brand} logo`}
            width={160}
            height={56}
            className={`partner-logo-img ${partner.id === 'coursera' || partner.id === 'udemy' ? 'is-app-icon' : ''}`}
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="partner-fallback-badge">
            <span
              className="partner-fallback-dot"
              style={{ background: partner.brandColor }}
              aria-hidden="true"
            />
            <span className="partner-fallback-name">{partner.brand}</span>
          </div>
        )}
      </div>

      {/* Brand information & LifeOS-style status pill */}
      <div className="partner-info">
        <div className="partner-info-top">
          <span className="partner-brand-name">{partner.brand}</span>
          <span className={`partner-status-tag tag-${partner.tagClass}`}>
            {partner.tag}
          </span>
        </div>
        <span className="partner-brand-tag">{partner.description}</span>
      </div>
    </a>
  );
}

export function PartnersMarquee() {
  const prefersReduced = useReducedMotion();

  // Repeat the 4 brands (Coursera, Udemy, Daraz, edX) 3 times = 12 items
  const repeatedPartners = React.useMemo(() => {
    return [...PARTNERS, ...PARTNERS, ...PARTNERS];
  }, []);

  return (
    <section className="partners-section" aria-label="Our Trusted Partners">
      {/* Atmospheric Ambient Floating Blobs */}
      <div className="partners-ambient-blobs" aria-hidden="true">
        <i className="p-blob p-blob-1"></i>
        <i className="p-blob p-blob-2"></i>
        <i className="p-blob p-blob-3"></i>
      </div>

      <div className="partners-container">
        {/* Header */}
        <div className="partners-header">
          {/* High-visibility pill badge with glowing beacon */}
          <div className="partners-badge" role="status">
            <span className="partners-badge-beacon" aria-hidden="true">
              <span className="beacon-ping"></span>
              <span className="beacon-core"></span>
            </span>
            <span className="partners-badge-text">
              COLLABORATION &amp; STUDENT ECOSYSTEM
            </span>
          </div>

          <h2 className="partners-title">Our Trusted Partners</h2>
          <p className="partners-subtitle">
            Leading academic &amp; lifestyle platforms empowering students to study smarter, upskill faster, and save more.
          </p>
        </div>

        {/* Marquee Scroller with gradient fade edges */}
        <div
          className={`partners-marquee-wrapper ${prefersReduced ? 'reduced-motion' : ''}`}
        >
          {prefersReduced ? (
            /* Accessible Static Grid for Reduced Motion */
            <div className="partners-static-row" role="list">
              {PARTNERS.map((partner) => (
                <div key={partner.id} role="listitem">
                  <PartnerCardItem partner={partner} />
                </div>
              ))}
            </div>
          ) : (
            /* Seamless Infinite Marquee Track */
            <div className="partners-marquee-track">
              {/* Group 1 */}
              <div className="partners-marquee-group" role="list">
                {repeatedPartners.map((partner, index) => (
                  <div key={`p1-${partner.id}-${index}`} role="listitem">
                    <PartnerCardItem partner={partner} />
                  </div>
                ))}
              </div>

              {/* Group 2 (Aria hidden duplicate for seamless 50% loop) */}
              <div
                className="partners-marquee-group"
                aria-hidden="true"
                role="presentation"
              >
                {repeatedPartners.map((partner, index) => (
                  <div key={`p2-${partner.id}-${index}`} role="presentation">
                    <PartnerCardItem partner={partner} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footnote */}
        <p className="partners-footnote">
          Concept partnerships proposed for LifeOS student benefit program
        </p>
      </div>
    </section>
  );
}
