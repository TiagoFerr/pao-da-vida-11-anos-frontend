import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useValidarConvite, useAtivarConvite } from '../../hooks/queries/useConvites';
import { useUIStore } from '../../stores/useUIStore';

const conviteSchema = z.object({
  token: z.string().min(1, 'Token de convite obrigatório'),
  nome: z.string().min(3, 'Informe seu nome completo'),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  telefone: z.string().optional(),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirme sua senha'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type ConviteFormData = z.infer<typeof conviteSchema>;

interface ConviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string | null;
  onSuccess?: () => void;
}

export const ConviteModal: React.FC<ConviteModalProps> = ({
  isOpen,
  onClose,
  initialToken,
  onSuccess,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken || '');
  const showToast = useUIStore((s) => s.showToast);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: conviteInfo, isLoading: isValidating, error: valError } = useValidarConvite(
    tokenInput.trim() || null
  );

  const { mutateAsync: ativarConvite, isPending: isAtivando } = useAtivarConvite();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ConviteFormData>({
    resolver: zodResolver(conviteSchema),
    defaultValues: {
      token: initialToken || '',
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      setValue('token', initialToken);
    }
  }, [initialToken, setValue]);

  useEffect(() => {
    if (conviteInfo) {
      if (conviteInfo.nomeSugerido) {
        setValue('nome', conviteInfo.nomeSugerido);
      }
      if (conviteInfo.telefoneSugerido) {
        setValue('telefone', conviteInfo.telefoneSugerido);
      }
    }
  }, [conviteInfo, setValue]);

  const onSubmit = async (data: ConviteFormData) => {
    setServerError(null);
    try {
      await ativarConvite({
        token: data.token,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        senha: data.senha,
      });
      showToast('Conta ativada com sucesso! Você já está autenticado.', 'success');
      reset();
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Erro ao ativar convite. Confira seus dados.';
      setServerError(errorMsg);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Ativar Convite de Liderança">
      <div className="space-y-4 pt-1">
        {/* Validação Prévia do Token */}
        <div>
          <Input
            label="Código do Convite (Token)"
            placeholder="Cole o código do convite recebido"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setValue('token', e.target.value);
            }}
          />
          {isValidating && (
            <p className="text-[11px] text-muted mt-1">Validando convite...</p>
          )}
          {valError && (
            <p className="text-[11px] text-danger mt-1">
              Convite não encontrado ou expirado. Verifique o link recebido.
            </p>
          )}
        </div>

        {/* Informações do Setor se Válido */}
        {conviteInfo && (
          <div className="p-3 rounded-xl bg-creme border border-dourado/30 text-xs">
            <div className="font-semibold text-ink mb-0.5">
              Convite válido para: {conviteInfo.role}
            </div>
            <div className="text-muted">
              {conviteInfo.setorNome} (Setor {conviteInfo.setorNumero})
            </div>
          </div>
        )}

        {/* Formulário de Cadastro e Senha */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {serverError && (
            <div className="p-3 text-xs rounded-xl bg-danger/10 border border-danger/30 text-danger font-medium">
              {serverError}
            </div>
          )}

          <Input
            label="Seu Nome Completo"
            placeholder="Ex: João da Silva"
            error={errors.nome?.message}
            {...register('nome')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail de Acesso"
              type="email"
              placeholder="seuemail@exemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="WhatsApp / Telefone"
              placeholder="(84) 99999-9999"
              error={errors.telefone?.message}
              {...register('telefone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Defina sua Senha"
              type="password"
              placeholder="••••••••"
              error={errors.senha?.message}
              {...register('senha')}
            />

            <Input
              label="Confirme a Senha"
              type="password"
              placeholder="••••••••"
              error={errors.confirmarSenha?.message}
              {...register('confirmarSenha')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isAtivando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isAtivando || !conviteInfo}
            >
              {isAtivando ? 'Ativando...' : 'Ativar e Acessar'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
