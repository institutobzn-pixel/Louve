# 01 · Visão de Produto

## O problema

Ministérios de louvor coordenam, a cada culto, uma operação complexa: repertório, tonalidades,
arranjos, materiais de estudo, escala de músicos e produção, ensaios, figurino, palco e
comunicação. Hoje isso vive espalhado em grupos de WhatsApp, planilhas e PDFs soltos. As
ferramentas de mercado tratam o problema como "escala" — uma lista de nomes por função. Isso
resolve 10% da dor.

## A tese

O verdadeiro objeto de trabalho não é a escala: é o **culto**. Tudo — setlist, escala, ensaio,
figurino, palco, avisos, checklist — é uma **faceta do planejamento de um culto**.

> O usuário nunca pensa "vou criar uma escala".
> Ele pensa **"vou planejar o culto de domingo."**

Por isso o **Culto** é a entidade central do produto, e cada culto tem uma **página exclusiva**
com abas. Toda navegação, todo dado e todo relatório orbitam essa entidade.

## Posicionamento

Produto **premium**, categoria "workspace de ministério" — não um ERP, não um app de escala.
Referências de qualidade de experiência: **Linear, Notion, Figma, Spotify, Apple, Stripe
Dashboard**. Comercializável como **SaaS multi-tenant** mundial (cada igreja é um tenant, com
possibilidade de múltiplos campi).

## Princípios de produto

Cada decisão prioriza, nesta ordem:

1. **Experiência do usuário** — clareza acima de densidade.
2. **Simplicidade** — o caminho óbvio é o certo.
3. **Velocidade** — resposta instantânea, otimista, sem recarregar.
4. **Escalabilidade** — cresce de 1 igreja para 10.000 sem reescrever.
5. **Organização** — cada coisa tem um lugar previsível.

## Personas

| Persona | Objetivo primário | Como usa |
|---|---|---|
| **Líder de Louvor** | Planejar cultos de ponta a ponta | Cria o culto, monta setlist, define escala, acompanha checklist |
| **Coordenador Musical** | Garantir qualidade musical e ensaios | Curadoria da biblioteca, implantação de músicas, Modo Ensaio |
| **Pastor** | Visão e alinhamento do culto | Consulta tema, setlist e avisos; aprova direção |
| **Secretário** | Apoio administrativo | Cadastros, comunicação, relatórios |
| **Técnico de Som / Produção** | Operação técnica | Mapa de palco, checklist de produção, materiais |
| **Músico / Vocal** | Executar com excelência | Vê só o que lhe cabe: agenda, escala, Modo Ensaio, confirmar presença |
| **Administrador (Geral)** | Governança do tenant | Usuários, papéis, campi, configurações, billing |

## Jobs-to-be-done (núcleo)

- *Quando* vou preparar o domingo, *quero* abrir um único lugar que reúna repertório, pessoas e
  materiais, *para* não caçar informação em cinco apps.
- *Quando* monto o repertório, *quero* reaproveitar músicas já implantadas com suas versões,
  tons e arquivos, *para* garantir consistência.
- *Quando* escalo a equipe, *quero* que o sistema sugira substituições por disponibilidade e
  função, *para* fechar a escala rápido.
- *Quando* sou músico, *quero* ver **apenas** meu material de estudo (partitura, playback,
  clique, guia), *para* ensaiar sem ruído.
- *Quando* reviso a saúde do ministério, *quero* saber o que está saturado e o que está
  esquecido, *para* equilibrar o repertório.

## Escopo do MVP vs. futuro

**MVP (núcleo do planejamento):** Culto, Setlist, Escala, Biblioteca Musical, Implantação,
Equipe, Modo Ensaio, Checklist, Auth + Permissões, Dashboard.
**Fase 2:** Relatórios avançados (saturação, ranking), Mapa de Palco gráfico, Paleta de Roupas,
Comunicação, Realtime colaborativo, billing/SaaS.

O detalhamento de ordem e critérios de aceite está em [11-roadmap.md](11-roadmap.md).
