import React from 'react';
import { useFotosTelao, useAprovarFotoTelao } from '@/hooks/queries/useFotos';
import { useUIStore } from '@/stores/useUIStore';
import { Tv, CheckCircle, XCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FotoTelaoCuratorProps {
  onOpenTelao: () => void;
}

export const FotoTelaoCurator: React.FC<FotoTelaoCuratorProps> = ({ onOpenTelao }) => {
  const { data: fotosResponse, isLoading } = useFotosTelao();
  const { mutate: aprovarFoto, isPending } = useAprovarFotoTelao();
  const showToast = useUIStore((s) => s.showToast);

  const fotos = fotosResponse?.dados || [];
  const totalAprovadas = fotos.filter((f) => f.aprovadoParaTelao).length;

  const handleToggleAprovacao = (id: string, estadoAtual: boolean) => {
    aprovarFoto(
      { id, aprovadoParaTelao: !estadoAtual },
      {
        onSuccess: () => {
          showToast(
            !estadoAtual ? 'Foto aprovada para o Telão!' : 'Foto removida do Telão',
            'info'
          );
        },
      }
    );
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-5 sm:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-line">
        <div>
          <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center gap-1.5">
            <span className="text-dourado font-bold font-mono">//</span> CURADORIA DE MÍDIA & PROJEÇÃO
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-identidade text-primary mt-1">
            Fotos dos Cultos para o Telão da Sede
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-body bg-creme dark:bg-preto/40 px-3 py-1 rounded-full border border-line">
            <strong className="text-primary">{totalAprovadas}</strong> fotos no telão
          </span>
          <Button
            variant="gold"
            size="sm"
            onClick={onOpenTelao}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Tv className="w-4 h-4" />
            <span>Abrir Modo Telão</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="py-12 text-center text-body text-xs">
            Carregando galeria dos lares...
          </div>
        ) : fotos.length === 0 ? (
          <div className="py-12 text-center text-body text-xs flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8 text-body/40" />
            <span>Nenhuma foto enviada pelos lares até o momento.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto) => (
              <div
                key={foto.id}
                className="group relative rounded-xl overflow-hidden border border-line bg-creme/30 dark:bg-preto/40 flex flex-col transition-all hover:shadow-md"
              >
                {/* Imagem */}
                <div className="relative aspect-video w-full overflow-hidden bg-preto/20">
                  <img
                    src={foto.urlPublica}
                    alt={foto.legenda || 'Culto no lar'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {foto.aprovadoParaTelao && (
                    <span className="absolute top-2 right-2 bg-verde text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> No Telão
                    </span>
                  )}
                  {foto.culto?.setorNumero && (
                    <span className="absolute bottom-2 left-2 bg-preto/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                      Setor {foto.culto.setorNumero} • {foto.culto.bairro}
                    </span>
                  )}
                </div>

                {/* Dados da Foto & Legenda */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-body line-clamp-2 leading-relaxed">
                    {foto.legenda || 'Foto do momento do culto no lar.'}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
                    <span className="text-[10px] text-body/70 truncate max-w-[120px]">
                      Por {foto.enviadoPorNome || foto.culto?.liderNome || 'Líder'}
                    </span>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleAprovacao(foto.id, foto.aprovadoParaTelao)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        foto.aprovadoParaTelao
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
                          : 'bg-dourado text-preto hover:brightness-105 font-bold shadow-xs'
                      }`}
                    >
                      {foto.aprovadoParaTelao ? (
                        <>
                          <XCircle className="w-3 h-3" /> Tirar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" /> Aprovar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
