
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/ui/button';

const Welcome = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#f5f5f5] to-[#e5e5e5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            SmartCloset
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600"
          >
            Tu asistente de moda inteligente
          </motion.p>
        </div>

        <AuthForm isLogin={isLogin} />

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            <span className="font-semibold ml-1">
              {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
            </span>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <img  
            className="w-full h-64 object-cover rounded-xl"
            alt="Fashion inspiration"
           src="https://images.unsplash.com/photo-1485207757730-cc317afde269" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
