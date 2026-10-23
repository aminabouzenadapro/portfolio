import { useI18n } from "../i18n.jsx";
import { MinusIcon, PlusIcon } from "./Icons.jsx";

export default function QtyStepper({ value, onChange, max = 99, small = false }) {
  const { t } = useI18n();
  return (
    <div className={`qty${small ? " qty-sm" : ""}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t("decrease")}>
        <MinusIcon size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={t("increase")}>
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
