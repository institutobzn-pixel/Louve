"use client";

import {
  CheckSquare,
  ListMusic,
  MapPin,
  Megaphone,
  Music4,
  Palette,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceTabsProps {
  /** Conteúdo da aba Setlist (board drag-and-drop). */
  setlistContent: React.ReactNode;
  /** Conteúdo da aba Escala (board por categorias). */
  scheduleContent: React.ReactNode;
  /** Conteúdo da aba Paleta de Roupas. */
  paletteContent: React.ReactNode;
  /** Conteúdo da aba Mapa de Palco. */
  stageMapContent: React.ReactNode;
  /** Conteúdo da aba Avisos. */
  noticesContent: React.ReactNode;
  /** Conteúdo da aba Checklist. */
  checklistContent: React.ReactNode;
  /** Link para o Modo Ensaio deste culto (App do Músico). */
  rehearsalHref: string;
}

/**
 * Abas da página exclusiva do culto (docs/06-navegacao-fluxos.md).
 * Informações só é preenchida na criação do culto — aqui convergem as
 * demais facetas: Escala, Setlist, Modo Ensaio (link para o app do
 * músico), Paleta, Mapa de Palco, Avisos e Checklist.
 */
export function ServiceTabs({
  setlistContent,
  scheduleContent,
  paletteContent,
  stageMapContent,
  noticesContent,
  checklistContent,
  rehearsalHref,
}: ServiceTabsProps) {
  return (
    <Tabs defaultValue="escala">
      <div className="overflow-x-auto pb-1">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="escala">
            <Users className="h-4 w-4" /> Escala
          </TabsTrigger>
          <TabsTrigger value="setlist">
            <ListMusic className="h-4 w-4" /> Setlist
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

      <TabsContent value="escala">{scheduleContent}</TabsContent>

      <TabsContent value="setlist">{setlistContent}</TabsContent>

      <TabsContent value="ensaio">
        <EmptyState
          icon={Music4}
          title="Modo Ensaio Inteligente"
          description="Cada músico escalado vê somente o material da sua função no App do Músico: partitura, playback, multitrack, clique e loop — ou letra, guia e tom para vocais."
          action={
            <Button asChild variant="outline">
              <a href={rehearsalHref}>
                <Music4 /> Ver como músico escalado
              </a>
            </Button>
          }
        />
      </TabsContent>

      <TabsContent value="paleta">{paletteContent}</TabsContent>

      <TabsContent value="palco">{stageMapContent}</TabsContent>

      <TabsContent value="avisos">{noticesContent}</TabsContent>

      <TabsContent value="checklist">{checklistContent}</TabsContent>
    </Tabs>
  );
}
