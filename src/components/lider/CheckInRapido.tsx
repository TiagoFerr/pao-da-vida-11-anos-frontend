import React, { useState } from 'react';
import {
  usePresencasCulto,
  useAdicionarPresenca,
  useAtualizarPresenca,
  useRemoverPresenca,
} from '@/hooks/queries/usePresencas';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import {
  Users,
  UserCheck,
  UserPlus,
  Sparkles,
  Phone,
  Trash2,
  Check,
  Search,
} from 'lucide-react';

interface CheckInRapidoProps {
  cultoId: string;
  onRegistrarDecisao?: (nome: string, telefone?: string, presencaId?: string) => void;
}

export const CheckInRapido: React.FC<CheckInRapidoProps> = ({
  cultoId,
  onRegistrarDecisao,
}) => {
  const { showToast } = useUIStore();
  const { data: resumo, isLoading } = usePresencasCulto(cultoId);
  const adicionarPresencaMutation = useAdicionarPresenca(cultoId);
  const atualizarPresencaMutation = useAtualizarPresenca(cultoId);
  const removerPresencaMutation = useRemoverPresenca(cultoId);

  // Estados locais do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [eMembro, setEMembro] = useState(true);
  const [busca, setBusca] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showToast('Por favor, informe o nome do participante.', 'error');
      return;
    }

    try {
      await adicionarPresencaMutation.mutateAsync({
        nomeParticipante: nome.trim(),
        telefone: telefone.trim() || undefined,
        eMembro,
        presente: true,
      });

      soundEffects.playJoinSound();
      showToast(`Presença registrada: ${nome.trim()}!`, 'success');
      setNome('');
      setTelefone('');
    } catch {
      showToast('Erro ao registrar presença no lar.', 'error');
    }
  };

  const handleTogglePresente = async (presencaId: string, presenteAtual: boolean) => {
    try {
      await atualizarPresencaMutation.mutateAsync({
        presencaId,
        dto: { presente: !presenteAtual },
      });
      soundEffects.playClick();
    } catch {
      showToast('Erro ao atualizar presença.', 'error');
    }
  };

  const handleRemover = async (presencaId: string, nomeRemover: string) => {
    if (confirm(`Remover "${nomeRemover}" da lista deste lar?`)) {
      try {
        await removerPresencaMutation.mutateAsync(presencaId);
        soundEffects.playClick();
        showToast('Participante removido.', 'info');
      } catch {
        showToast('Erro ao remover participante.', 'error');
      }
    }
  };

  const participantesFiltrados = (resumo?.participantes || []).filter((p) => {
    if (!busca.trim()) return true;
    const b = busca.toLowerCase();
    return (
      p.nomeParticipante.toLowerCase().includes(b) ||
      (p.telefone && p.telefone.includes(b))
    );
  });

  return (
    <div className="space-y-4">
      {/* Cards de Resumo no Topo */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#1D4225] mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Presentes
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#1D4225]">
            {resumo?.totalPresentes || 0}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Membros
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-800">
            {resumo?.totalMembros || 0}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#D2A34C] mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
              Visitantes
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#D2A34C]">
            {resumo?.totalVisitantes || 0}
          </span>
        </div>
      </div>

      {/* Formulário de Adição Rápida */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#1D4225]" />
          Adicionar Participante no Culto
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              required
              placeholder="Nome completo ou familiar"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="tel"
              placeholder="WhatsApp / Telefone (opcional)"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-50/50"
            />

            {/* Seletor Membro vs Visitante */}
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setEMembro(true)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  eMembro
                    ? 'bg-[#1D4225] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Membro
              </button>
              <button
                type="button"
                onClick={() => setEMembro(false)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !eMembro
                    ? 'bg-[#D2A34C] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Visitante
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={adicionarPresencaMutation.isPending || !nome.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1D4225] hover:bg-[#15311b] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#1D4225]/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {adicionarPresencaMutation.isPending ? 'Salvando...' : 'Fazer Check-in'}
          </button>
        </form>
      </div>

      {/* Lista de Participantes Cadastrados */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-neutral-100 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Lista do Lar ({participantesFiltrados.length})
          </span>

          <div className="relative w-40 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-[#1D4225]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-400">
            Carregando participantes...
          </div>
        ) : participantesFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-600">
              Nenhum participante registrado ainda
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Use o formulário acima para começar a registrar quem está reunido neste lar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {participantesFiltrados.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                  item.presente ? 'bg-white' : 'bg-neutral-50/70 opacity-60'
                }`}
              >
                {/* Botão de Toggle Presente */}
                <button
                  type="button"
                  onClick={() => handleTogglePresente(item.id, item.presente)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    item.presente
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
                  }`}
                  title={item.presente ? 'Presente no lar' : 'Ausente'}
                >
                  <Check className={`w-5 h-5 ${item.presente ? 'stroke-[2.5]' : ''}`} />
                </button>

                {/* Dados da Pessoa */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-neutral-900 truncate">
                      {item.nomeParticipante}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.eMembro
                          ? 'bg-[#1D4225]/10 text-[#1D4225]'
                          : 'bg-[#D2A34C]/20 text-[#85611e]'
                      }`}
                    >
                      {item.eMembro ? 'Membro' : 'Visitante'}
                    </span>
                  </div>

                  {item.telefone && (
                    <a
                      href={`https://wa.me/55${item.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-emerald-700 mt-0.5"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {item.telefone}
                    </a>
                  )}
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center gap-1 shrink-0">
                  {onRegistrarDecisao && (
                    <button
                      type="button"
                      onClick={() =>
                        onRegistrarDecisao(
                          item.nomeParticipante,
                          item.telefone || undefined,
                          item.id
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#D2A34C]/15 hover:bg-[#D2A34C]/25 text-[#916c23] flex items-center gap-1 transition-all cursor-pointer"
                      title="Registrar decisão espiritual ou pedido de oração"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D2A34C]" />
                      <span className="hidden sm:inline">Decisão</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemover(item.id, item.nomeParticipante)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
