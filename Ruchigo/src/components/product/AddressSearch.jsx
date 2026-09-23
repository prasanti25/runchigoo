import { useEffect, useId, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { apiRequest } from "../../lib/api.js";

export default function AddressSearch({ onChoose }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open || query.trim().length < 4) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      apiRequest("/location/search/", {
        method: "POST",
        body: { query: query.trim(), consent: true },
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(12000),
        ]),
      })
        .then((data) => {
          if (!controller.signal.aborted) {
            setResults(data.results);
            setActive(-1);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            setResults([]);
            setError(err.message);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }, 650);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);
  function choose(row) {
    setQuery(row.formatted_address);
    setOpen(false);
    setResults([]);
    setBusy(false);
    setError("");
    onChoose(row);
  }
  return (
    <div className="address-search">
      <label htmlFor={id}>Search your street, building or area</label>
      <div className="address-search-input">
        <Search size={18} />
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
          aria-controls={`${id}-results`}
          aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
          value={query}
          autoComplete="off"
          maxLength={240}
          placeholder="For example, Connaught Place, Delhi"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setResults([]);
            setActive(-1);
            setBusy(false);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActive(-1);
              setBusy(false);
            }
            if (
              open &&
              results.length &&
              ["ArrowDown", "ArrowUp"].includes(event.key)
            ) {
              event.preventDefault();
              setActive((value) =>
                event.key === "ArrowDown"
                  ? (value + 1) % results.length
                  : (value - 1 + results.length) % results.length,
              );
            }
            if (event.key === "Enter") {
              event.preventDefault();
              if (open && active >= 0 && results[active])
                choose(results[active]);
            }
          }}
        />
      </div>
      {open && query.trim().length >= 4 && (
        <>
          {busy && (
            <p className="form-help" role="status">
              Finding matching addresses…
            </p>
          )}
          {error && (
            <p className="form-help" role="status">
              {error}
            </p>
          )}
          {!!results.length && (
            <ul
              id={`${id}-results`}
              role="listbox"
              aria-label="Address suggestions"
            >
              {results.map((row, index) => (
                <li
                  id={`${id}-${index}`}
                  key={`${row.latitude}:${row.longitude}:${index}`}
                  role="option"
                  aria-selected={active === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(row)}
                >
                  <MapPin size={17} />
                  <span>
                    <strong>{row.label}</strong>
                    <small>{row.formatted_address}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!busy && !error && !results.length && (
            <p className="form-help">
              Add the city or postcode to narrow your search. You can also use
              the map.
            </p>
          )}
        </>
      )}
    </div>
  );
}
