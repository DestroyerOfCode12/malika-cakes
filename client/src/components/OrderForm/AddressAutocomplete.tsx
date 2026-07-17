import React, { useEffect, useRef, useState } from 'react';
import { placesService } from '../../services/placesService';
import { PlaceSuggestion } from '../../types';

interface AddressAutocompleteProps {
  value: string;
  onSelect: (result: { address: string; latitude: number; longitude: number }) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * Google Places-backed address field: type-ahead suggestions, keyboard
 * nav, and resolves the chosen suggestion to a formatted address +
 * precise lat/lng (passed straight to Uber Direct — see the delivery
 * quote flow in Step5). Session tokens group each search so Google
 * bills it as one session rather than per-keystroke.
 */
const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onSelect, onClear, disabled }) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState(Boolean(value));

  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = 'address-suggestions';

  useEffect(() => {
    if (selected) return; // don't re-search right after picking a result
    if (inputValue.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await placesService.autocomplete(inputValue.trim(), sessionTokenRef.current);
        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
      } catch (err: any) {
        setSuggestions([]);
        setOpen(false);
        if (err?.response?.status === 503) {
          setError("Address lookup isn't available right now.");
        } else {
          setError("Couldn't search addresses. Try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, selected]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const pickSuggestion = async (suggestion: PlaceSuggestion) => {
    setOpen(false);
    setResolving(true);
    setError(null);
    try {
      const details = await placesService.getDetails(suggestion.placeId, sessionTokenRef.current);
      setInputValue(details.formattedAddress);
      setSelected(true);
      onSelect({
        address: details.formattedAddress,
        latitude: details.latitude,
        longitude: details.longitude,
      });
      // Start a fresh session for the next search, per Google's billing model.
      sessionTokenRef.current = crypto.randomUUID();
    } catch {
      setError("Couldn't get details for that address. Try another.");
    } finally {
      setResolving(false);
    }
  };

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    if (selected) {
      setSelected(false);
      onClear();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `address-option-${activeIndex}` : undefined}
        aria-autocomplete="list"
        className="input-base"
        placeholder="Start typing your address..."
        value={inputValue}
        disabled={disabled || resolving}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && !selected && setOpen(true)}
      />

      {(loading || resolving) && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {resolving ? 'Confirming...' : 'Searching...'}
        </span>
      )}

      {selected && !resolving && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pink" aria-hidden="true">
          ✓
        </span>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.placeId}
              id={`address-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                pickSuggestion(s);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`px-4 py-2 text-sm cursor-pointer ${
                idx === activeIndex ? 'bg-pink-light text-pink' : 'hover:bg-gray-50'
              }`}
            >
              {s.text}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
