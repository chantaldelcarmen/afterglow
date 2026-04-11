import { BackButton } from "./BackButton";
import { H2, BodySmall } from "./Typography";

interface SubpageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  hideBack?: boolean;
}

export function SubpageHeader({ title, subtitle, onBack, hideBack }: SubpageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 pt-6 pb-6 px-6">
      <div className="relative flex items-center justify-center mb-1">
        {!hideBack && (
          <div className="absolute left-0">
            <BackButton onClick={onBack} />
          </div>
        )}
        <H2>{title}</H2>
      </div>
      {subtitle && (
        <BodySmall className="text-center mt-1" style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>
          {subtitle}
        </BodySmall>
      )}
    </div>
  );
}
