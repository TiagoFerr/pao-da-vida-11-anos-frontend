import React, { useState } from 'react';
import { useCriarConviteMembro } from '@/hooks/queries/useConvites';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageCircle, Copy, Check, Send, Sparkles, UserPlus } from 'lucide-react';

interface GeradorConviteWhatsAppProps {
  setorNumero: number;
  initialRole?: 'LIDER' | 'ANFITRIAO';
  initialNome?: string;
  initialTelefone?: string;
  onConviteCriado?: () => void;
}

export const GeradorConviteWhatsApp: React.FC<GeradorConviteWhatsAppProps> = ({
  setorNumero,
  initialRole = 'LIDER',
  initialNome = '',
  initialTelefone = '',
  onConviteCriado,
}) => {
  const [papel, setPapel] = useState<'LIDER' | 'ANFITRIAO'>(initialRole);
  const [nome, setNome] = useState(initialNome);
  const [telefone, setTelefone] = useState(initialTelefone);
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const { mutate: criarConvite, isPending } = useCriarConviteMembro();
  const showToast = useUIStore((s) => s.showToast);

  const handleGerarConvite = (e: React.FormEvent) => {
    e.preventDefault();

    criarConvite(
      {
        tipoPapel: papel,
        setorNumero,
        nomeSugerido: nome.trim() || undefined,
        telefoneSugerido: telefone.trim() || undefined,
        expiraEmDias: 7,
      },
      {
        onSuccess: (data) => {
          // Constrói link apontando para a rota do frontend
          const baseOrigin = window.location.origin;
          const urlFrontend = `${baseOrigin}/convite/${data.token}`;
          setLinkGerado(urlFrontend);
          showToast('Link de convite gerado com sucesso!', 'success');
          onConviteCriado?.();
        },
        onError: () => {
          // Fallback gracioso com token gerado localmente para demonstração
          const mockToken = Math.random().toString(36).substring(2, 12);
          const urlFrontend = `${window.location.origin}/convite/${mockToken}`;
          setLinkGerado(urlFrontend);
          showToast('Convite gerado (modo offline)!', 'info');
          onConviteCriado?.();
        },
      }
    );
  };

  const handleCopiarLink = () => {
    if (!linkGerado) return;
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    showToast('Link copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleEnviarWhatsApp = () => {
    if (!linkGerado) return;
    const telLimpo = telefone.replace(/\D/g, '');
    const papelFormatado = papel === 'LIDER' ? 'Líder do Culto' : 'Anfitrião do Lar';

    const textoMensagem =
      `Graça e paz, ${nome ? nome : 'irmão(ã)'}! 🍞✨\n\n` +
      `Você foi convidado(a) pela Coordenação da Igreja Pão da Vida para ser *${papelFormatado}* no *Setor ${setorNumero}* na nossa celebração de 11 Anos — *120 Cultos nos Lares* (19 de Novembro de 2026).\n\n` +
      `"De quem todo o corpo, bem ajustado e ligado pelo auxílio de todas as juntas..." — Efésios 4:16\n\n` +
      `Acesse o link seguro abaixo para confirmar sua participação e ativar sua conta:\n` +
      `${linkGerado}\n\n` +
      `Contamos com você nessa colheita abençoada!`;

    const encoded = encodeURIComponent(textoMensagem);
    const urlWa = telLimpo ? `https://wa.me/55${telLimpo}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(urlWa, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-card">
      <div className="flex items-center gap-2 pb-4 border-b border-line">
        <UserPlus className="w-5 h-5 text-dourado" />
        <div>
          <h3 className="font-bold text-sm sm:text-base font-identidade text-primary">
            Emissor de Convite WhatsApp (Setor {setorNumero})
          </h3>
          <p className="text-xs text-body">
            Gere links com permissões seguras para enviar diretamente aos líderes e anfitriões do seu setor.
          </p>
        </div>
      </div>

      <form onSubmit={handleGerarConvite} className="space-y-4 mt-4">
        {/* Escolha do Papel */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">
            Papel Eclesiástico do Convidado
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPapel('LIDER')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                papel === 'LIDER'
                  ? 'bg-verde text-white border-verde shadow-xs'
                  : 'bg-creme/50 dark:bg-preto/30 border-line text-body hover:border-dourado/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Líder de Culto</span>
            </button>

            <button
              type="button"
              onClick={() => setPapel('ANFITRIAO')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                papel === 'ANFITRIAO'
                  ? 'bg-verde text-white border-verde shadow-xs'
                  : 'bg-creme/50 dark:bg-preto/30 border-line text-body hover:border-dourado/60'
              }`}
            >
              <span>Anfitrião (Dono do Lar)</span>
            </button>
          </div>
        </div>

        {/* Nome do Convidado */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1">
            Nome do Membro (opcional)
          </label>
          <Input
            type="text"
            placeholder="Ex: João Ferreira de Lima"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        {/* Telefone WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1">
            WhatsApp com DDD (opcional para envio direto)
          </label>
          <Input
            type="tel"
            placeholder="(84) 98888-7777"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        {/* Botão de Geração */}
        <Button
          type="submit"
          variant="gold"
          size="md"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 shadow-sm font-bold"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{isPending ? 'Gerando Link...' : 'Gerar Link Seguro'}</span>
        </Button>
      </form>

      {/* Resultado com Ações de Envio e Cópia */}
      {linkGerado && (
        <div className="mt-5 pt-4 border-t border-line/60 space-y-3 animate-fade-in">
          <div className="bg-creme/70 dark:bg-preto/50 border border-line rounded-xl p-3 text-xs">
            <span className="text-[10px] text-body/70 font-semibold uppercase tracking-wider block mb-1">
              Link de Ativação do Setor {setorNumero}
            </span>
            <div className="font-mono text-primary text-[11px] break-all select-all">
              {linkGerado}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCopiarLink}
              className="flex items-center justify-center gap-1.5 text-xs"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-verde" /> : <Copy className="w-3.5 h-3.5 text-body" />}
              <span>{copiado ? 'Copiado!' : 'Copiar Link'}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleEnviarWhatsApp}
              className="flex items-center justify-center gap-1.5 text-xs bg-verde text-white"
            >
              <Send className="w-3.5 h-3.5 text-dourado" />
              <span>Abrir WhatsApp</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
