import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sseManager, SseEventHandler } from '../lib/sse';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';

export function useSSE(onCustomEvent?: SseEventHandler) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    // Conecta SSE usando token ativo
    sseManager.connect(accessToken);

    const unsubscribe = sseManager.subscribe((event) => {
      // Invalidação de Cache no TanStack Query conforme o tipo de evento
      switch (event.tipo) {
        case 'culto.cadastrado':
        case 'culto.status_alterado':
          queryClient.invalidateQueries({ queryKey: ['cultos'] });
          queryClient.invalidateQueries({ queryKey: ['metricas'] });
          queryClient.invalidateQueries({ queryKey: ['setores'] });
          if (event.tipo === 'culto.cadastrado') {
            showToast('Novo culto nos lares cadastrado!', 'success');
          }
          break;

        case 'vida.para.cristo':
          queryClient.invalidateQueries({ queryKey: ['metricas'] });
          queryClient.invalidateQueries({ queryKey: ['decisoes'] });
          showToast('Glória a Deus! Uma vida se entregou a Cristo!', 'info');
          break;

        case 'meta.progresso':
          queryClient.invalidateQueries({ queryKey: ['metricas'] });
          break;

        case 'comunicado.pastoral':
          if (event.payload?.titulo) {
            showToast(`Comunicado Pastoral: ${event.payload.titulo}`, 'info');
          }
          break;
      }

      onCustomEvent?.(event);
    });

    return () => {
      unsubscribe();
    };
  }, [accessToken, queryClient, showToast, onCustomEvent]);
}
