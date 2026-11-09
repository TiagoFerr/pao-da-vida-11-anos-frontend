import React from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';
import { useUIStore } from '@/stores/useUIStore';

export function App() {
  const { showToast, toastMessage, isToastVisible, toastType } = useUIStore();
  const [toggleChecked, setToggleChecked] = React.useState(true);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 min-h-screen">
      <Header totalCultos={42} totalPessoas={318} />

      <main className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h2 className="font-serif font-semibold text-lg text-ink">
              Fase 1: Fundação &amp; Design Tokens Configurados
            </h2>
            <Chip active>Pronto</Chip>
          </div>

          <p className="text-sm text-muted mb-6">
            O design system oficial da campanha <strong>Crescer &amp; Edificar</strong> está ativo com os tokens de cores
            da marca, tipografia (Bebas Neue, Lora e Inter), suporte a tema claro e escuro, e os primitivos de interface base.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Botões */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Variantes de Botão</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => showToast('Ação primária disparada!', 'success')}>
                  Primário (Verde)
                </Button>
                <Button variant="gold" onClick={() => showToast('Destaque dourado acionado!', 'info')}>
                  Dourado
                </Button>
                <Button variant="default">Padrão</Button>
                <Button variant="danger">Perigo</Button>
              </div>
            </div>

            {/* Inputs & Toggles */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Campos de Formulário</h3>
              <Input placeholder="Buscar rua ou bairro..." />
              <Toggle
                label="Exibir ruas no mapa"
                checked={toggleChecked}
                onChange={(e) => setToggleChecked(e.target.checked)}
              />
            </div>

            {/* Badges dos Setores */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Amostra dos 14 Setores</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge color="#1D4225">1</Badge>
                <Badge color="#D4A84B">2</Badge>
                <Badge color="#7A8165">3</Badge>
                <Badge color="#B5651D">4</Badge>
                <Badge color="#2E6B8A">5</Badge>
                <Badge color="#8E3B46">6</Badge>
                <Badge color="#4F7942">7</Badge>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Toast message={toastMessage} visible={isToastVisible} type={toastType} />
    </div>
  );
}

export default App;
