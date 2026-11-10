import React, { useState } from 'react';
import { CultoMarker } from '@/types/culto';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import {
  Send,
  Copy,
  Check,
  Heart,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

interface ConviteVizinhoWhatsAppProps {
  culto: CultoMarker;
}

export const ConviteVizinhoWhatsApp: React.FC<ConviteVizinhoWhatsAppProps> = ({
  culto,
}) => {
  const { showToast } = useUIStore();
  const [nomeConvidado, setNomeConvidado] = useState('');
  const [telefoneConvidado, setTelefoneConvidado] = useState('');
  const [copiado, setCopiado] = useState(false);

  const saudacaoNome = nomeConvidado.trim() ? `, ${nomeConvidado.trim()}` : '';

  const mensagemGerada = `Olá${saudacaoNome}! A paz do Senhor Jesus! 🕊️

Na próxima *quinta-feira, 19 de Novembro às ${culto.horario || '19:30'}*, nossa casa estará com as portas abertas para uma noite muito especial e abençoada: o *Culto no Lar da Igreja Pão da Vida*, celebrando 11 anos de história em Mossoró!

Será um momento simples e caloroso de louvor, oração pelas nossas famílias e uma palavra de paz e esperança ao coração. Você e sua família são nossos convidados de honra! ❤️

📍 *Endereço:*
${culto.rua}${culto.numero ? `, nº ${culto.numero}` : ''} • Bairro ${culto.bairro}
${culto.referencia ? `(Ponto de referência: ${culto.referencia})` : ''}

_"Dele todo o corpo, ajustado e unido pelo auxílio de todas as juntas, cresce e edifica-se a si mesmo em amor." (Efésios 4:16)_

Venha viver essa noite de bênção conosco! Esperamos por vocês com muito amor! 🏠✨`;

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagemGerada);
      setCopiado(true);
      soundEffects.playClick();
      showToast('Texto do convite copiado com sucesso!', 'success');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      showToast('Não foi possível copiar o texto automaticamente.', 'error');
    }
  };

  const handleDispararWhatsApp = () => {
    soundEffects.playJoinSound();
    const encoded = encodeURIComponent(mensagemGerada);
    const cleanTel = telefoneConvidado.replace(/\D/g, '');

    let url: string;
    if (cleanTel.length >= 10) {
      const ddi = cleanTel.startsWith('55') ? cleanTel : `55${cleanTel}`;
      url = `https://wa.me/${ddi}?text=${encoded}`;
    } else {
      url = `https://wa.me/?text=${encoded}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-4">
      {/* Título da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Convidar Vizinhos &amp; Amigos no WhatsApp
            </h3>
            <p className="text-xs text-neutral-500">
              Abra as portas do seu lar com um convite acolhedor e formatado.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#D2A34C] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5" />
          Efésios 4:16
        </span>
      </div>

      {/* Inputs Opcionais de Personalização */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Nome do Vizinho ou Familiar (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Dona Maria, Família Silva..."
            value={nomeConvidado}
            onChange={(e) => setNomeConvidado(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900 bg-neutral-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Número do WhatsApp (opcional)
          </label>
          <input
            type="tel"
            placeholder="Ex: (84) 98888-0000"
            value={telefoneConvidado}
            onChange={(e) => setTelefoneConvidado(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900 bg-neutral-50/50"
          />
        </div>
      </div>

      {/* Caixa de Visualização da Mensagem */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Pré-visualização do Convite
          </span>
          <button
            type="button"
            onClick={handleCopiar}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-xs sm:text-sm text-neutral-800 whitespace-pre-line font-sans leading-relaxed select-all">
          {mensagemGerada}
        </div>
      </div>

      {/* Botão de Disparo Direto */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleDispararWhatsApp}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/25 cursor-pointer"
        >
          <Send className="w-4 h-4 fill-current" />
          <span>Disparar Convite no WhatsApp Agora</span>
          <Heart className="w-4 h-4 fill-current text-white/80 ml-1" />
        </button>
      </div>
    </div>
  );
};
