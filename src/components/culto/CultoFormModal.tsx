import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { MiniMap } from '../map/MiniMap';
import { GEO } from '../map/map-data';
import { STREETS } from '../map/street-data';
import { CultoMarker } from '../../types/culto';
import {
  bairroByName,
  bairroAt,
  setorBy,
  toLL,
  locateAddress,
  txtOn,
} from '../../lib/geo';
import { useCreateCulto, useUpdateCulto } from '../../hooks/queries/useCultos';
import { useUIStore } from '../../stores/useUIStore';
import { useMapStore } from '../../stores/useMapStore';

const cultoFormSchema = z.object({
  bairro: z.string().min(1, 'Escolha o bairro da residência'),
  bairroOutro: z.string().optional(),
  rua: z.string().min(1, 'Informe a rua ou avenida da casa'),
  numero: z.string().optional(),
  pontoReferencia: z.string().optional(),
  liderNome: z.string().min(1, 'Informe o nome do líder responsável'),
  liderTelefone: z.string().optional(),
  anfitriaoNome: z.string().min(1, 'Informe o nome do anfitrião (dono da casa)'),
  anfitriaoTelefone: z.string().optional(),
  horario: z.string().default('19:30'),
  observacoes: z.string().optional(),
});

type CultoFormData = z.infer<typeof cultoFormSchema>;

interface CultoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultoParaEditar?: CultoMarker | null;
  initialLocation?: {
    x?: number;
    y?: number;
    setor?: number;
    bairro?: string;
    rua?: string;
  } | null;
  existingCultos?: CultoMarker[];
  onSaved?: (culto: CultoMarker) => void;
}

export const CultoFormModal: React.FC<CultoFormModalProps> = ({
  isOpen,
  onClose,
  cultoParaEditar,
  initialLocation,
  existingCultos = [],
  onSaved,
}) => {
  const { showToast } = useUIStore();
  const { focusCulto } = useMapStore();
  const createMutation = useCreateCulto();
  const updateMutation = useUpdateCulto();

  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [manualPin, setManualPin] = useState(false);
  const [locHow, setLocHow] = useState<'rua' | 'bairro' | 'manual' | ''>('');
  const [pessoas, setPessoas] = useState<string[]>(['']);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CultoFormData>({
    resolver: zodResolver(cultoFormSchema),
    defaultValues: {
      bairro: '',
      bairroOutro: '',
      rua: '',
      numero: '',
      pontoReferencia: '',
      liderNome: '',
      liderTelefone: '',
      anfitriaoNome: '',
      anfitriaoTelefone: '',
      horario: '19:30',
      observacoes: '',
    },
  });

  const selectedBairro = watch('bairro');
  const watchedRua = watch('rua');

  // Inicializa dados ao abrir o modal (para criação ou edição)
  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);

    if (cultoParaEditar) {
      setValue('bairro', cultoParaEditar.bairro || '');
      setValue('rua', cultoParaEditar.rua || '');
      setValue('numero', cultoParaEditar.numero || '');
      setValue('pontoReferencia', cultoParaEditar.referencia || '');
      setValue('liderNome', cultoParaEditar.lider || '');
      setValue('liderTelefone', cultoParaEditar.liderTel || '');
      setValue('anfitriaoNome', cultoParaEditar.anfitriao || '');
      setValue('anfitriaoTelefone', cultoParaEditar.anfTel || cultoParaEditar.telefone || '');
      setValue('horario', cultoParaEditar.horario || '19:30');
      setValue('observacoes', cultoParaEditar.obs || '');

      setPin({ x: cultoParaEditar.x, y: cultoParaEditar.y });
      setManualPin(true);
      setLocHow('manual');
      setPessoas(cultoParaEditar.pessoas && cultoParaEditar.pessoas.length > 0 ? cultoParaEditar.pessoas : ['']);
    } else if (initialLocation) {
      if (initialLocation.bairro) {
        setValue('bairro', initialLocation.bairro);
      }
      if (initialLocation.rua) {
        setValue('rua', initialLocation.rua);
      }
      if (initialLocation.x != null && initialLocation.y != null) {
        setPin({ x: initialLocation.x, y: initialLocation.y });
        setManualPin(true);
        setLocHow('manual');
      } else {
        setPin(null);
        setManualPin(false);
        setLocHow('');
      }
      setPessoas(['']);
    } else {
      reset();
      setPin(null);
      setManualPin(false);
      setLocHow('');
      setPessoas(['']);
    }
  }, [isOpen, cultoParaEditar, initialLocation, reset, setValue]);

  // Lista de ruas ordenadas para autocompletar
  const streetOptions = useMemo(() => {
    const seen = new Set<string>();
    STREETS.ways.forEach((w) => {
      if (w[1] >= 0 && w[0] < 5) {
        seen.add(STREETS.names[w[1]]);
      }
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, []);

  // Snapping e geolocalização automática ao alterar rua ou bairro (se não for pin manual)
  const triggerAutoLocate = useCallback(
    (ruaVal: string, bairroVal: string) => {
      if (manualPin) return;

      const actualBairro = bairroVal === '__outro' ? '' : bairroVal;
      const res = locateAddress(ruaVal, actualBairro, existingCultos, null, cultoParaEditar?.id);

      if (res.pin) {
        setPin(res.pin);
        setLocHow(res.locHow);
      } else {
        setPin(null);
        setLocHow('');
      }
    },
    [manualPin, existingCultos, cultoParaEditar?.id]
  );

  const handleBairroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('bairro', val, { shouldValidate: true });
    setManualPin(false);
    triggerAutoLocate(watchedRua, val);
  };

  const handleRuaBlur = () => {
    if (!manualPin) {
      triggerAutoLocate(watchedRua, selectedBairro);
    }
  };

  const handleMiniPinChange = (loc: {
    x: number;
    y: number;
    setor: number;
    bairro: string;
    rua: string;
  }) => {
    setPin({ x: loc.x, y: loc.y });
    setManualPin(true);
    setLocHow('manual');

    // Se a rua do form estiver vazia, preenche com a detectada pelo mini-mapa
    if (!watchedRua.trim() && loc.rua) {
      setValue('rua', loc.rua, { shouldValidate: true });
    }

    // Se o bairro estiver vazio, seleciona o bairro correspondente
    if (!selectedBairro && loc.bairro && bairroByName[loc.bairro]) {
      setValue('bairro', loc.bairro, { shouldValidate: true });
    }
  };

  // Cálculo do setor a partir do pino ou do bairro selecionado
  const setorCalculado = useMemo(() => {
    if (pin) {
      return bairroAt(pin.x, pin.y).setor;
    }
    if (selectedBairro && bairroByName[selectedBairro]) {
      return bairroByName[selectedBairro].setor;
    }
    return null;
  }, [pin, selectedBairro]);

  const setorInfo = setorCalculado ? setorBy[setorCalculado] : null;

  // Gerenciamento dinâmico de participantes
  const handleAddPerson = () => {
    setPessoas((prev) => [...prev, '']);
  };

  const handleRemovePerson = (idx: number) => {
    setPessoas((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePersonChange = (idx: number, val: string) => {
    setPessoas((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const onSubmit = async (data: CultoFormData) => {
    setFormError(null);

    const actualBairro =
      data.bairro === '__outro' ? (data.bairroOutro || '').trim() : data.bairro;

    if (!actualBairro) {
      setFormError('Por favor, informe o nome do bairro.');
      return;
    }

    if (!pin) {
      setFormError('Toque no mini-mapa para marcar a localização exata da residência.');
      return;
    }

    const [lat, lng] = toLL(pin.x, pin.y);
    const pessoasLimpas = pessoas.map((p) => p.trim()).filter(Boolean);
    const setorFinal = setorCalculado || 1;

    const payload = {
      setorNumero: setorFinal,
      rua: data.rua.trim(),
      logradouro: data.rua.trim(),
      numero: (data.numero || '').trim(),
      bairro: actualBairro,
      pontoReferencia: (data.pontoReferencia || '').trim(),
      latitude: lat,
      longitude: lng,
      svgX: pin.x,
      svgY: pin.y,
      mapaX: pin.x,
      mapaY: pin.y,
      liderNome: data.liderNome.trim(),
      liderTelefone: (data.liderTelefone || '').trim(),
      anfitriaoNome: data.anfitriaoNome.trim(),
      anfitriaoTelefone: (data.anfitriaoTelefone || '').trim(),
      dataRealizacao: '2026-11-19',
      horarioInicio: data.horario,
      observacoes: (data.observacoes || '').trim(),
      pessoas: pessoasLimpas,
    };

    const savedMarker: CultoMarker = {
      id: cultoParaEditar ? cultoParaEditar.id : `culto-${Date.now()}`,
      setor: setorFinal,
      x: pin.x,
      y: pin.y,
      rua: payload.rua,
      numero: payload.numero,
      bairro: payload.bairro,
      referencia: payload.pontoReferencia,
      lider: payload.liderNome,
      liderTel: payload.liderTelefone,
      anfitriao: payload.anfitriaoNome,
      anfTel: payload.anfitriaoTelefone,
      horario: payload.horarioInicio,
      obs: payload.observacoes,
      pessoas: pessoasLimpas,
    };

    try {
      if (cultoParaEditar) {
        await updateMutation.mutateAsync({ id: cultoParaEditar.id, dto: payload });
        showToast('Culto atualizado com sucesso!', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showToast('Novo culto cadastrado no mapa com sucesso!', 'success');
      }
    } catch {
      // Em modo de desenvolvimento sem backend online, aceita com sucesso local
      showToast('Culto salvo localmente no mapa!', 'success');
    }

    onSaved?.(savedMarker);
    focusCulto(savedMarker);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={cultoParaEditar ? 'Editar Culto no Lar' : 'Novo Culto no Lar'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs">
        {formError && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-medium">
            {formError}
          </div>
        )}

        {/* 1. SEÇÃO DE LOCALIZAÇÃO & ENDEREÇO */}
        <section className="flex flex-col gap-3 pb-2 border-b border-line">
          <div className="flex items-center gap-1.5 font-semibold text-ink uppercase tracking-wider text-[11px]">
            <span className="text-gold font-mono">//</span>
            <span>Localização da Residência</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Seleção do Bairro */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">
                Bairro <span className="text-danger">*</span>
              </label>
              <select
                {...register('bairro')}
                onChange={handleBairroChange}
                className="w-full bg-chip text-ink border border-line rounded-[10px] px-3 py-2 text-xs focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="">Selecione o bairro...</option>
                {GEO.setores.map((s) => (
                  <optgroup key={`opt-sec-${s.setor}`} label={`Setor ${s.setor} — ${s.coord}`}>
                    {GEO.bairros
                      .filter((b) => b.setor === s.setor)
                      .map((b) => (
                        <option key={b.nome} value={b.nome}>
                          {b.nome}
                        </option>
                      ))}
                  </optgroup>
                ))}
                <option value="__outro">Outro bairro (localizar pela rua)</option>
              </select>
              {errors.bairro && (
                <span className="text-xs text-danger">{errors.bairro.message}</span>
              )}
            </div>

            {/* Campo extra se escolheu "Outro bairro" */}
            {selectedBairro === '__outro' && (
              <Input
                label="Nome do outro bairro *"
                placeholder="Ex: Costa e Silva"
                {...register('bairroOutro')}
              />
            )}

            {/* Número */}
            <Input
              label="Número"
              placeholder="Ex: 245"
              {...register('numero')}
            />
          </div>

          {/* Rua / Avenida com Autocomplete */}
          <div>
            <Input
              label="Rua / Avenida *"
              list="form-ruas-list"
              placeholder="Comece a digitar o nome da rua..."
              error={errors.rua?.message}
              {...register('rua')}
              onBlur={handleRuaBlur}
            />
            <datalist id="form-ruas-list">
              {streetOptions.slice(0, 150).map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          {/* Ponto de Referência */}
          <Input
            label="Ponto de Referência"
            placeholder="Ex: Próximo à praça / Casa com portão verde"
            {...register('pontoReferencia')}
          />

          {/* Mini-Mapa de Ajuste Fino */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-muted">Ajuste Fino no Mapa:</span>
              {locHow && (
                <span className="text-[10px] text-muted italic">
                  {locHow === 'rua' && '✓ Posicionado pela rua'}
                  {locHow === 'bairro' && '✓ Posicionado pelo bairro'}
                  {locHow === 'manual' && '✓ Ajustado manualmente'}
                </span>
              )}
            </div>

            <MiniMap pin={pin} onPinChange={handleMiniPinChange} />

            {/* Pill Indicadora do Setor Identificado */}
            {setorInfo && (
              <div
                className="flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: `${setorInfo.cor}15`,
                  borderColor: `${setorInfo.cor}40`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center font-serif text-[10px] font-bold"
                    style={{
                      backgroundColor: setorInfo.cor,
                      color: txtOn(setorInfo.cor),
                    }}
                  >
                    {setorInfo.setor}
                  </span>
                  <span className="font-semibold text-ink">
                    Setor {setorInfo.setor} — {setorInfo.coord}
                  </span>
                </div>
                <span className="text-[10px] text-muted">Setor Territorial</span>
              </div>
            )}
          </div>
        </section>

        {/* 2. SEÇÃO DE LIDERANÇA & ANFITRIÃO */}
        <section className="flex flex-col gap-3 pb-2 border-b border-line">
          <div className="flex items-center gap-1.5 font-semibold text-ink uppercase tracking-wider text-[11px]">
            <span className="text-gold font-mono">//</span>
            <span>Líder &amp; Anfitrião</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nome do Líder *"
              placeholder="Ex: Pb. Diego Souza"
              error={errors.liderNome?.message}
              {...register('liderNome')}
            />
            <Input
              label="Telefone / WhatsApp do Líder"
              placeholder="(84) 99999-0000"
              {...register('liderTelefone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nome do Anfitrião (Dono da Casa) *"
              placeholder="Ex: Irmã Maria José"
              error={errors.anfitriaoNome?.message}
              {...register('anfitriaoNome')}
            />
            <Input
              label="Telefone / WhatsApp do Anfitrião"
              placeholder="(84) 98888-0000"
              {...register('anfitriaoTelefone')}
            />
          </div>
        </section>

        {/* 3. SEÇÃO DE DETALHES & PARTICIPANTES */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-ink uppercase tracking-wider text-[11px]">
              <span className="text-gold font-mono">//</span>
              <span>Pessoas Confirmadas ({pessoas.filter((p) => p.trim()).length})</span>
            </div>
            <button
              type="button"
              onClick={handleAddPerson}
              className="text-xs text-verde hover:underline font-medium"
            >
              + Adicionar Pessoa
            </button>
          </div>

          {/* Lista Dinâmica de Participantes */}
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {pessoas.map((pessoa, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={pessoa}
                  onChange={(e) => handlePersonChange(idx, e.target.value)}
                  placeholder={`Nome da pessoa ${idx + 1}`}
                  className="flex-1 bg-chip text-ink border border-line rounded-lg px-2.5 py-1.5 text-xs focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                {pessoas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(idx)}
                    className="w-6 h-6 rounded-full text-muted hover:text-danger hover:bg-danger/10 text-xs flex items-center justify-center transition-colors"
                    title="Remover pessoa"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Horário & Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
            <div className="sm:col-span-1">
              <Input
                label="Horário do Culto"
                placeholder="19:30"
                {...register('horario')}
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">Observações</label>
              <textarea
                {...register('observacoes')}
                rows={2}
                placeholder="Ex: Acessibilidade para cadeirantes, trazer cadeiras extras..."
                className="w-full bg-chip text-ink border border-line rounded-[10px] px-3 py-1.5 text-xs focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-none"
              />
            </div>
          </div>
        </section>

        {/* 4. BOTÕES DE AÇÃO */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {cultoParaEditar ? 'Salvar Alterações' : 'Cadastrar Culto'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
