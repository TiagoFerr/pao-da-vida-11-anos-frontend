import React, { useState, useRef } from 'react';
import {
  useFotosCulto,
  useUploadFotoMinio,
  useRemoverFoto,
} from '@/hooks/queries/useFotos';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import { FotoTelaoItem } from '@/types/foto';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  Trash2,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface FotoUploadProps {
  cultoId: string;
}

export const FotoUpload: React.FC<FotoUploadProps> = ({ cultoId }) => {
  const { showToast } = useUIStore();
  const { data: fotos, isLoading } = useFotosCulto(cultoId);
  const uploadFotoMutation = useUploadFotoMinio(cultoId);
  const removerFotoMutation = useRemoverFoto(cultoId);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Estados locais para arquivo selecionado antes de enviar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [legenda, setLegenda] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal para ver foto ampliada
  const [fotoAmpliada, setFotoAmpliada] = useState<FotoTelaoItem | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido.', 'error');
      return;
    }

    // Limite de 15MB
    if (file.size > 15 * 1024 * 1024) {
      showToast('A imagem não pode ultrapassar 15MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    soundEffects.playClick();
  };

  const handleCancelarSelecao = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setLegenda('');
    setUploadProgress(0);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRealizarUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(10);
      await uploadFotoMutation.mutateAsync({
        file: selectedFile,
        legenda: legenda.trim() || undefined,
        onProgress: (p) => setUploadProgress(p),
      });

      soundEffects.playCelebration();
      showToast('📸 Foto enviada com sucesso ao MinIO S3!', 'success');
      handleCancelarSelecao();
    } catch {
      showToast('Falha no upload da foto.', 'error');
      setUploadProgress(0);
    }
  };

  const handleRemover = async (fotoId: string) => {
    if (confirm('Deseja excluir esta foto da galeria do lar?')) {
      try {
        await removerFotoMutation.mutateAsync(fotoId);
        soundEffects.playClick();
        showToast('Foto excluída com sucesso.', 'info');
      } catch {
        showToast('Erro ao excluir foto.', 'error');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Inputs Ocultos para Câmera e Galeria */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Área de Disparo / Upload */}
      {!selectedFile ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-3xl bg-[#1D4225]/10 text-[#1D4225] flex items-center justify-center mx-auto mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">
            Fotos do Culto no Lar
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
            Registre os momentos de louvor, oração e comunhão. As fotos enviadas
            vão direto para o bucket MinIO S3 e podem aparecer no telão da igreja!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-[#1D4225] hover:bg-[#15311b] active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-md shadow-[#1D4225]/20 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              Tirar Foto Agora
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] text-neutral-800 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <ImageIcon className="w-5 h-5 text-neutral-600" />
              Escolher da Galeria
            </button>
          </div>
        </div>
      ) : (
        /* Preview e Envio */
        <div className="bg-white rounded-3xl p-5 border-2 border-[#D2A34C]/40 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A7428] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D2A34C]" />
              Preparar Envio para o Telão
            </span>
            <button
              type="button"
              onClick={handleCancelarSelecao}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Imagem de Pré-visualização */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-neutral-900 mb-3 border border-neutral-200">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Campo de Legenda */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Legenda para o Telão (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comunhão e partir do pão no Lar da Família Silva"
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#1D4225]/30 focus:border-[#1D4225] text-sm text-neutral-900"
            />
          </div>

          {/* Barra de Progresso */}
          {uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                <span>Enviando para o MinIO S3...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1D4225] to-[#D2A34C] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={uploadFotoMutation.isPending}
              onClick={handleCancelarSelecao}
              className="px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={uploadFotoMutation.isPending}
              onClick={handleRealizarUpload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1D4225] to-[#15311b] hover:from-[#15311b] hover:to-[#0f2313] text-white font-bold text-sm shadow-md shadow-[#1D4225]/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploadFotoMutation.isPending ? 'Enviando...' : 'Enviar Foto'}
            </button>
          </div>
        </div>
      )}

      {/* Galeria de Fotos Já Enviadas pelo Lar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Galeria Deste Lar ({fotos?.length || 0})
          </h4>
          <span className="text-[11px] text-neutral-400">
            Atualização em tempo real
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-neutral-400">
            Carregando galeria...
          </div>
        ) : !fotos || fotos.length === 0 ? (
          <div className="py-8 text-center">
            <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-600">
              Nenhuma foto enviada ainda
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Tire a primeira foto para registrar este momento histórico dos 120 Lares!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fotos.map((foto) => (
              <div
                key={foto.id}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-neutral-100 border border-neutral-200 shadow-xs cursor-pointer"
                onClick={() => setFotoAmpliada(foto)}
              >
                <img
                  src={foto.urlPublica}
                  alt={foto.legenda || 'Foto do culto'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Badge de Aprovação no Telão */}
                {foto.aprovadoParaTelao ? (
                  <div className="absolute top-2 left-2 bg-[#D2A34C] text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Tv className="w-3 h-3" />
                    No Telão
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white/90 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pendente
                  </div>
                )}

                {/* Botão de Excluir */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemover(foto.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Excluir foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Legenda Overlay */}
                {foto.legenda && (
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[11px] font-medium line-clamp-1">
                    {foto.legenda}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Foto Ampliada */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setFotoAmpliada(null)}
        >
          <div
            className="bg-neutral-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between text-white border-b border-neutral-800">
              <div className="flex items-center gap-2">
                {fotoAmpliada.aprovadoParaTelao ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D2A34C] text-neutral-950 font-black text-xs uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Exibida no Telão da Igreja
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-semibold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Aguardando curadoria do telão
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFotoAmpliada(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={fotoAmpliada.urlPublica}
                alt={fotoAmpliada.legenda || 'Foto ampliada'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {fotoAmpliada.legenda && (
              <div className="p-4 bg-neutral-950 text-white text-sm font-medium border-t border-neutral-800">
                {fotoAmpliada.legenda}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
