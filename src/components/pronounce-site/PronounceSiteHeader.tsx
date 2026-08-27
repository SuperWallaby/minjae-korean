"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  GLOBAL_LANG_META,
  getGlobalLang,
  globalLangMeta,
} from "@/lib/globalSite/catalog";
import { atlasLangPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { PRONOUNCE_SITE_NAME } from "@/lib/pronounceSite/brand";
import { PronounceBrandMark } from "@/components/pronounce-site/PronounceBrandMark";

export function PronounceSiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("pronounce-nav-open", open);
    return () => document.body.classList.remove("pronounce-nav-open");
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="global-header sound-header pronounce-header">
      <div className="global-shell global-header-inner">
        <div className="global-header-top">
          <Link
            className="global-brand pronounce-brand"
            href="/"
            onClick={close}
            aria-label={PRONOUNCE_SITE_NAME}
          >
            <PronounceBrandMark />
            <span className="global-brand-mark">{PRONOUNCE_SITE_NAME}</span>
          </Link>
          <div className="pronounce-header-actions">
            <a className="global-header-tutor" href="/go/preply?lang=zh">
              Tutor <span>50% off</span>
            </a>
            <button
              type="button"
              className="pronounce-nav-toggle"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span aria-hidden>{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        <nav
          className="global-nav pronounce-nav-desktop"
          aria-label="Languages"
        >
          <Link href="/" data-lang="zh" lang="zh">
            {GLOBAL_LANG_META.zh?.native ?? "中文"}
          </Link>
          {PRONOUNCE_PREFIX_LANGS.map((code) => {
            const meta = globalLangMeta(code);
            return (
              <Link
                key={code}
                href={atlasLangPath(code)}
                data-lang={code}
                lang={code}
                dir={meta.dir}
              >
                {GLOBAL_LANG_META[code]?.native ?? code}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        id={panelId}
        className={`pronounce-nav-drawer${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <nav className="pronounce-nav-drawer-nav" aria-label="Languages">
          <p className="pronounce-nav-drawer-label">Languages</p>
          <Link href="/" data-lang="zh" lang="zh" onClick={close}>
            {GLOBAL_LANG_META.zh?.native ?? "中文"}
            <span>Chinese</span>
          </Link>
          {PRONOUNCE_PREFIX_LANGS.map((code) => {
            const meta = globalLangMeta(code);
            const enName = getGlobalLang(code)?.name || code;
            return (
              <Link
                key={code}
                href={atlasLangPath(code)}
                data-lang={code}
                lang={code}
                dir={meta.dir}
                onClick={close}
              >
                {GLOBAL_LANG_META[code]?.native ?? code}
                <span>{enName}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {open ? (
        <button
          type="button"
          className="pronounce-nav-backdrop"
          aria-label="Close menu"
          onClick={close}
        />
      ) : null}
    </header>
  );
}
