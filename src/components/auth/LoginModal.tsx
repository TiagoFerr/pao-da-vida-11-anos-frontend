import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .email('Formato de e-mail inválido'),
  senha: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const login = useAuthStore((s) => s.login);
  const showToast = useUIStore((s) => s.showToast);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const auth = await login(data.email, data.senha);
      showToast(`Bem-vindo, ${auth.usuario.nome || 'Líder'}!`, 'success');
      reset();
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'E-mail ou senha inválidos. Tente novamente.';
      setServerError(errorMsg);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Acesso da Liderança">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <p className="text-xs text-muted leading-relaxed">
          Área restrita a Pastores, Coordenadores de Setor, Líderes de Célula e
          Anfitriões da campanha <strong>120 Cultos nos Lares</strong>.
        </p>

        {serverError && (
          <div className="p-3 text-xs rounded-xl bg-danger/10 border border-danger/30 text-danger font-medium animate-fade-in">
            {serverError}
          </div>
        )}

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="exemplo@paodavida.com.br"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.senha?.message}
          {...register('senha')}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar na Conta'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
