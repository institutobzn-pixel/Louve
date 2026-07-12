import type { ChecklistItemView } from "./components/checklist-panel";

interface ChecklistState {
  items: Array<{ id: string; label: string; isDone: boolean }>;
  setlistCount: number;
  scheduledCount: number;
  seenCount: number;
  hasPalette: boolean;
  stagePinCount: number;
}

/**
 * Enriquece os itens semeados do checklist com o estado real do
 * planejamento. Itens conhecidos viram "automáticos" (refletem os outros
 * módulos); os demais permanecem manuais.
 */
export function buildChecklist(state: ChecklistState): ChecklistItemView[] {
  return state.items.map((item) => {
    const label = item.label.toLowerCase();

    if (label.includes("setlist")) {
      return {
        ...item,
        auto: {
          done: state.setlistCount > 0,
          hint:
            state.setlistCount > 0
              ? `${state.setlistCount} música${state.setlistCount === 1 ? "" : "s"}`
              : "Nenhuma música",
        },
      };
    }

    if (label.includes("escala")) {
      return {
        ...item,
        auto: {
          done: state.scheduledCount > 0,
          hint:
            state.scheduledCount > 0
              ? `${state.scheduledCount} escalado${state.scheduledCount === 1 ? "" : "s"}`
              : "Ninguém escalado",
        },
      };
    }

    if (label.includes("paleta")) {
      return {
        ...item,
        auto: {
          done: state.hasPalette,
          hint: state.hasPalette ? "Definida" : "Não definida",
        },
      };
    }

    if (label.includes("mapa")) {
      return {
        ...item,
        auto: {
          done: state.stagePinCount > 0,
          hint:
            state.stagePinCount > 0
              ? `${state.stagePinCount} posiçã${state.stagePinCount === 1 ? "o" : "es"}`
              : "Não definido",
        },
      };
    }

    // "Confirmações" no modelo sem convite = quantos já viram a escala.
    if (label.includes("confirma")) {
      return {
        ...item,
        label: "Visualizações da escala",
        auto: {
          done:
            state.scheduledCount > 0 &&
            state.seenCount === state.scheduledCount,
          hint: `${state.seenCount}/${state.scheduledCount} viram`,
        },
      };
    }

    // "Material enviado", "Passagem de som" → manuais.
    return item;
  });
}
