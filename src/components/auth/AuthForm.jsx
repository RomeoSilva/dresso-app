
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AuthForm = ({ isLogin = false }) => {
  const { t } = useTranslation();
  const { signup, login, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: t('auth.success.loginSuccess'),
          description: t('auth.success.loginSuccess')
        });
      } else {
        await signup(formData.email, formData.password, formData.username);
        toast({
          title: t('auth.success.accountCreated'),
          description: t('auth.success.accountCreated')
        });
      }
    } catch (error) {
      toast({
        title: t('auth.errors.default'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: t('auth.success.googleSuccess'),
        description: t('auth.success.googleSuccess')
      });
    } catch (error) {
      toast({
        title: t('auth.errors.default'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.login.emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="username">{t('auth.register.usernameLabel')}</Label>
          <Input
            id="username"
            type="text"
            placeholder={t('auth.register.usernamePlaceholder')}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.login.passwordLabel')}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t('auth.login.passwordPlaceholder')}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLogin ? t('auth.login.submit') : t('auth.register.submit')}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('auth.login.googleButton')}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-4 h-4 mr-2"
        />
        {t('auth.login.googleButton')}
      </Button>
    </motion.form>
  );
};

export default AuthForm;
