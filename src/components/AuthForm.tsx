import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import './AuthForm.scss';

const AuthForm = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Todos los campos son requeridos');
      return;
    }

    if (!isLoginMode) {
      if (!displayName) {
        setFormError('El nombre es requerido');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            {isLoginMode ? (
              <ArrowRightOnRectangleIcon className="icon" />
            ) : (
              <UserPlusIcon className="icon" />
            )}
          </div>
          <h1 className="auth-title">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="auth-subtitle">
            {isLoginMode 
              ? 'Accede a tu tracker de horas personal' 
              : 'Crea tu cuenta para empezar a registrar tus horas'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Nombre (solo en registro) */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="displayName" className="form-label">
                Nombre completo
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input"
                placeholder="Ej: Juan Pérez"
                required={!isLoginMode}
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <EyeSlashIcon className="icon" />
                ) : (
                  <EyeIcon className="icon" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña (solo en registro) */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar contraseña
              </label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input password-input"
                  placeholder="••••••••"
                  required={!isLoginMode}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="icon" />
                  ) : (
                    <EyeIcon className="icon" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mostrar errores */}
          {(formError || (!loading && !formError)) && (
            <div className="error-container">
              {formError && <p className="error-message">{formError}</p>}
            </div>
          )}

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={loading}
            className={`auth-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <span className="loading-spinner">⏳</span>
            ) : isLoginMode ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        {/* Toggle entre login y registro */}
        <div className="auth-footer">
          <p className="toggle-text">
            {isLoginMode ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="toggle-button"
            disabled={loading}
          >
            {isLoginMode ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 