import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, VolumeX } from "lucide-react";
import {
  isSoundMuted,
  setSoundMuted,
  subscribeSoundMuted,
} from "../../lib/clickSound";

export function SoundToggle() {
  const { t } = useTranslation();
  const muted = useSyncExternalStore(
    subscribeSoundMuted,
    isSoundMuted,
    () => false,
  );

  return (
    <button
      type="button"
      onClick={() => setSoundMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? t("sound.unmute") : t("sound.mute")}
      title={muted ? t("sound.unmute") : t("sound.mute")}
      className="pointer-events-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--glass)] text-[var(--copper)] backdrop-blur-md transition-colors hover:text-[var(--ink)]"
    >
      {muted ? <VolumeX size={16} strokeWidth={1.75} /> : <Volume2 size={16} strokeWidth={1.75} />}
    </button>
  );
}
