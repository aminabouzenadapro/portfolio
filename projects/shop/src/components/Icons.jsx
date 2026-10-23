// Small inline icon set (stroke icons, 24x24)
const Icon = ({ children, size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const BagIcon = (p) => <Icon {...p}><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon>;
export const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>;
export const CloseIcon = (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>;
export const PlusIcon = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const MinusIcon = (p) => <Icon {...p}><path d="M5 12h14" /></Icon>;
export const TrashIcon = (p) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Icon>;
export const FilterIcon = (p) => <Icon {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Icon>;
export const CheckIcon = (p) => <Icon {...p}><path d="M5 12l5 5L20 7" /></Icon>;
export const TruckIcon = (p) => <Icon {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></Icon>;
export const ReturnIcon = (p) => <Icon {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></Icon>;
export const ShieldIcon = (p) => <Icon {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /></Icon>;
export const ArrowLeftIcon = (p) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>;
export const ChevronIcon = (p) => <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;
export const LockIcon = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>;
export const CashIcon = (p) => <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" /></Icon>;
export const HandIcon = (p) => <Icon {...p}><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2 8 12.7 4 8.8l5.5-.8L12 3z" /></Icon>;
export const CardIcon = (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></Icon>;

export const PhoneIcon = (p) => <Icon {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></Icon>;
export const PinIcon = (p) => <Icon {...p}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></Icon>;
export const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const InstagramIcon = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></Icon>;
export const FacebookIcon = (p) => <Icon {...p}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3.5h2V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" /></Icon>;
export const MenuIcon = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;


// Category icons
export const DeviceIcon = (p) => <Icon {...p}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Icon>;
export const LaptopIcon = (p) => <Icon {...p}><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></Icon>;
export const HeadphonesIcon = (p) => <Icon {...p}><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></Icon>;
export const WatchIcon = (p) => <Icon {...p}><rect x="6" y="6" width="12" height="12" rx="3" /><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 10v2l1.5 1" /></Icon>;
export const GamepadIcon = (p) => <Icon {...p}><path d="M7 7h10a5 5 0 0 1 4.9 6l-.6 3a3 3 0 0 1-5.3 1.2L14.5 15h-5L8 17.2A3 3 0 0 1 2.7 16l-.6-3A5 5 0 0 1 7 7z" /><path d="M7 10v3M5.5 11.5h3M16 11h.01M18 13h.01" /></Icon>;
export const PlugIcon = (p) => <Icon {...p}><path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7zM12 17v5" /></Icon>;
export const BadgeCheckIcon = (p) => <Icon {...p}><path d="M12 2l2.4 1.8 3 .1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3 .1L12 22l-2.4-1.8-3-.1-.9-2.9L3.3 15.4l.9-2.9-.9-2.9 2.4-1.8.9-2.9 3-.1L12 2z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></Icon>;
export const CATEGORY_ICONS = { phone: DeviceIcon, laptop: LaptopIcon, headphones: HeadphonesIcon, watch: WatchIcon, gamepad: GamepadIcon, plug: PlugIcon };

// Admin icons
export const GridIcon = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Icon>;
export const ReceiptIcon = (p) => <Icon {...p}><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></Icon>;
export const BoxIcon = (p) => <Icon {...p}><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" /><path d="M3 7l9 4 9-4M12 11v10" /></Icon>;
export const LogoutIcon = (p) => <Icon {...p}><path d="M15 4h4v16h-4M10 16l-4-4 4-4M6 12h10" /></Icon>;
export const EditIcon = (p) => <Icon {...p}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13 7l4 4" /></Icon>;
export const ExternalIcon = (p) => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></Icon>;
export const RefreshIcon = (p) => <Icon {...p}><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4" /></Icon>;
export const UploadIcon = (p) => <Icon {...p}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></Icon>;
export const AlertIcon = (p) => <Icon {...p}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4M12 17.5v.01" /></Icon>;
export const TrendUpIcon = (p) => <Icon {...p}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></Icon>;
export const DownloadIcon = (p) => <Icon {...p}><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></Icon>;
