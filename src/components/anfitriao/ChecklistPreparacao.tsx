import React, { useState, useEffect } from 'react';
import { CultoMarker } from '@/types/culto';
import { useUIStore } from '@/stores/useUIStore';
import { soundEffects } from '@/lib/sound';
import {
  CheckCircle2,
  ListChecks,
  Sparkles,
  Heart,
  Coffee,
  Users,
  MessageSquare,
  Flame,
} from 'lucide-react';

interface ChecklistPreparacaoProps {
  culto: CultoMarker;
}

interface ChecklistItem {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'oracao',
    titulo: 'Oração de Consagração do Lar',
    descricao:
      'Reúna a família minutos antes para orar, abençoar a casa e convidar a presença gloriosa do Espírito Santo.',
    icone: Flame,
  },
  {
    id: 'assentos',
    titulo: 'Organização dos Assentos & Ventilação',
    descricao:
      'Disponha cadeiras, bancos ou sofás de forma acolhedora (em roda ou semicírculo) e mantenha o ambiente fresco.',
    icone: Users,
  },
  {
    id: 'acolhimento',
    titulo: 'Recepção com Amor & Água Fresca',
    descricao:
      'Receba cada vizinho e irmão na porta com um sorriso fraterno e deixe água ou café à disposição.',
    icone: Heart,
  },
  {
    id: 'alinhamento',
    titulo: 'Contato Prévio com o Líder de Culto',
    descricao:
      'Confirme com o líder escalado a chegada e deixe alinhado o início pontual às 19h30.',
    icone: MessageSquare,
  },
  {
    id: 'comunhao',
    titulo: 'Momento de Comunhão (Partir do Pão)',
    descricao:
      'Se desejar, providencie um lanche simples (bolo, suco ou biscoitos) para confraternizar com todos após o culto.',
    icone: Coffee,
  },
];

export const ChecklistPreparacao: React.FC<ChecklistPreparacaoProps> = ({
  culto,
}) => {
  const { showToast } = useUIStore();
  const storageKey = `ce_checklist_${culto.id}`;

  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCheckedIds(JSON.parse(saved));
    } catch {}
  }, [culto.id, storageKey]);

  const handleToggle = (id: string) => {
    let updated: string[];
    const wasChecked = checkedIds.includes(id);

    if (wasChecked) {
      updated = checkedIds.filter((item) => item !== id);
      soundEffects.playClick();
    } else {
      updated = [...checkedIds, id];
      soundEffects.playJoinSound();

      if (updated.length === CHECKLIST_ITEMS.length) {
        soundEffects.playCelebration();
        showToast('Glória a Deus! Todos os preparativos concluídos para a reunião!', 'success');
      }
    }

    setCheckedIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const total = CHECKLIST_ITEMS.length;
  const concluídos = checkedIds.length;
  const porcentagem = Math.round((concluídos / total) * 100);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#1D4225]/10 text-[#1D4225] flex items-center justify-center shrink-0">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Guia Prático de Preparação do Lar
            </h3>
            <p className="text-xs text-neutral-500">
              Pequenos detalhes de amor para receber a igreja e a vizinhança.
            </p>
          </div>
        </div>

        {/* Indicador de Conclusão */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-black text-[#1D4225] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {concluídos} de {total} itens prontos ({porcentagem}%)
          </span>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1D4225] via-[#D2A34C] to-[#1D4225] transition-all duration-300"
          style={{ width: `${porcentagem}%` }}
        />
      </div>

      {/* Lista de Itens do Checklist */}
      <div className="space-y-2.5">
        {CHECKLIST_ITEMS.map((item) => {
          const Icone = item.icone;
          const isChecked = checkedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                isChecked
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-neutral-50/50 hover:bg-neutral-50 border-neutral-200'
              }`}
            >
              {/* Botão de Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked
                    ? 'bg-[#1D4225] text-white shadow-xs'
                    : 'border-2 border-neutral-300 bg-white'
                }`}
              >
                {isChecked && <CheckCircle2 className="w-4 h-4" />}
              </div>

              {/* Informações do Item */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icone
                    className={`w-4 h-4 ${
                      isChecked ? 'text-[#1D4225]' : 'text-neutral-400'
                    }`}
                  />
                  <h4
                    className={`text-sm font-bold ${
                      isChecked
                        ? 'text-neutral-900 line-through opacity-80'
                        : 'text-neutral-900'
                    }`}
                  >
                    {item.titulo}
                  </h4>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {item.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem Motivacional ao Concluir Tudo */}
      {porcentagem === 100 && (
        <div className="p-4 rounded-2xl bg-[#D2A34C]/15 border border-[#D2A34C]/40 text-center animate-in fade-in duration-300">
          <Sparkles className="w-6 h-6 text-[#D2A34C] mx-auto mb-1 fill-current" />
          <h5 className="text-sm font-black text-[#9A7428]">
            Seu lar está totalmente preparado para ser casa de salvação!
          </h5>
          <p className="text-xs text-[#85611e] mt-0.5">
            "Eu e a minha casa serviremos ao Senhor." (Josué 24:15)
          </p>
        </div>
      )}
    </div>
  );
};
