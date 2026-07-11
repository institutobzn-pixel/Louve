# 03 · Design System

## Identidade visual

Ainda **não existe nome** para o produto. Usar apenas um **logotipo temporário**: um ícone
**abstrato** relacionado à música (ex.: onda sonora / diapasão estilizado em formas geométricas),
sem texto de marca fixo.

A identidade deve transmitir: **elegância · tecnologia · excelência · organização · criatividade ·
música.**

**Nunca:** aparência infantil · excesso de cores · cara de ERP.

## Paleta

**Primária — Violeta Profundo.** **Secundária — Preto.** Complementos em **tons neutros**.
Cores são usadas com parcimônia; a interface é majoritariamente neutra, com o violeta reservado
para ações primárias, foco e destaque.

### Tokens de cor (HSL — CSS variables)

Definidos como CSS variables e mapeados no `tailwind.config.ts`. Dois temas (dark é o padrão de
caráter do produto; light é totalmente suportado).

```css
:root { /* Light */
  --background: 0 0% 100%;
  --foreground: 260 15% 12%;
  --card: 0 0% 100%;
  --muted: 260 12% 96%;
  --muted-foreground: 260 8% 45%;
  --border: 260 12% 90%;
  --input: 260 12% 90%;
  --ring: 265 84% 58%;

  --primary: 265 84% 58%;          /* Violeta Profundo */
  --primary-foreground: 0 0% 100%;
  --secondary: 260 10% 12%;        /* Preto/quase-preto */
  --secondary-foreground: 0 0% 98%;
  --accent: 265 60% 96%;

  --success: 152 60% 42%;          /* semáforo: verde */
  --warning: 40 92% 52%;           /* semáforo: amarelo */
  --danger: 0 72% 52%;             /* semáforo: vermelho */
  --radius: 0.75rem;
}

.dark { /* Dark (padrão de caráter) */
  --background: 260 18% 7%;
  --foreground: 260 10% 96%;
  --card: 260 16% 10%;
  --muted: 260 12% 16%;
  --muted-foreground: 260 8% 62%;
  --border: 260 12% 18%;
  --input: 260 12% 18%;
  --ring: 265 84% 66%;

  --primary: 265 84% 66%;
  --primary-foreground: 260 20% 8%;
  --secondary: 260 10% 92%;
  --secondary-foreground: 260 18% 8%;
  --accent: 265 40% 20%;

  --success: 152 55% 46%;
  --warning: 40 90% 56%;
  --danger: 0 70% 58%;
}
```

> Escala de violeta (50→950) e neutros são gerados a partir do tom primário e ficam disponíveis
> como `primary-50 … primary-950`. O semáforo (`success/warning/danger`) atende ao **Índice de
> Saturação** dos relatórios.

## Tipografia

- **Interface:** Inter (variable) — geométrica, neutra, legível.
- **Display/Títulos:** Inter Tight ou Geist — para headings com presença.
- **Mono (tons, BPM, dados):** Geist Mono / JetBrains Mono.
- Escala tipográfica modular (1.250): `xs 12 · sm 14 · base 15 · lg 18 · xl 20 · 2xl 24 · 3xl 30
  · 4xl 36`. Line-height generoso; tracking levemente negativo em headings grandes.

## Espaçamento, grid e forma

- Base **4px**. Muito **espaço em branco**.
- Raio padrão `--radius: 0.75rem`; cartões `rounded-2xl`.
- **Sombras discretas** (elevação sutil, nunca pesada): `shadow-sm` para cartões, `shadow-lg`
  suave para overlays.
- Cartões elegantes: borda 1px `--border` + fundo `--card` + padding 20–24px.

## Iconografia

- **Lucide** (minimalista, traço fino), tamanho base 20px, `stroke-width` 1.75.
- Ícones sempre acompanham rótulo em navegação; nunca decorativos em excesso.

## Movimento (microanimações)

- Biblioteca: **Framer Motion**. Durações 150–250ms, easing `ease-out`.
- Aplicações: entrada de cartões (fade+rise 8px), toggle de tema, feedback de drag-and-drop,
  transições de aba, skeletons. Respeitar `prefers-reduced-motion`.
- **Drag and Drop** (setlist, escala, mapa de palco) com **dnd-kit** — acessível e performático.

## Temas

- **Dark Mode** e **Light Mode** completos, alternância por `next-themes`, persistida por usuário.
- Todo componente é testado nos dois temas. Contraste mínimo **WCAG AA**.

## Densidade e responsividade

- **Totalmente responsivo.** Breakpoints Tailwind (`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl
  1536`).
- Layout desktop: sidebar fixa + conteúdo; mobile: bottom-nav para o app do músico e menu
  colapsável para gestão.
- Densidade confortável por padrão; opção compacta em tabelas de gestão.

## Acessibilidade

- Navegação por teclado em todos os fluxos (incl. drag-and-drop via dnd-kit).
- Foco visível (`--ring`), rótulos ARIA, contraste AA, `prefers-reduced-motion`.

## Fundamentos de UI (shadcn/ui)

shadcn/ui como base (Radix + Tailwind), **customizado** aos tokens acima — não usar o visual
padrão. Componentes copiados para `src/components/ui` e estilizados pelo Design System. O
catálogo completo de componentes está em [10-componentes.md](10-componentes.md).

## Data visualization

Gráficos de relatório (Recharts) seguem a paleta: categóricas derivadas do violeta + neutros;
sequenciais/semáforo para saturação. Ao implementar qualquer gráfico, seguir o guia de dataviz do
projeto (contraste, legendas, temas claro/escuro consistentes).
