import { useEffect, useState } from "react";
import { ChevronDown, CreditCard, Download, ShieldCheck, Sparkles } from "lucide-react";
import type { PackConfig, PackImage } from "@/lib/packs";
import { ASSET_VERSION, META_PIXEL_ID } from "@/lib/packs";
import { initMetaPixel, trackInitiateCheckout, trackViewContent } from "@/lib/meta-pixel";
import { buildCheckoutUrl } from "@/lib/tracking";

type PackLandingPageProps = {
  pack: PackConfig;
};

function useCheckoutUrl(pack: PackConfig) {
  const [url, setUrl] = useState(pack.checkoutUrl);

  useEffect(() => {
    if (!pack.checkoutTodo) {
      setUrl(buildCheckoutUrl(pack.checkoutUrl));
    }
  }, [pack.checkoutTodo, pack.checkoutUrl]);

  return url;
}

function CtaButton({
  pack,
  children,
  className = "",
}: {
  pack: PackConfig;
  children: React.ReactNode;
  className?: string;
}) {
  const checkoutUrl = useCheckoutUrl(pack);

  if (pack.checkoutTodo) {
    return (
      <span
        aria-disabled="true"
        className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary/45 px-6 py-4 text-base font-bold text-primary-foreground/70 shadow-lg sm:w-auto ${className}`}
      >
        CHECKOUT PENDENTE
      </span>
    );
  }

  return (
    <a
      href={checkoutUrl}
      onClick={() => trackInitiateCheckout(META_PIXEL_ID, pack)}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:w-auto ${className}`}
    >
      {children}
    </a>
  );
}

function ImageOrPlaceholder({
  image,
  className,
  priority = false,
}: {
  image: PackImage;
  className: string;
  priority?: boolean;
}) {
  if (image.src || image.previewSrc) {
    return (
      <img
        src={`${image.previewSrc ?? image.src}?v=${ASSET_VERSION}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={image.alt}
      className={`${className} grid place-items-center border border-dashed border-border bg-card/70 p-4 text-center`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {image.placeholderLabel ?? "Asset pendente"}
      </span>
    </div>
  );
}

export function PackLandingPage({ pack }: PackLandingPageProps) {
  const stickyCheckoutUrl = useCheckoutUrl(pack);

  useEffect(() => {
    initMetaPixel(META_PIXEL_ID);
    trackViewContent(META_PIXEL_ID, pack);
  }, [pack]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:pt-10">
        <div
          className="flex items-center justify-center"
          aria-label="EstampaBox — Artes para suas criações"
        >
          <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-card/60 px-5 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-black text-background">
              EB
            </div>
            <div className="text-left leading-tight">
              <div className="text-xl font-black tracking-tight">
                ESTAMPA<span className="text-primary">BOX</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Artes para suas criações
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            PRODUTO 100% DIGITAL
          </span>

          <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight sm:text-4xl">
            {pack.headline}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            {pack.subtitulo}
          </p>
        </div>

        <div className="mt-8">
          <ImageOrPlaceholder
            image={pack.hero}
            className="h-auto w-full rounded-xl object-contain"
            priority
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Por apenas</p>
          <p className="text-5xl font-black tracking-tight text-accent">{pack.preco}</p>
          <div className="mt-5">
            <CtaButton pack={pack}>QUERO O {pack.nome.toUpperCase()}</CtaButton>
          </div>
          <p className="mx-auto mt-3 max-w-sm text-xs font-medium text-muted-foreground">
            Produto 100% digital. Nenhuma caneca ou item físico será enviado.
          </p>
          {pack.checkoutTodo ? (
            <p className="mx-auto mt-2 max-w-sm text-xs font-semibold text-accent">
              Checkout pendente: {pack.checkoutTodo}
            </p>
          ) : null}
          <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Checkout seguro
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <Download className="h-3.5 w-3.5 text-primary" />
              Acesso digital
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Garantia de {pack.garantiaDias} dias
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Acesso digital após a confirmação do pagamento.
          </p>
        </div>
      </header>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Tudo organizado para você baixar e criar
          </h2>

          <ul className="mx-auto mt-8 grid max-w-xl gap-3">
            {pack.inclusoes.map((item) => (
              <li
                key={item.texto}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <item.icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm sm:text-base">{item.texto}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {pack.artes.map((arte, index) => (
              <div
                key={`${pack.slug}-arte-${index}`}
                className="relative aspect-[5083/2319] overflow-hidden rounded-lg border border-border bg-white"
              >
                <ImageOrPlaceholder
                  image={arte}
                  className="absolute inset-0 h-full w-full object-contain"
                />
                {arte.previewSrc ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(-24deg,transparent_0,transparent_72px,rgb(7_36_20/0.08)_72px,rgb(7_36_20/0.08)_132px)]"
                  >
                    <span className="select-none rounded-full border border-background/20 bg-background/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.28em] text-background/40 backdrop-blur-[1px]">
                      EstampaBox
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Veja as artes aplicadas</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground sm:text-base">
            Visualize algumas das artes aplicadas em canecas antes de começar suas criações.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {pack.mockups.map((mockup, index) => (
              <ImageOrPlaceholder
                key={`${pack.slug}-mockup-${index}`}
                image={mockup}
                className="aspect-square w-full object-contain"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
          <ol className="mx-auto mt-8 grid max-w-xl gap-4">
            {[
              ["1", "Faça sua compra", "Finalize seu pedido pelo checkout seguro."],
              [
                "2",
                "Acesse sua área",
                "Após a confirmação do pagamento, acesse sua área de membros EstampaBox.",
              ],
              ["3", "Baixe suas artes", "Faça o download dos arquivos disponíveis no seu pack."],
            ].map(([numero, titulo, texto]) => (
              <li
                key={numero}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-base font-black text-primary-foreground">
                  {numero}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{titulo}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Feito para quem trabalha com personalizados
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Uma coleção prática para sublimadores e criadores de personalizados que desejam ter
            artes organizadas e prontas para aplicar em suas produções.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto w-full max-w-xl px-4 py-12">
          <div className="rounded-2xl border border-primary/40 bg-card p-6 text-center sm:p-8">
            <h2 className="text-2xl font-bold sm:text-3xl">{pack.nomeCompleto}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {pack.quantidadeArtes} artes em PNG + PDF
            </p>
            <p className="mt-6 text-5xl font-black tracking-tight text-accent">{pack.preco}</p>
            <div className="mt-6">
              <CtaButton pack={pack} className="sm:w-full">
                QUERO ACESSAR O PACK
              </CtaButton>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Produto digital. Nenhum produto físico será enviado.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Garantia de {pack.garantiaDias} dias
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>
          <div className="mt-8 grid gap-3">
            {pack.faqs.map((faq) => (
              <details
                key={faq.pergunta}
                className="group rounded-xl border border-border bg-card px-4 py-3 open:pb-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
                  {faq.pergunta}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{faq.resposta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 pb-24 sm:pb-0">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 text-center">
          <p className="text-lg font-black tracking-tight">
            Estampa<span className="text-primary">Box</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Criação de artes para canecas</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Suporte:{" "}
            <a
              href={`mailto:${pack.suporte}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {pack.suporte}
            </a>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Produto digital.</p>
          <nav className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span aria-disabled="true">Termos de Uso pendente</span>
            <span aria-hidden>·</span>
            <span aria-disabled="true">Política de Privacidade pendente</span>
          </nav>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="min-w-0 truncate text-sm font-semibold">
            {pack.nome} — <span className="text-accent">{pack.preco}</span>
          </p>
          {pack.checkoutTodo ? (
            <span
              aria-disabled="true"
              className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-primary/45 px-4 py-2.5 text-sm font-bold text-primary-foreground/70"
            >
              PENDENTE
            </span>
          ) : (
            <a
              href={stickyCheckoutUrl}
              onClick={() => trackInitiateCheckout(META_PIXEL_ID, pack)}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
            >
              QUERO O PACK
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
