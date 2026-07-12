"use client";

import {
  CheckSquare,
  Info,
  ListMusic,
  MapPin,
  Megaphone,
  Music4,
  Palette,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ChecklistItemView {
  id: string;
  label: string;
  isDone: boolean;
}

interface ServiceTabsProps {
  /** Conteúdo da aba Informações (formulário RSC-hidratado). */
  infoContent: React.ReactNode;
  /** Conteúdo da aba Setlist (board drag-and-drop). */
  setlistContent: React.ReactNode;
  checklistItems: ChecklistItemView[];
}

/**
 * Abas da página exclusiva do culto (docs/06-navegacao-fluxos.md).
 * Informações e Setlist funcionais; Checklist com itens semeados (leitura);
 * demais abas chegam nas próximas fases.
 */
export function ServiceTabs({
  infoContent,
  setlistContent,
  checklistItems,
}: ServiceTabsProps) {
  return (
    <Tabs defaultValue="informacoes">
      <div className="overflow-x-auto pb-1">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="informacoes">
            <Info className="h-4 w-4" /> Informações
          </TabsTrigger>
          <TabsTrigger value="setlist">
            <ListMusic className="h-4 w-4" /> Setlist
          </TabsTrigger>
          <TabsTrigger value="escala">
            <Users className="h-4 w-4" /> Escala
          </TabsTrigger>
          <TabsTrigger value="ensaio">
            <Music4 className="h-4 w-4" /> Modo Ensaio
          </TabsTrigger>
          <TabsTrigger value="paleta">
            <Palette className="h-4 w-4" /> Paleta
          </TabsTrigger>
          <TabsTrigger value="palco">
            <MapPin className="h-4 w-4" /> Mapa de Palco
          </TabsTrigger>
          <TabsTrigger value="avisos">
            <Megaphone className="h-4 w-4" /> Avisos
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <CheckSquare className="h-4 w-4" /> Checklist
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="informacoes">
        <Card>
          <CardContent className="pt-6">{infoContent}</CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="setlist">{setlistContent}</TabsContent>

      <TabsContent value="escala">
        <EmptyState
          icon={Users}
          title="Escala por categorias"
          description="Liderança, Voz, Ritmo, Harmonia, Cordas, Sopros, Percussão e Produção — chega na Fase 4."
        />
      </TabsContent>

      <TabsContent value="ensaio">
        <EmptyState
          icon={Music4}
          title="Modo Ensaio Inteligente"
          description="Cada músico vê somente o material da sua função — chega na Fase 5."
        />
      </TabsContent>

      <TabsContent value="paleta">
        <EmptyState
          icon={Palette}
          title="Paleta de Roupas"
          description="Cores, observações e referência visual do culto — chega na Fase 6."
        />
      </TabsContent>

      <TabsContent value="palco">
        <EmptyState
          icon={MapPin}
          title="Mapa de Palco"
          description="Posicionamento gráfico dos músicos — chega na Fase 6."
        />
      </TabsContent>

      <TabsContent value="avisos">
        <EmptyState
          icon={Megaphone}
          title="Avisos do culto"
          description="Mensagens específicas deste culto — chega na Fase 6."
        />
      </TabsContent>

      <TabsContent value="checklist">
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-2.5">
              {checklistItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border",
                      item.isDone
                        ? "border-success bg-success text-success-foreground"
                        : "border-input"
                    )}
                    aria-hidden
                  >
                    {item.isDone ? "✓" : ""}
                  </span>
                  <span
                    className={cn(
                      item.isDone && "text-muted-foreground line-through"
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Os itens são marcados automaticamente conforme os módulos das
              próximas fases forem concluídos.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
