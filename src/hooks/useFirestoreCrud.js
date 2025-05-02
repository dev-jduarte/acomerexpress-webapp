import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getFirestore, query, where } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);

export const useFirestoreCRUD = (collectionName, firstFetch = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colRef = collection(db, collectionName);

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      let q = colRef;
  
      const conditions = [];
      // Manejar filtro por fechas (start y end)
      if (filters?.date?.start) {
        conditions.push(where("date", ">=", filters?.date?.start));
      }
      if (filters?.date?.end) {
        conditions.push(where("date", "<=", filters?.date?.end));
      }
      // Otros filtros (como status)
      Object.keys(filters).forEach((key) => {
        if (key != "date" && key !== "start" && key !== "end") {
          conditions.push(where(key, "==", filters[key]));
        }
      });
  
      q = query(colRef, ...conditions);
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(items);
      return items
    } catch (err) {
      setError(err.message);
      return null
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (newData) => {
    try {
      const docRef = await addDoc(colRef, newData);
      setData((prev) => [...prev, { id: docRef.id, ...newData }]);
      return docRef.id;
    } catch (err) {
      setError(err.message);
    }
  };

  const updateDocument = async (id, updatedData) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedData);
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteDocument = async (id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (firstFetch) {
      fetchData(); // sin filtros por defecto
    }
  }, []);

  return {
    data,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchData, // puedes pasarle filtros si lo necesitas
  };
};
