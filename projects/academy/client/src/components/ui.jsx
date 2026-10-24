import { Fragment } from "react";
import Icon from "./Icon.jsx";
import { useI18n } from "../i18n.jsx";

// Bridge-arch logo: a nod to the suspension bridges of Constantine
export function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? "light" : ""}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="var(--accent)" />
        <path d="M6 27c4-11 24-11 28 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M5 27h30M12 21.5V27M20 19.2V27M28 21.5V27" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="logo-text">Cirta<b>Academy</b></span>
    </span>
  );
}

const CATEGORY_GLYPH = {
  dev: "M14 16l4-4-4-4M10 8l-4 4 4 4",
  lang: "M4 5h9M8.5 3v2M6 5c1 4 4 7 7 8M11 5c-1 4-4 7-7 8M13 21l4-10 4 10M14.5 17h5",
  office: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18",
  business: "M3 17l6-6 4 4 8-8M15 7h6v6",
  school: "M4 20h16M6 20V10M18 20V10M12 4l9 5H3zM10 20v-5h4v5",
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
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={CATEGORY_GLYPH[course.category] || CATEGORY_GLYPH.dev} /></svg>
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

// "Sat & Tue · 18:00–20:00"
export function useSchedule() {
  const { t } = useI18n();
  return (c) => `${c.days.map((d) => t(`day_${d}`)).join(" · ")} — ${c.time}`;
}
