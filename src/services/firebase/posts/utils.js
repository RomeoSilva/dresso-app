
export const convertPostData = async (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    image: data.imageUrl,
    createdAt: data.createdAt?.toDate()
  };
};
