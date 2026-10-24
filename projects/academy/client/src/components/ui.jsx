import { Fragment, useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { useI18n } from "../i18n.jsx";
import { blobUrl } from "../api/blobs.js";

// Plays a lesson video: a demo clip, a signed link from the API, or ("idb:…") a video
// uploaded in demo mode and stored in this browser
export function VideoPlayer({ video, autoPlay = false }) {
  const { t } = useI18n();
  const local = video?.src?.startsWith("idb:");
  const [src, setSrc] = useState(local ? undefined : video?.src);
  useEffect(() => {
    if (!local) { setSrc(video?.src); return; }
    let live = true;
    blobUrl(video.src).then((url) => live && setSrc(url ?? null)).catch(() => live && setSrc(null));
    return () => { live = false; };
  }, [video?.src, local]);

  if (!video) return <div className="player empty"><Icon name="play" size={28} /><p>{t("videoSoon")}</p></div>;
  if (src === null) return <div className="player empty"><Icon name="alert" size={28} /><p>{t("videoOtherDevice")}</p></div>;
  return (
    <figure className="player">
      <video key={src} src={src} poster={video.poster} controls playsInline preload="metadata" autoPlay={autoPlay} muted={autoPlay} loop={autoPlay} />
      {video.credit && (
        <figcaption>
          {t("videoCredit")}: {video.credit.author} · <a href={video.credit.source} target="_blank" rel="noreferrer">{video.credit.license}, Wikimedia Commons</a>
        </figcaption>
      )}
    </figure>
  );
}

// Needle and thread logo
export function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? "light" : ""}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="var(--accent)" />
        <path d="M27.5 8.5 11 25" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="27.6" cy="9.4" rx="1.1" ry="2.2" transform="rotate(45 27.6 9.4)" fill="none" stroke="#fff" strokeWidth="1.4" />
        <path d="M27.6 9.4c-6 2-3 9-9 12s-9 4-8 9" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="logo-text">Atelier <b>Yasmina</b></span>
    </span>
  );
}

const CATEGORY_GLYPH = {
  basics: "M5 19 19 5M17 5h2v2M9 15l-2 2M4 20c3-1 4-4 7-4",
  patterns: "M4 20 20 4M7 17l2 2M10 14l2 2M13 11l2 2M16 8l2 2M3 21l1-4 13-13 3 3L7 20z",
  traditional: "M9 3h6l1 4-2 2 3 12H7l3-12-2-2zM10 13h4M9.5 17h5",
  alterations: "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12",
};

// Generated course cover: the course color with an eight-point star (zellige) pattern
export function CourseCover({ course, compact = false }) {
  const id = `p-${course.slug}`;
  return (
    <div className={`cover ${compact ? "compact" : ""}`} style={{ "--c": course.color }} aria-hidden="true">
      <svg className="cover-pattern" width="100%" height="100%">
        <defs>
          <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M22 4l5 8.5 9.5-1.5-1.5 9.5L44 22l-9 2.5 1.5 9.5-9.5-1.5L22 40l-5-7.5-9.5 1.5 1.5-9.5L0 22l9-2.5L7.5 10l9.5 1.5z" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
      <span className="cover-glyph">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={CATEGORY_GLYPH[course.category] || CATEGORY_GLYPH.basics} /></svg>
      </span>
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 6, color = "var(--accent)", label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label ?? `${value}%`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span>{value}%</span>
    </div>
  );
}

export function Bar({ value, color }) {
  return <span className="bar" style={color ? { "--bar": color } : undefined}><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></span>;
}

export function Avatar({ name, size = 36 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${h} 45% 88%)`, color: `hsl(${h} 45% 28%)` }}>{initials}</span>;
}

export function Loading() {
  const { t } = useI18n();
  return <div className="state" role="status"><span className="spinner" />{t("loading")}</div>;
}

export function ErrorState({ error, onRetry }) {
  const { t, errMsg } = useI18n();
  return (
    <div className="state error" role="alert">
      <Icon name="alert" size={22} />
      <p>{errMsg(error)}</p>
      {onRetry && <button className="btn ghost" onClick={onRetry}><Icon name="refresh" />{t("retry")}</button>}
    </div>
  );
}

export function StatusPill({ status }) {
  const { t } = useI18n();
  return <span className={`pill status-${status}`}>{t(`status_${status}`)}</span>;
}

// Renders the lesson markdown subset: paragraphs, "- " lists, ``` blocks, **bold**, *italic*, `code`
export function Markdown({ text }) {
  const blocks = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const code = [];
      while (++i < lines.length && !lines[i].startsWith("```")) code.push(lines[i]);
      blocks.push(<pre key={i} dir="ltr"><code>{code.join("\n")}</code></pre>);
    } else if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      i--;
      blocks.push(<ul key={i}>{items.map((it, k) => <li key={k}>{inline(it)}</li>)}</ul>);
    } else if (line.trim()) {
      blocks.push(<p key={i}>{inline(line)}</p>);
    }
  }
  return <div className="prose">{blocks}</div>;
}

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`")) return <code key={i} dir="ltr">{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// "Sat · Tue — 18:00–20:00", or "At your own pace" for video-only courses
export function useSchedule() {
  const { t } = useI18n();
  return (c) => (c.days?.length ? `${c.days.map((d) => t(`day_${d}`)).join(" · ")} — ${c.time}` : t("ownPace"));
}

export function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
