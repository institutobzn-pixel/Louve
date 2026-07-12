import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchFormProps {
  placeholder: string;
  defaultValue?: string;
  /** Rota alvo do GET (ex.: /equipe). O termo vai no query param `q`. */
  action: string;
}

/** Busca server-side simples via GET — funciona sem JS e com RSC. */
export function SearchForm({
  placeholder,
  defaultValue,
  action,
}: SearchFormProps) {
  return (
    <form action={action} className="relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="pl-9"
      />
    </form>
  );
}
