import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getFirestore, query, where } from "firebase/firestore";
import { app } from "../firebase.js";

const db = getFirestore(app);
const colRef = collection(db, "products");

const fetchData = async (filters = {}) => {
  //setLoading(true);
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
    return items;
  } catch (err) {
    console.log(err)
    //setError(err.message);
    return null;
  } finally {
    //setLoading(false);
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

(async () => {
  const products = await fetchData();
  await Promise.all(
    products.map(product => {
        product["stock"] = 100
    })
  )
  debugger
  console.log(products)
  return products
})();
