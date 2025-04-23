import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getFirestore
} from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

export const useFirestoreCRUD = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colRef = collection(db, collectionName);

  const fetchData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(colRef);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (newData) => {
    try {
      const docRef = await addDoc(colRef, newData);
      setData(prev => [...prev, { id: docRef.id, ...newData }]);
      return docRef.id;
    } catch (err) {
      setError(err.message);
    }
  };

  const updateDocument = async (id, updatedData) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedData);
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteDocument = async (id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchData,
  };
};
