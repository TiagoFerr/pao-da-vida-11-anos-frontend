import React, { useState } from 'react';
import {
  DecisaoItem,
  TipoDecisao,
  StatusDiscipulado,
} from '@/types/decisao';
import { useAtualizarDiscipulado } from '@/hooks/queries/useDecisoes';
import { useUIStore } from '@/stores/useUIStore';
import {
  Sparkles,
  Search,
  MessageCircle,
  Phone,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
} from 'lucide-react';

interface DecisoesEspirituaisTableProps {
  decisoes: DecisaoItem[];
  isLoading?: boolean;
}

export const DecisoesEspirituaisTable: React.FC<DecisoesEspirituaisTableProps> = ({
  decisoes,
  isLoading,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [decisaoSelecionada, setDecisaoSelecionada] = useState<DecisaoItem | null>(null);

  const { mutate: atualizarDiscipulado, isPending } = useAtualizarDiscipulado();
  const showToast = useUIStore((s) => s.showToast);

  const dadosFiltrados = decisoes.filter((d) => {
    if (filtroTipo !== 'TODOS' && d.tipoDecisao !== filtroTipo) return false;
    if (filtroStatus !== 'TODOS' && d.statusDiscipulado !== filtroStatus) return false;
    if (busca.trim()) {
      const b = busca.toLowerCase();
      const matchNome = d.nomeDecidido.toLowerCase().includes(b);
      const matchBairro = d.culto.bairro.toLowerCase().includes(b);
      const matchLider = d.culto.liderNome.toLowerCase().includes(b);
      return matchNome || matchBairro || matchLider;
    }
    return true;
  });

  const handleUpdateStatus = (id: string, novoStatus: StatusDiscipulado) => {
    atualizarDiscipulado(
      {
        id,
        dto: { statusDiscipulado: novoStatus },
      },
      {
        onSuccess: () => {
          showToast(`Status de discipulado atualizado para ${novoStatus}`, 'success');
        },
        onError: () => {
          showToast('Erro ao atualizar status pastoral', 'error');
        },
      }
    );
  };

  const getTipoBadge = (tipo: TipoDecisao) => {
    switch (tipo) {
      case 'ACEITOU_JESUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-dourado text-preto">
            <Sparkles className="w-3 h-3" /> Aceitou a Jesus
          </span>
        );
      case 'RECONCILIACAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-verde/15 text-verde border border-verde/30">
            <UserCheck className="w-3 h-3" /> Reconciliação
          </span>
        );
      case 'PEDIDO_ORACAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <FileText className="w-3 h-3" /> Pedido de Oração
          </span>
        );
    }
  };

  const getStatusBadge = (status: StatusDiscipulado) => {
    switch (status) {
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pendente
          </span>
        );
      case 'EM_CONTATO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <Phone className="w-3 h-3" /> Em Contato
          </span>
        );
      case 'DISCIPULANDO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-verde/20 text-verde border border-verde/40">
            <CheckCircle2 className="w-3 h-3" /> Discipulando
          </span>
        );
      case 'CONCLUIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-line text-body border border-line">
            Concluído
          </span>
        );
    }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-7 shadow-card">
      {/* Cabeçalho do Painel de Consolidação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-line">
        <div>
          <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
            <span className="text-dourado font-bold font-mono">//</span> MINISTÉRIO DE CONSOLIDAÇÃO & DISCIPULADO
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-identidade text-primary mt-1">
            Vidas Alcançadas nos 120 Cultos nos Lares
          </h3>
        </div>

        {/* Totalizador de vidas */}
        <div className="flex items-center gap-2 bg-dourado/10 border border-dourado/40 px-3.5 py-1.5 rounded-full self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-dourado" />
          <span className="text-xs font-semibold text-primary">
            {decisoes.length} vidas registradas nesta celebração
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 text-body/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, bairro ou líder..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary placeholder:text-body/50 focus:outline-none focus:ring-1 focus:ring-dourado"
          />
        </div>

        {/* Filtro por Tipo de Decisão */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-body/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
          >
            <option value="TODOS">Todas as Decisões</option>
            <option value="ACEITOU_JESUS">Aceitou a Jesus</option>
            <option value="RECONCILIACAO">Reconciliação</option>
            <option value="PEDIDO_ORACAO">Pedido de Oração</option>
          </select>
        </div>

        {/* Filtro por Status Pastoral */}
        <div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
          >
            <option value="TODOS">Todos os Status de Discipulado</option>
            <option value="PENDENTE">Pendente</option>
            <option value="EM_CONTATO">Em Contato</option>
            <option value="DISCIPULANDO">Discipulando</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </div>
      </div>

      {/* Tabela de Decisões */}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-creme/70 dark:bg-preto/50 text-body border-b border-line font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Nome & Telefone</th>
              <th className="py-3 px-4">Decisão</th>
              <th className="py-3 px-4">Setor & Bairro</th>
              <th className="py-3 px-4">Culto de Origem</th>
              <th className="py-3 px-4">Discipulado Pastoral</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-body">
                  Carregando decisões pastorais...
                </td>
              </tr>
            ) : dadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-body">
                  Nenhuma decisão encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              dadosFiltrados.map((dec) => {
                const telLimpo = dec.telefone?.replace(/\D/g, '') || '';
                const msgWhatsApp = encodeURIComponent(
                  `Graça e paz, ${dec.nomeDecidido}! Aqui é do Ministério de Consolidação da Igreja Pão da Vida. Ficamos muito felizes pela sua decisão em Cristo no culto nos lares! Como podemos orar por você hoje?`
                );

                return (
                  <tr
                    key={dec.id}
                    className="hover:bg-creme/30 dark:hover:bg-preto/20 transition-colors"
                  >
                    {/* Nome & Telefone */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-primary">{dec.nomeDecidido}</div>
                      {dec.telefone ? (
                        <div className="text-[11px] text-body flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-verde" />
                          {dec.telefone}
                        </div>
                      ) : (
                        <span className="text-[10px] text-body/50 italic">Sem telefone</span>
                      )}
                    </td>

                    {/* Badge do Tipo de Decisão */}
                    <td className="py-3 px-4">{getTipoBadge(dec.tipoDecisao)}</td>

                    {/* Setor & Bairro */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-primary">
                        Setor {dec.culto.setorNumero}
                      </div>
                      <div className="text-[11px] text-body">{dec.culto.bairro}</div>
                    </td>

                    {/* Culto & Líder */}
                    <td className="py-3 px-4">
                      <div className="text-primary font-medium">{dec.culto.anfitriaoNome}</div>
                      <div className="text-[11px] text-body">Líder: {dec.culto.liderNome}</div>
                    </td>

                    {/* Discipulado Pastoral (Select Interativo) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(dec.statusDiscipulado)}
                        <select
                          disabled={isPending}
                          value={dec.statusDiscipulado}
                          onChange={(e) =>
                            handleUpdateStatus(dec.id, e.target.value as StatusDiscipulado)
                          }
                          aria-label={`Alterar status de discipulado de ${dec.nomeDecidido}`}
                          className="bg-transparent text-[11px] text-body border border-line rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-dourado cursor-pointer"
                        >
                          <option value="PENDENTE">Mudar para Pendente</option>
                          <option value="EM_CONTATO">Mudar para Em Contato</option>
                          <option value="DISCIPULANDO">Mudar para Discipulando</option>
                          <option value="CONCLUIDO">Mudar para Concluído</option>
                        </select>
                      </div>
                    </td>

                    {/* Ações (WhatsApp & Detalhes) */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {dec.pedidoOracaoDetalhe && (
                          <button
                            type="button"
                            onClick={() => setDecisaoSelecionada(dec)}
                            title="Ver pedido de oração"
                            className="p-1.5 text-body hover:text-dourado rounded hover:bg-line/40 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {telLimpo && (
                          <a
                            href={`https://wa.me/55${telLimpo}?text=${msgWhatsApp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Conversar no WhatsApp"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-verde/15 text-verde hover:bg-verde hover:text-white rounded-lg transition-all font-medium text-[11px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Card de Detalhes do Pedido de Oração */}
      {decisaoSelecionada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-oracao-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-panel border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h4 id="modal-oracao-title" className="font-bold text-base font-identidade text-primary mb-2">
              Pedido de Oração & Observações
            </h4>
            <div className="text-xs text-body space-y-2 mb-4">
              <p>
                <strong>Decidido:</strong> {decisaoSelecionada.nomeDecidido}
              </p>
              <p>
                <strong>Culto:</strong> {decisaoSelecionada.culto.anfitriaoNome} (
                {decisaoSelecionada.culto.bairro}, Setor {decisaoSelecionada.culto.setorNumero})
              </p>
              <div className="p-3 bg-creme dark:bg-preto/40 rounded-xl border border-line/60 mt-3 text-primary italic">
                "{decisaoSelecionada.pedidoOracaoDetalhe}"
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDecisaoSelecionada(null)}
              className="w-full py-2 bg-primary text-creme rounded-xl font-medium text-xs hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
