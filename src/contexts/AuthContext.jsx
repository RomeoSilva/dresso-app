
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const updateUserState = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          ...firebaseUser,
          ...userData,
          hasCompletedQuestionnaire: userData.hasCompletedQuestionnaire || false
        });
      } else {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          username: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          hasCompletedQuestionnaire: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setUser({
          ...firebaseUser,
          hasCompletedQuestionnaire: false
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(firebaseUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        await updateUserState(firebaseUser);
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, username) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(user, { displayName: username });
      
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        hasCompletedQuestionnaire: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'userStats', user.uid), {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0
      });

      toast({
        title: "Cuenta creada",
        description: "¡Bienvenido a Dresso!",
      });
      
      return user;
    } catch (error) {
      toast({
        title: "Error al crear cuenta",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Sesión iniciada",
        description: "¡Bienvenido de nuevo!",
      });
      return result;
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          hasCompletedQuestionnaire: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await setDoc(doc(db, 'userStats', user.uid), {
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0
        });
      }

      toast({
        title: "Sesión iniciada con Google",
        description: "¡Bienvenido!",
      });
      
      return user;
    } catch (error) {
      toast({
        title: "Error al iniciar sesión con Google",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUsername = async (newUsername) => {
    try {
      await updateProfile(auth.currentUser, { displayName: newUsername });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        username: newUsername,
        updatedAt: new Date().toISOString()
      });

      setUser(prev => ({
        ...prev,
        displayName: newUsername,
        username: newUsername
      }));

      toast({
        title: "Nombre de usuario actualizado",
        description: "Tu nombre de usuario se ha actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar nombre de usuario",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfileImage = async (imageUrl) => {
    try {
      await updateProfile(auth.currentUser, { photoURL: imageUrl });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL: imageUrl,
        updatedAt: new Date().toISOString()
      });

      setUser(prev => ({
        ...prev,
        photoURL: imageUrl
      }));

      return imageUrl;
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "¡Hasta pronto!",
      });
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      signup,
      login,
      loginWithGoogle,
      logout,
      updateUsername,
      updateProfileImage,
      updateUserState
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
