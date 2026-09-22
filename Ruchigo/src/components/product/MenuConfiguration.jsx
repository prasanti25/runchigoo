import { Plus, X } from "lucide-react";

export function ChoiceGroupEditor({ groups, options, onChange }) {
  const update = (index, field, value) =>
    onChange(
      groups.map((group, i) =>
        i === index ? { ...group, [field]: value } : group,
      ),
      options,
    );
  return (
    <fieldset className="choice-group-editor">
      <legend>Size & choice groups</legend>
      <p className="form-help">
        Create a required size or a limited choice, then assign the options
        below. Option prices are added to the base dish price.
      </p>
      {groups.map((group, index) => (
        <div className="choice-group-row" key={group.id}>
          <label className="field">
            <span>Group name</span>
            <input
              required
              maxLength={60}
              value={group.name}
              onChange={(event) => update(index, "name", event.target.value)}
              placeholder="Choose your size"
            />
          </label>
          <label className="field">
            <span>Minimum choices</span>
            <input
              required
              type="number"
              min="0"
              max="12"
              value={group.min_select}
              onChange={(event) =>
                update(index, "min_select", Number(event.target.value))
              }
            />
          </label>
          <label className="field">
            <span>Maximum choices</span>
            <input
              required
              type="number"
              min="1"
              max="12"
              value={group.max_select}
              onChange={(event) =>
                update(index, "max_select", Number(event.target.value))
              }
            />
          </label>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${group.name || "choice group"}`}
            onClick={() =>
              onChange(
                groups.filter((_, i) => i !== index),
                options.map((option) =>
                  option.group_id === group.id
                    ? { ...option, group_id: "" }
                    : option,
                ),
              )
            }
          >
            <X size={17} />
          </button>
        </div>
      ))}
      <button
        className="btn secondary"
        type="button"
        disabled={groups.length >= 4}
        onClick={() =>
          onChange(
            [
              ...groups,
              {
                id: `group_${crypto.randomUUID()}`,
                name: "Choose a size",
                min_select: 1,
                max_select: 1,
              },
            ],
            options,
          )
        }
      >
        <Plus size={16} />
        Add choice group
      </button>
    </fieldset>
  );
}

export function OpeningHoursEditor({ value = [], onChange }) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const update = (index, field, text) =>
    onChange(
      value.map((day, i) =>
        i === index
          ? { open: "09:00", close: "22:00", ...day, [field]: text }
          : day,
      ),
    );
  return (
    <fieldset className="opening-hours-editor">
      <legend>Weekly opening hours</legend>
      <p className="form-help">
        Indian Standard Time. The accepting-orders switch can pause service at
        any time. Without a schedule, that switch alone controls availability.
      </p>
      <label className="check-label">
        <input
          type="checkbox"
          checked={value.length === 7}
          onChange={(event) =>
            onChange(
              event.target.checked
                ? days.map(() => ({
                    closed: false,
                    open: "09:00",
                    close: "22:00",
                  }))
                : [],
            )
          }
        />
        Use a weekly schedule
      </label>
      {!!value.length && (
        <>
          <div className="hours-table">
            {days.map((name, index) => (
              <div key={name} className="hours-row">
                <label className="check-label">
                  <input
                    type="checkbox"
                    aria-label={`${name} open`}
                    checked={!value[index].closed}
                    onChange={(event) =>
                      update(index, "closed", !event.target.checked)
                    }
                  />
                  {name}
                </label>
                {value[index].closed ? (
                  <span className="muted">Closed</span>
                ) : (
                  <>
                    <input
                      aria-label={`${name} opening time`}
                      type="time"
                      required
                      value={value[index].open || "09:00"}
                      onChange={(event) =>
                        update(index, "open", event.target.value)
                      }
                    />
                    <span>to</span>
                    <input
                      aria-label={`${name} closing time`}
                      type="text"
                      inputMode="numeric"
                      pattern="([01][0-9]|2[0-3]):[0-5][0-9]|24:00"
                      placeholder="22:00"
                      required
                      value={value[index].close || "22:00"}
                      onChange={(event) =>
                        update(index, "close", event.target.value)
                      }
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          <p className="form-help">
            Use 24:00 for midnight. Split overnight service into two days.
          </p>
        </>
      )}
    </fieldset>
  );
}

export function RestaurantHours({ restaurant }) {
  if (!restaurant.opening_hours?.length) return null;
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return (
    <details className="restaurant-hours">
      <summary>Opening hours · IST</summary>
      <dl>
        {restaurant.opening_hours.map((day, index) => (
          <div key={index}>
            <dt>{days[index]}</dt>
            <dd>{day.closed ? "Closed" : `${day.open}–${day.close}`}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
