
export default {
  navigation: {
    wardrobe: "Mi Armario",
    outfits: "Otros Outfits",
    community: "Comunidad",
    profile: "Perfil",
    settings: "Ajustes"
  },
  questionnaire: {
    title: "Antes de comenzar, cuéntanos un poco sobre ti",
    language: {
      title: "Idioma",
      en: "Inglés",
      es: "Español"
    },
    gender: {
      title: "Género",
      male: "Masculino",
      female: "Femenino",
      other: "No especificar"
    },
    skinTone: "Selecciona tu tono de piel",
    hairColor: "Selecciona tu color de cabello",
    height: "Altura",
    weight: "Peso",
    cm: "cm",
    kg: "kg",
    stylePreference: "¿Cuál es tu estilo y para qué ocasiones sueles vestirte?",
    occasions: "Ocasiones",
    styles: {
      casual: "Casual",
      elegant: "Elegante",
      urban: "Urbano",
      formal: "Formal",
      sporty: "Deportivo",
      bohemian: "Bohemio",
      vintage: "Vintage",
      minimalist: "Minimalista"
    },
    occasionTypes: {
      work: "Trabajo",
      casual: "Casual",
      party: "Fiesta",
      formal: "Formal",
      date: "Cita",
      sport: "Deporte"
    },
    next: "Continuar",
    back: "Volver",
    complete: "Finalizar cuestionario"
  },
  // Rest of the translations remain unchanged
  settings: {
    title: "Ajustes",
    description: "Gestiona tus preferencias",
    language: "Idioma",
    notifications: "Notificaciones",
    manageNotifications: "Gestionar notificaciones",
    privacy: "Privacidad",
    privacySettings: "Ajustes de privacidad",
    help: "Ayuda y soporte",
    getHelp: "Obtener ayuda"
  },
  outfits: {
    title: "Otros Outfits",
    subtitle: "Descubre combinaciones de ropa",
    buyNow: "Comprar ahora",
    summerCasual: "Casual de verano",
    officeChic: "Elegante de oficina",
    weekendStyle: "Estilo de fin de semana"
  },
  auth: {
    register: {
      title: "Crear una cuenta",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@email.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Mínimo 6 caracteres",
      usernameLabel: "Nombre de usuario",
      usernamePlaceholder: "¿Cómo quieres que te llamen?",
      submit: "Registrarse",
      googleButton: "Continuar con Google",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      loginHere: "Inicia sesión aquí"
    },
    login: {
      title: "Iniciar sesión",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@email.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Tu contraseña",
      submit: "Iniciar sesión",
      googleButton: "Iniciar sesión con Google",
      noAccount: "¿No tienes una cuenta?",
      registerHere: "Regístrate aquí",
      forgotPassword: "¿Olvidaste tu contraseña?"
    },
    errors: {
      emailRequired: "El correo electrónico es obligatorio",
      emailInvalid: "El correo electrónico no es válido",
      passwordRequired: "La contraseña es obligatoria",
      passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
      usernameRequired: "El nombre de usuario es obligatorio",
      usernameTaken: "Este nombre de usuario ya está en uso",
      emailInUse: "Este correo electrónico ya está registrado",
      invalidCredentials: "Correo electrónico o contraseña incorrectos",
      default: "Ha ocurrido un error. Por favor, inténtalo de nuevo"
    },
    success: {
      accountCreated: "¡Cuenta creada con éxito!",
      loginSuccess: "¡Bienvenido de nuevo!",
      googleSuccess: "¡Inicio de sesión con Google completado!"
    }
  },
  profile: {
    title: "Mi Perfil",
    anonymous: "Usuario",
    editProfile: "Editar perfil",
    posts: "Publicaciones",
    likes: "Me gusta",
    comments: "Comentarios",
    shares: "Compartidos",
    myPosts: "Mis publicaciones",
    postImage: "Imagen de publicación",
    logout: "Cerrar sesión",
    profileImage: "Foto de perfil",
    changePhoto: "Cambiar foto",
    uploadPhoto: "Subir foto",
    removePhoto: "Quitar foto",
    language: "Idioma",
    updateProfileImage: "Actualizar foto de perfil",
    uploadImage: "Subir nueva imagen",
    imageUpdated: "Foto actualizada",
    imageUpdateSuccess: "Tu foto de perfil se ha actualizado correctamente",
    imageUpdateError: "Error al actualizar la foto"
  },
  wardrobe: {
    title: "Mi Armario",
    privateDescription: "Tu colección privada de prendas",
    uploadNew: "Subir prenda",
    analyzeAll: "Analizar todo",
    empty: "Tu armario está vacío",
    addFirstItem: "¡Comienza a subir tus prendas!",
    startUploading: "Subir primera prenda",
    itemAdded: "Prenda añadida",
    itemAnalyzed: "Prenda analizada correctamente",
    itemDeleted: "Prenda eliminada",
    itemRemovedFromWardrobe: "La prenda se ha eliminado de tu armario",
    uploadTitle: "Sube una foto de tu ropa",
    editing: "Editando prenda",
    analysisComplete: "Análisis completado",
    itemsUpdated: "Prendas actualizadas correctamente",
    analysisError: "Error en el análisis"
  },
  community: {
    subtitle: "Comparte y descubre outfits",
    upload: "Compartir outfit",
    postAdded: "Outfit compartido",
    postVisible: "Tu outfit ya es visible en la comunidad",
    postDeleted: "Outfit eliminado",
    postDeletedDesc: "El outfit se ha eliminado de la comunidad",
    uploadTitle: "Sube una imagen a la comunidad"
  },
  post: {
    commentPlaceholder: "¿Qué opinas de este outfit?",
    addComment: "Añadir comentario",
    likes: "Me gusta",
    comments: "Comentarios",
    share: "Compartir"
  },
  upload: {
    title: "Subir imagen",
    addLinks: "Añadir enlaces",
    addLink: "Añadir enlace",
    itemType: "Tipo de prenda",
    itemTypePlaceholder: "Ej: Camiseta, Pantalón...",
    link: "Añadir enlace de la prenda",
    submit: "Publicar",
    analyzed: "Imagen analizada",
    analysisFailed: "Error en el análisis",
    dragDrop: "Arrastra y suelta tu imagen aquí",
    or: "o",
    browse: "Selecciona un archivo"
  },
  share: {
    title: "Compartir outfit",
    linkCopied: "Enlace copiado",
    linkCopiedDesc: "El enlace se ha copiado al portapapeles"
  },
  analysis: {
    results: "Resultados del análisis",
    analyzing: "Analizando imagen...",
    type: "Tipo de prenda",
    color: "Color",
    style: "Estilo",
    tags: "Etiquetas"
  }
};
