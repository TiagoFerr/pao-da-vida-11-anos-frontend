import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useValidarConvite, useAtivarConvite } from '@/hooks/queries/useConvites';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Lock, Mail, User, Phone } from 'lucide-react';

export const ActivateInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);

  const { data: conviteInfo, isLoading: isValidating } = useValidarConvite(token || null);
  const { mutate: ativarConta, isPending: isActivating } = useAtivarConvite();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    if (conviteInfo?.nomeSugerido) {
      setNome(conviteInfo.nomeSugerido);
    }
    if (conviteInfo?.telefoneSugerido) {
      setTelefone(conviteInfo.telefoneSugerido);
    }
  }, [conviteInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Token de convite não encontrado', 'error');
      return;
    }

    ativarConta(
      {
        token,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        telefone: telefone.trim() || undefined,
      },
      {
        onSuccess: (authData) => {
          showToast(`Conta ativada com sucesso! Bem-vindo(a), ${authData.usuario.nome || ''}!`, 'success');
          // Redireciona conforme o papel do usuário
          if (authData.usuario.role === 'COORDENADOR') {
            navigate('/coordenador');
          } else if (authData.usuario.role === 'ADMIN' || authData.usuario.role === 'PASTOR') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        },
        onError: () => {
          showToast('Erro ao ativar conta. Verifique os dados ou se o link expirou.', 'error');
        },
      }
    );
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-dourado border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-body">Validando link de convite pastoral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cream dark:bg-preto">
      <div className="w-full max-w-lg bg-panel border border-line rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Luz suave de fundo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-verde/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo: Logo Editorial & Boas-Vindas */}
        <div className="text-center pb-6 border-b border-line space-y-2">
          <span className="text-[11px] font-semibold text-dourado uppercase tracking-wider font-combinacao flex items-center justify-center gap-1.5">
            <span className="text-dourado font-bold font-mono">//</span> IGREJA PÃO DA VIDA • 11 ANOS
          </span>

          <h1 className="text-2xl sm:text-3xl font-black font-identidade text-primary">
            CRESCER <span className="text-dourado font-serif italic">&amp;</span> EDIFICAR
          </h1>

          <p className="text-xs text-body font-serif italic max-w-sm mx-auto">
            "De quem todo o corpo, bem ajustado e ligado..." — Efésios 4:16
          </p>

          <div className="inline-flex items-center gap-2 bg-verde/15 text-verde border border-verde/30 px-3.5 py-1.5 rounded-full text-xs font-semibold mt-3">
            <Sparkles className="w-3.5 h-3.5 text-dourado" />
            <span>
              Convite Oficial para o {conviteInfo?.setorNome || `Setor ${conviteInfo?.setorNumero || ''}`}
            </span>
          </div>
        </div>

        {/* Formulário de Ativação */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-body/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">E-mail para Acesso</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-body/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">WhatsApp / Telefone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-body/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="(84) 98888-7777"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Definir Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-body/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-creme/50 dark:bg-preto/40 border border-line rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-dourado"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="md"
            disabled={isActivating}
            className="w-full font-bold shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            <span>{isActivating ? 'Ativando...' : 'Confirmar e Acessar Meu Culto'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-body hover:text-primary transition-colors underline"
          >
            Voltar para o Mapa Público
          </button>
        </div>
      </div>
    </div>
  );
};
