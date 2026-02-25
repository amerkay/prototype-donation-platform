/**
 * Canonical icon registry — single source of truth for all icons in the system.
 *
 * Rules:
 * - One semantic name per concept. Never import lucide-vue-next directly; use this module.
 * - To add a new icon: define it here with a semantic ICON_* name, then import from ~/lib/icons.
 * - Icons are grouped by category. Within each category, keep alphabetical order.
 * - For the LucideIcon type (used in sidebar nav item definitions), import `LucideIconType` from here.
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type { LucideIcon as LucideIconType } from 'lucide-vue-next'

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

export { Archive as ICON_ARCHIVE } from 'lucide-vue-next'
export { ArchiveRestore as ICON_RESTORE } from 'lucide-vue-next'
export { Copy as ICON_COPY } from 'lucide-vue-next'
export { Download as ICON_DOWNLOAD } from 'lucide-vue-next'
export { Eye as ICON_VIEW } from 'lucide-vue-next'
export { EyeOff as ICON_HIDE } from 'lucide-vue-next'
export { Filter as ICON_FILTER } from 'lucide-vue-next'
export { Pause as ICON_PAUSE } from 'lucide-vue-next'
export { Pencil as ICON_EDIT } from 'lucide-vue-next'
export { Play as ICON_RESUME } from 'lucide-vue-next'
export { Minus as ICON_MINUS } from 'lucide-vue-next' // quantity decrement / remove one
export { Plus as ICON_CREATE } from 'lucide-vue-next'
export { RefreshCw as ICON_RECURRING } from 'lucide-vue-next' // recurring donation / subscription cycle indicator
export { RefreshCw as ICON_RETRY } from 'lucide-vue-next' // retry payment / reload
export { RotateCcw as ICON_REFUND } from 'lucide-vue-next' // financial refund (reverse a transaction)
export { Save as ICON_SAVE } from 'lucide-vue-next'
export { Search as ICON_SEARCH } from 'lucide-vue-next'
export { Send as ICON_SEND } from 'lucide-vue-next'
export { Share2 as ICON_SHARE } from 'lucide-vue-next'
export { Trash2 as ICON_DELETE } from 'lucide-vue-next'
export { Undo2 as ICON_DISCARD } from 'lucide-vue-next' // discard unsaved changes
export { Unplug as ICON_DISCONNECT } from 'lucide-vue-next'
export { Upload as ICON_UPLOAD } from 'lucide-vue-next'

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

export { ArrowLeft as ICON_BACK } from 'lucide-vue-next'
export { FileText as ICON_FORM } from 'lucide-vue-next' // forms / documents
export { Menu as ICON_MENU } from 'lucide-vue-next' // mobile hamburger menu
export { ArrowRight as ICON_FORWARD } from 'lucide-vue-next'
export { ChevronDown as ICON_CHEVRON_DOWN } from 'lucide-vue-next'
export { ChevronRight as ICON_CHEVRON_RIGHT } from 'lucide-vue-next'
export { ChevronUp as ICON_CHEVRON_UP } from 'lucide-vue-next'
export { ChevronsUpDown as ICON_DROPDOWN_TRIGGER } from 'lucide-vue-next'
export { ExternalLink as ICON_EXTERNAL_LINK } from 'lucide-vue-next'
export { Folder as ICON_FOLDER } from 'lucide-vue-next'
export { MoreHorizontal as ICON_MORE_ACTIONS } from 'lucide-vue-next'

// ─── CLOSE / DISMISS ─────────────────────────────────────────────────────────

/** Soft close: clear filter, cancel inline edit, close dialog */
export { X as ICON_CLOSE } from 'lucide-vue-next'
/** Terminal destructive stop: cancel subscription, end fundraiser, deactivate */
export { OctagonX as ICON_TERMINAL_STOP } from 'lucide-vue-next'

// ─── STATUS / FEEDBACK ───────────────────────────────────────────────────────

export { AlertTriangle as ICON_WARNING } from 'lucide-vue-next' // all warning/alert severity levels
export { Check as ICON_CONFIRM } from 'lucide-vue-next'
export { CheckCircle2 as ICON_SUCCESS_STATUS } from 'lucide-vue-next'
export { Info as ICON_INFO } from 'lucide-vue-next'
export { Loader2 as ICON_LOADING } from 'lucide-vue-next'
export { XCircle as ICON_ERROR_STATUS } from 'lucide-vue-next' // error status pages only

// ─── SORT (data tables) ───────────────────────────────────────────────────────

export { ArrowDown as ICON_SORT_DESC } from 'lucide-vue-next'
export { ArrowUp as ICON_SORT_ASC } from 'lucide-vue-next'
export { ArrowUpDown as ICON_SORT } from 'lucide-vue-next' // unsorted / neutral

// ─── SECTION HEADERS (admin detail cards) ────────────────────────────────────

export { HeartHandshake as ICON_SECTION_GIFT_AID } from 'lucide-vue-next'
export { Receipt as ICON_SECTION_TX_HISTORY } from 'lucide-vue-next'
export { ReceiptText as ICON_SECTION_LINE_ITEMS } from 'lucide-vue-next'
export { ShieldCheck as ICON_SECTION_CONSENT } from 'lucide-vue-next'
export { SlidersHorizontal as ICON_SECTION_CUSTOM_FIELDS } from 'lucide-vue-next'
export { User as ICON_SECTION_DONOR } from 'lucide-vue-next'

// ─── OBJECTS / CONCEPTS ──────────────────────────────────────────────────────

export { Award as ICON_CERTIFICATE } from 'lucide-vue-next'
export { Box as ICON_BOX } from 'lucide-vue-next' // impact products / generic box
export { Cake as ICON_CAKE } from 'lucide-vue-next' // birthday fundraiser preset
export { Calendar as ICON_DATE } from 'lucide-vue-next' // all date contexts (replaces CalendarIcon)
export { CheckCircle as ICON_COMPLETE } from 'lucide-vue-next' // complete / mark done action
export { ClipboardList as ICON_CLIPBOARD_LIST } from 'lucide-vue-next' // registration / entry forms
export { Clock as ICON_TIME_REMAINING } from 'lucide-vue-next' // countdown / deadline
export { CreditCard as ICON_SUBSCRIPTION } from 'lucide-vue-next'
export { DollarSign as ICON_MONEY } from 'lucide-vue-next'
export { Gem as ICON_GEM } from 'lucide-vue-next' // wedding / premium preset
export { Gift as ICON_TRIBUTE } from 'lucide-vue-next'
export { HandHeart as ICON_P2P } from 'lucide-vue-next' // peer-to-peer fundraising nav
export { Heart as ICON_DONATION } from 'lucide-vue-next'
export { History as ICON_HISTORY } from 'lucide-vue-next'
export { Image as ICON_IMAGE } from 'lucide-vue-next' // image upload placeholder
export { Key as ICON_API_KEY } from 'lucide-vue-next'
export { LayoutDashboard as ICON_DASHBOARD } from 'lucide-vue-next'
export { LifeBuoy as ICON_SUPPORT } from 'lucide-vue-next'
export { Mail as ICON_EMAIL } from 'lucide-vue-next'
export { Megaphone as ICON_CAMPAIGN } from 'lucide-vue-next'
export { Package as ICON_PRODUCT } from 'lucide-vue-next'
export { Palette as ICON_PALETTE } from 'lucide-vue-next'
export { PartyPopper as ICON_PARTY_POPPER } from 'lucide-vue-next' // celebration / launch
export { PawPrint as ICON_PAW_PRINT } from 'lucide-vue-next' // animal / pet themed forms
export { Plug as ICON_INTEGRATIONS } from 'lucide-vue-next' // integrations / connections nav
export { PoundSterling as ICON_CURRENCY_GBP } from 'lucide-vue-next' // donations / currency nav
export { Receipt as ICON_RECEIPT } from 'lucide-vue-next'
export { Settings as ICON_SETTINGS } from 'lucide-vue-next'
export { Settings2 as ICON_SETTINGS_2 } from 'lucide-vue-next' // settings nav group
export { ShoppingCart as ICON_CART } from 'lucide-vue-next'
export { Sparkles as ICON_SPARKLES } from 'lucide-vue-next' // recurring adoptions / special features
export { Store as ICON_STORE } from 'lucide-vue-next' // stall booking / marketplace forms
export { Target as ICON_TARGET } from 'lucide-vue-next' // fundraising goal / target
export { TrendingUp as ICON_TRENDING } from 'lucide-vue-next' // growth / upsells / stats
export { Trophy as ICON_TROPHY } from 'lucide-vue-next' // challenge fundraiser preset
export { UserPlus as ICON_USER_PLUS } from 'lucide-vue-next' // invite / add fundraiser
export { Users as ICON_DONORS } from 'lucide-vue-next' // donor group / supporter count
export { Wallet as ICON_WALLET } from 'lucide-vue-next'
export { Webhook as ICON_WEBHOOK } from 'lucide-vue-next'
export { Zap as ICON_ZAP } from 'lucide-vue-next' // basic / quick form template

// ─── SECURITY / COMPLIANCE ────────────────────────────────────────────────────

export { Shield as ICON_PRIVACY } from 'lucide-vue-next' // privacy rights / data protection (GDPR)

// ─── DEVICE (preview modes) ───────────────────────────────────────────────────

export { Monitor as ICON_DESKTOP } from 'lucide-vue-next'
export { Smartphone as ICON_MOBILE } from 'lucide-vue-next'
export { Tablet as ICON_TABLET } from 'lucide-vue-next'

// ─── THEME ────────────────────────────────────────────────────────────────────

export { Moon as ICON_DARK_MODE } from 'lucide-vue-next'
export { Sun as ICON_LIGHT_MODE } from 'lucide-vue-next'

// ─── TEAM ROLES ───────────────────────────────────────────────────────────────

export { Code as ICON_ROLE_DEVELOPER } from 'lucide-vue-next'
export { Crown as ICON_ROLE_OWNER } from 'lucide-vue-next'
export { Shield as ICON_ROLE_ADMIN } from 'lucide-vue-next'
export { User as ICON_ROLE_MEMBER } from 'lucide-vue-next'

// ─── SOCIAL SHARING ───────────────────────────────────────────────────────────

export { Facebook as ICON_SOCIAL_FACEBOOK } from 'lucide-vue-next'
export { Link2 as ICON_SOCIAL_COPY_LINK } from 'lucide-vue-next'
export { Linkedin as ICON_SOCIAL_LINKEDIN } from 'lucide-vue-next'
export { MessageCircle as ICON_SOCIAL_WHATSAPP } from 'lucide-vue-next'
export { Twitter as ICON_SOCIAL_TWITTER } from 'lucide-vue-next'

// ─── USER MENU ────────────────────────────────────────────────────────────────

export { BadgeCheck as ICON_ACCOUNT } from 'lucide-vue-next'
export { CreditCard as ICON_BILLING } from 'lucide-vue-next'
export { LogOut as ICON_LOGOUT } from 'lucide-vue-next'

// ─── FORM FIELDS / RICH TEXT ──────────────────────────────────────────────────

export { Bold as ICON_BOLD } from 'lucide-vue-next'
export { Braces as ICON_VARIABLE } from 'lucide-vue-next'
export { ChevronsUpDown as ICON_COMBOBOX } from 'lucide-vue-next'
export { CircleHelp as ICON_HELP_TEXT } from 'lucide-vue-next'
export { Italic as ICON_ITALIC } from 'lucide-vue-next'
export { Link as ICON_LINK } from 'lucide-vue-next'
export { Smile as ICON_EMOJI } from 'lucide-vue-next'
export { Underline as ICON_UNDERLINE } from 'lucide-vue-next'
