import React from 'react';
import { useRealtimeStore } from '@/stores/useRealtimeStore';
import { Sparkles, Home, Activity, Radio, Volume2, Clock } from 'lucide-react';

export const RealtimeEventFeed: React.FC = () => {
  const { events } = useRealtimeStore();

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'vida.para.cristo':
        return <Sparkles className="w-4 h-4 text-dourado animate-pulse" />;
      case 'culto.cadastrado':
        return <Home className="w-4 h-4 text-verde" />;
      case 'culto.status_alterado':
        return <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'comunicado.pastoral':
        return <Volume2 className="w-4 h-4 text-dourado" />;
      default:
        return <Radio className="w-4 h-4 text-body" />;
    }
  };

  const formatHora = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 shadow-card flex flex-col h-full">
      {/* Topo do Feed com Indicador ao Vivo */}
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-verde opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-verde"></span>
          </span>
          <h3 className="font-bold text-sm sm:text-base font-identidade text-primary">
            Feed de Eventos em Tempo Real (SSE)
          </h3>
        </div>
        <span className="text-[10px] font-mono font-medium bg-verde/15 text-verde px-2 py-0.5 rounded-full border border-verde/30 uppercase tracking-wider">
          Ao Vivo
        </span>
      </div>

      {/* Lista com Barra de Rolagem Suave */}
      <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-3.5 scrollbar-thin">
        {events.length === 0 ? (
          <div className="py-12 text-center text-body text-xs">
            Aguardando transmissões dos lares...
          </div>
        ) : (
          events.map((evt) => {
            const isVidaParaCristo = evt.tipo === 'vida.para.cristo';

            return (
              <div
                key={evt.id}
                className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                  isVidaParaCristo
                    ? 'bg-dourado/10 border-dourado/40 shadow-xs'
                    : 'bg-creme/40 dark:bg-preto/30 border-line/70'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                    isVidaParaCristo ? 'bg-dourado/20' : 'bg-line/40'
                  }`}
                >
                  {getEventIcon(evt.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`font-bold line-clamp-1 ${
                        isVidaParaCristo ? 'text-dourado' : 'text-primary'
                      }`}
                    >
                      {evt.titulo}
                    </span>
                    <span className="text-[10px] text-body/60 font-mono flex items-center gap-0.5 flex-shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {formatHora(evt.timestamp)}
                    </span>
                  </div>
                  <p className="text-body mt-0.5 leading-relaxed">{evt.descricao}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
