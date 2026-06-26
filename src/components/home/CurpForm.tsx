"use client";

import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { CURP_REGEX, getCurpValidationError } from "@/lib/curp";
import { useCurpHistory } from "@/lib/hooks/useCurpHistory";
import { cn } from "@/lib/utils";

type Props = {
  loading: boolean;
  onSubmit: (curp: string) => void;
};

export function CurpForm({ loading, onSubmit }: Props) {
  const [curp, setCurp] = useState("");
  const [touched, setTouched] = useState(false);
  const { history, saveToHistory } = useCurpHistory();

  const validationError = getCurpValidationError(curp);
  const isValid = CURP_REGEX.test(curp);

  const submit = (value: string) => {
    if (!CURP_REGEX.test(value) || loading) return;
    saveToHistory(value);
    onSubmit(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    submit(curp);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label
        htmlFor="curp"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Tu CURP
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="curp"
          name="curp"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          maxLength={18}
          placeholder="ABCD000000HDFXYZ01"
          value={curp}
          onChange={(e) => setCurp(e.target.value.toUpperCase().trim())}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && !!validationError}
          className={cn(
            "flex-1 rounded-xl border bg-white px-4 py-3 font-mono text-base tracking-wider text-slate-900 outline-none transition",
            "focus:ring-2 focus:ring-slate-900/10",
            touched && validationError
              ? "border-rose-300"
              : "border-slate-300 focus:border-slate-400",
          )}
        />
        <button
          type="submit"
          disabled={!isValid || loading}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition",
            "bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300",
          )}
        >
          <Search className="size-4" aria-hidden />
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </div>

      {touched && validationError ? (
        <p className="mt-2 text-sm text-rose-600">{validationError}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-400">
          18 caracteres. No guardamos tu CURP ni los resultados.
        </p>
      )}

      {history.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Recientes</p>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setCurp(h);
                  submit(h);
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
