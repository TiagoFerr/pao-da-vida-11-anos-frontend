import React from 'react';
import { ConviteItem } from '@/types/convite';
import { MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ConvitesSetorTableProps {
  convites: ConviteItem[];
  isLoading?: boolean;
}

export const ConvitesSetorTable: React.FC<ConvitesSetorTableProps> = ({
  convites,
  isLoading,
}) => {
  const getStatusBadge = (convite: ConviteItem) => {
    if (convite.utilizado) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-verde/20 text-verde border border-verde/40">
          <CheckCircle className="w-3 h-3" /> Conta Ativada
        </span>
      );
    }
    if (convite.expirado) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3" /> Expirado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
        <Clock className="w-3 h-3" /> Pendente
      </span>
    );
  };

  const getPapelLabel = (papel: string) => {
    switch (papel) {
      case 'COORDENADOR':
        return 'Coordenador';
      case 'LIDER':
        return 'Líder de Culto';
      case 'ANFITRIAO':
        return 'Anfitrião';
      default:
        return papel;
    }
  };

  const formatData = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-line">
        <div>
          <h3 className="font-bold text-sm sm:text-base font-identidade text-primary">
            Rastreamento de Convites Emitidos
          </h3>
          <p className="text-xs text-body">
            Histórico de links compartilhados para membros e líderes deste setor.
          </p>
        </div>
        <span className="text-xs text-body bg-creme dark:bg-preto/40 px-3 py-1 rounded-full border border-line">
          Total: <strong className="text-primary">{convites.length}</strong> links gerados
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-creme/70 dark:bg-preto/50 text-body border-b border-line font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Destinatário</th>
              <th className="py-3 px-4">Papel Atribuído</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Emitido Em</th>
              <th className="py-3 px-4">Expira Em</th>
              <th className="py-3 px-4 text-right">Reenviar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-body">
                  Carregando convites do setor...
                </td>
              </tr>
            ) : convites.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-body">
                  Nenhum convite emitido para este setor ainda.
                </td>
              </tr>
            ) : (
              convites.map((conv) => {
                const telLimpo = conv.telefoneDestinatario?.replace(/\D/g, '') || '';

                return (
                  <tr
                    key={conv.id}
                    className="hover:bg-creme/30 dark:hover:bg-preto/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-primary">
                        {conv.nomeDestinatario || 'Membro do Setor'}
                      </div>
                      {conv.telefoneDestinatario && (
                        <div className="text-[11px] text-body font-mono">
                          {conv.telefoneDestinatario}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-primary">
                        {getPapelLabel(conv.tipoPapel)}
                      </span>
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(conv)}</td>

                    <td className="py-3 px-4 text-body font-mono">
                      {formatData(conv.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-body font-mono">
                      {formatData(conv.expiraEm)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {telLimpo && !conv.utilizado && (
                        <a
                          href={`https://wa.me/55${telLimpo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Reenviar mensagem via WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-verde/15 text-verde hover:bg-verde hover:text-white rounded-lg transition-all font-medium text-[11px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Reenviar</span>
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
