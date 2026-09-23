"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Slot } from "../lib/slot";
import { useControllableState, useEscapeKey, useOutsideClick } from "../lib/hooks";

interface NavContext {
  open: string | null;
  setOpen: (value: string | null) => void;
  hoverIntent: boolean;
}

const NavigationMenuContext = React.createContext<NavContext | null>(null);

export interface NavigationMenuProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  /** Welk item openstaat (controlled). */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Panelen openen bij hover; standaard aan op een muis. */
  openOnHover?: boolean;
  /** Vult de volle breedte en zet de items uit elkaar. */
  block?: boolean;
}

export interface NavigationMenuItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "title"> {
  /** Unieke sleutel; nodig zodra er een paneel onder hangt. */
  value?: string;
  /** Tekst op de knop of link. */
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Zonder kinderen wordt het een gewone link. */
  href?: string;
  active?: boolean;
  /** Breed paneel over de hele balk in plaats van een smal menu. */
  mega?: boolean;
}

export interface NavigationMenuLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Rendert jouw eigen element, bv. next/link. */
  asChild?: boolean;
}

export interface NavigationMenuSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
}

/**
 * NavigationMenu — horizontale hoofdnavigatie met uitklappende panelen. Hover
 * opent, Escape en een klik ernaast sluiten, en de pijltjes lopen door de balk.
 */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  function NavigationMenu(
    { value, defaultValue = null, onValueChange, openOnHover = true, block, className, children, ...rest },
    ref
  ) {
    const [open, setOpen] = useControllableState<string | null>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const host = React.useRef<HTMLElement | null>(null);

    useOutsideClick([host], () => setOpen(null), open !== null);
    useEscapeKey(() => setOpen(null), open !== null);

    const context = React.useMemo<NavContext>(
      () => ({ open, setOpen, hoverIntent: openOnHover }),
      [open, setOpen, openOnHover]
    );

    const opToets = (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const knoppen = Array.from(
        host.current?.querySelectorAll<HTMLElement>("[data-nav-trigger]") ?? []
      );
      const index = knoppen.indexOf(document.activeElement as HTMLElement);
      if (index === -1) return;
      event.preventDefault();
      const volgende = knoppen[(index + (event.key === "ArrowRight" ? 1 : -1) + knoppen.length) % knoppen.length];
      volgende?.focus();
    };

    return (
      <NavigationMenuContext.Provider value={context}>
        <nav
          ref={(node) => {
            host.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
          }}
          className={cn("lui-navmenu", block && "lui-navmenu-block", className)}
          onKeyDown={opToets}
          {...rest}
        >
          <ul className="lui-navmenu-list">{children}</ul>
        </nav>
      </NavigationMenuContext.Provider>
    );
  }
);

/** Eén item in de balk; met kinderen krijgt het een uitklappaneel. */
export const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem(
    { value, label, icon, href, active, mega, className, children, ...rest },
    ref
  ) {
    const context = React.useContext(NavigationMenuContext);
    if (!context) throw new Error("NavigationMenuItem moet binnen <NavigationMenu> staan.");

    const auto = React.useId();
    const sleutel = value ?? auto;
    const heeftPaneel = React.Children.count(children) > 0;
    const open = context.open === sleutel;

    const sluitTimer = React.useRef<number | undefined>(undefined);
    const plan = (naar: string | null) => {
      window.clearTimeout(sluitTimer.current);
      sluitTimer.current = window.setTimeout(() => context.setOpen(naar), naar === null ? 140 : 0);
    };
    React.useEffect(() => () => window.clearTimeout(sluitTimer.current), []);

    return (
      <li
        ref={ref}
        className={cn("lui-navmenu-item", className)}
        onMouseEnter={() => heeftPaneel && context.hoverIntent && plan(sleutel)}
        onMouseLeave={() => heeftPaneel && context.hoverIntent && plan(null)}
        {...rest}
      >
        {heeftPaneel ? (
          <button
            type="button"
            data-nav-trigger=""
            data-open={open ? "" : undefined}
            data-active={active ? "" : undefined}
            aria-expanded={open}
            className="lui-navmenu-trigger"
            onClick={() => context.setOpen(open ? null : sleutel)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && !open) {
                event.preventDefault();
                context.setOpen(sleutel);
              }
            }}
          >
            {icon}
            {label}
            <Icon name="chevronDown" size={14} className="lui-navmenu-chevron" />
          </button>
        ) : (
          <a
            href={href}
            data-nav-trigger=""
            data-active={active ? "" : undefined}
            className="lui-navmenu-trigger"
          >
            {icon}
            {label}
          </a>
        )}

        {heeftPaneel && open && (
          <div className={cn("lui-navmenu-panel", mega && "lui-navmenu-panel-mega")} role="group">
            {children}
          </div>
        )}
      </li>
    );
  }
);

/** Kolom met een kopje in een megapaneel. */
export const NavigationMenuSection = React.forwardRef<HTMLDivElement, NavigationMenuSectionProps>(
  function NavigationMenuSection({ label, className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("lui-navmenu-section", className)} {...rest}>
        {label && <div className="lui-navmenu-section-label">{label}</div>}
        {children}
      </div>
    );
  }
);

/** Link in een paneel, met titel en toelichting. */
export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink({ title, description, icon, asChild, className, ...rest }, ref) {
    const Comp = (asChild ? Slot : "a") as React.ElementType;
    return (
      <Comp ref={ref} className={cn("lui-navmenu-link", className)} {...rest}>
        {icon && <span className="lui-navmenu-link-icon">{icon}</span>}
        <span>
          <span className="lui-navmenu-link-title">{title}</span>
          {description && <span className="lui-navmenu-link-desc">{description}</span>}
        </span>
      </Comp>
    );
  }
);
