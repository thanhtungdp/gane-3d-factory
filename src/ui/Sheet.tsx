import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { IconClose } from "./Icons";

type SheetVariant = "bottom" | "center";

export function Sheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  className,
  testId,
  dismissible = true,
  variant = "bottom",
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  testId?: string;
  dismissible?: boolean;
  variant?: SheetVariant;
  ariaLabel?: string;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusFirst = () => {
      const target =
        closeRef.current ??
        (sheetRef.current?.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ||
          sheetRef.current);
      target?.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const focusables = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) {
        event.preventDefault();
        sheetRef.current.focus();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === sheetRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose, dismissible]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={clsx("overlay", variant === "center" && "overlay--center")}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? "Hộp thoại"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissible) onClose();
      }}
      data-testid={testId}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={clsx("sheet", variant === "center" && "sheet--center", className)}
      >
        <div className="sheet__grab" aria-hidden />
        <div className="row-between mb-4 shrink-0">
          <div className="min-w-0">
            {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
            {title ? <h2 className="h2">{title}</h2> : null}
          </div>
          {dismissible ? (
            <button ref={closeRef} className="icon-btn shrink-0" onClick={onClose} aria-label="Đóng">
              <IconClose size={18} />
            </button>
          ) : null}
        </div>
        <div className="sheet__body">{children}</div>
        {footer ? <div className="sheet__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
