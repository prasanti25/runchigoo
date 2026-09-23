import { useId } from "react";

// Keep inactive panels mounted so an operator does not lose unsaved edits.
export default function WorkspaceTabs({
  label,
  tabs,
  value,
  onChange,
  children,
}) {
  const id = useId();
  return (
    <div className="workspace-tabbed-sections">
      <div className="workspace-section-tabs" role="tablist" aria-label={label}>
        {tabs.map(([key, title], index) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`${id}-${key}-tab`}
            aria-controls={`${id}-${key}-panel`}
            aria-selected={value === key}
            tabIndex={value === key ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? tabs.length - 1
                    : (index +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        tabs.length) %
                      tabs.length;
              onChange(tabs[next][0]);
              event.currentTarget.parentElement
                .querySelectorAll('[role="tab"]')
                .item(next)
                ?.focus();
            }}
          >
            {title}
          </button>
        ))}
      </div>
      {tabs.map(([key], index) => (
        <section
          key={key}
          role="tabpanel"
          id={`${id}-${key}-panel`}
          aria-labelledby={`${id}-${key}-tab`}
          hidden={value !== key}
          tabIndex={0}
        >
          {children[index]}
        </section>
      ))}
    </div>
  );
}
