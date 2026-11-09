import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Role } from '../../types/api';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  onRequireLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onRequireLogin,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-panel border border-line rounded-2xl max-w-md mx-auto my-12">
        <h2 className="font-serif text-lg font-semibold text-ink mb-2">
          Acesso Restrito
        </h2>
        <p className="text-xs text-muted mb-6 leading-relaxed">
          Esta área requer autenticação com perfil de liderança da Igreja Pão da Vida.
        </p>
        <Button variant="primary" size="sm" onClick={onRequireLogin}>
          Fazer Login
        </Button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-panel border border-line rounded-2xl max-w-md mx-auto my-12">
        <h2 className="font-serif text-lg font-semibold text-ink mb-2">
          Permissão Insuficiente
        </h2>
        <p className="text-xs text-muted mb-4 leading-relaxed">
          Seu perfil atual (<strong>{user.role}</strong>) não possui permissão para acessar esta funcionalidade.
        </p>
        <div className="text-[11px] text-muted">
          Perfis permitidos: {allowedRoles.join(', ')}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
