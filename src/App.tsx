import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from '@/components/ui/Toast';
import { useUIStore } from '@/stores/useUIStore';
import { CultoMarker } from '@/types/culto';
import { useSSE } from '@/hooks/useSSE';
import { useCultosList } from '@/hooks/queries/useCultos';
import { MapaPublicoPage } from '@/pages/MapaPublicoPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TelaoPage } from '@/pages/TelaoPage';
import { CoordenadorPanel } from '@/pages/CoordenadorPanel';
import { ConvitesPage } from '@/pages/ConvitesPage';
import { ActivateInvitePage } from '@/pages/ActivateInvitePage';

// Amostra inicial de cultos nos lares para validação interativa e fallback de segurança
const INITIAL_CULTOS: CultoMarker[] = [
  {
    id: 'culto-1',
    setor: 1,
    x: 322.3,
    y: 687.6,
    rua: 'Rua Sebastião Benígno de Moura',
    numero: '124',
    bairro: 'Aeroporto',
    lider: 'Pr. Rúbens Nunes',
    anfitriao: 'Irmão João e Família',
    pessoas: ['João', 'Maria', 'Lucas', 'Ana'],
    horario: '19:30',
    obs: 'Casa com portão verde',
  },
  {
    id: 'culto-2',
    setor: 2,
    x: 403.8,
    y: 840.2,
    rua: 'Avenida Alberto Maranhão',
    numero: '2450',
    bairro: 'Belo Horizonte',
    lider: 'Pra. Adriana Karina',
    anfitriao: 'Dona Francisca',
    pessoas: ['Francisca', 'Carlos', 'Beatriz'],
    horario: '19:30',
  },
  {
    id: 'culto-3',
    setor: 5,
    x: 322.4,
    y: 387.8,
    rua: 'Avenida Abolição',
    numero: '890',
    bairro: 'Abolição',
    lider: 'Pb. Adriano Medeiros',
    anfitriao: 'Irmã Emanuela Larissa',
    pessoas: ['Emanuela', 'Adriano', 'Pedro', 'Sofia', 'Davi'],
    horario: '20:00',
  },
  {
    id: 'culto-4',
    setor: 8,
    x: 592.0,
    y: 885.8,
    rua: 'Avenida Presidente Costa e Silva',
    numero: '512',
    bairro: 'Alto de São Manoel',
    lider: 'Isaac Ramalho',
    anfitriao: 'Irmão Marcos',
    pessoas: ['Marcos', 'Luciana'],
    horario: '19:30',
  },
  {
    id: 'culto-5',
    setor: 11,
    x: 524.2,
    y: 696.2,
    rua: 'Avenida Rio Branco',
    numero: '310',
    bairro: 'Centro',
    lider: 'Pb. Diego',
    anfitriao: 'Irmã Cláudia',
    pessoas: ['Cláudia', 'Roberto', 'Samuel'],
    horario: '19:30',
  },
];

export function App() {
  const { toastMessage, isToastVisible, toastType } = useUIStore();
  const { data: apiCultos } = useCultosList();
  const [localCultos, setLocalCultos] = useState<CultoMarker[]>([]);

  // Ativa escuta de Server-Sent Events em tempo real
  useSSE();

  // Mapeia cultos da API ou usa amostra inicial estática como fallback de segurança
  const cultos: CultoMarker[] = useMemo(() => {
    let baseList: CultoMarker[];
    if (apiCultos && apiCultos.length > 0) {
      baseList = apiCultos.map((item) => ({
        id: item.id,
        setor: item.setorNumero,
        x: item.svgX,
        y: item.svgY,
        rua: item.logradouro,
        numero: item.numero || undefined,
        bairro: item.bairro,
        referencia: item.pontoReferencia || undefined,
        lider: item.liderNome,
        liderTel: item.liderTelefone || undefined,
        anfitriao: item.anfitriaoNome,
        anfTel: item.anfitriaoTelefone || undefined,
        pessoas: item.presencas?.map((p) => p.nome) || [],
        horario: item.dataHora ? item.dataHora.slice(11, 16) : undefined,
        obs: item.observacoes || undefined,
        status: item.status,
      }));
    } else {
      baseList = INITIAL_CULTOS;
    }

    if (localCultos.length === 0) return baseList;

    const merged = [...baseList];
    localCultos.forEach((lc) => {
      const idx = merged.findIndex((m) => m.id === lc.id);
      if (idx >= 0) {
        merged[idx] = lc;
      } else {
        merged.push(lc);
      }
    });
    return merged;
  }, [apiCultos, localCultos]);

  const totalPessoas = cultos.reduce(
    (acc, c) => acc + (c.pessoas ? c.pessoas.length : 0),
    0
  );

  const handleCultoSaved = (cultoSalvo: CultoMarker) => {
    setLocalCultos((prev) => {
      const exists = prev.some((c) => c.id === cultoSalvo.id);
      if (exists) {
        return prev.map((c) => (c.id === cultoSalvo.id ? cultoSalvo : c));
      }
      return [...prev, cultoSalvo];
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota 1: Mapa Público & Comunidade */}
        <Route
          path="/"
          element={
            <MapaPublicoPage
              cultos={cultos}
              totalPessoas={totalPessoas}
              onCultoSaved={handleCultoSaved}
            />
          }
        />

        {/* Rota 2: Dashboard Pastoral & Executivo */}
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              cultosFallback={cultos}
              onCultoSaved={handleCultoSaved}
            />
          }
        />

        {/* Rota 3: Modo Telão Fullscreen para Projeção na Sede */}
        <Route
          path="/telao"
          element={<TelaoPage cultosFallback={cultos} />}
        />

        {/* Rota 4: Painel Territorial do Coordenador de Setor */}
        <Route
          path="/coordenador"
          element={
            <CoordenadorPanel
              cultosFallback={cultos}
              onCultoSaved={handleCultoSaved}
            />
          }
        />

        {/* Rota 5: Gestão Central de Convites WhatsApp */}
        <Route path="/convites" element={<ConvitesPage />} />

        {/* Rota 6: Ativação Pública de Convite Recebido no WhatsApp */}
        <Route path="/convite/:token" element={<ActivateInvitePage />} />

        {/* Fallback de rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Notificações Flutuantes Globais */}
      <Toast message={toastMessage} visible={isToastVisible} type={toastType} />
    </BrowserRouter>
  );
}

export default App;
