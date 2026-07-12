/** Visões serializadas (RSC → client) do setlist. */

export interface SetlistItemView {
  id: string;
  keyOverride: string | null;
  bpmOverride: number | null;
  durationSec: number | null;
  notes: string | null;
  versionId: string | null;
  versionLabel: string | null;
  song: {
    id: string;
    name: string;
    artist: string | null;
    versions: Array<{ id: string; label: string }>;
  };
}
