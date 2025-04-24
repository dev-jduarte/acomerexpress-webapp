import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import { app } from "../firebase.js";

const db = getFirestore(app);

(async () => {
  const productsData = [
    { name: "PAPAS FRITAS", category: "RACION", price: 4 },
    { name: "PAPAS TRUFADAS", category: "RACION", price: 0 },
    { name: "TEQUEÑOS+ SALSA", category: "RACION", price: 5 },
    { name: "PALITOS DE YUCA FRITA", category: "RACION", price: 4 },
    { name: "ENS. CESAR", category: "ENS. PERSONALES", price: 8 },
    { name: "ENS. MANZANA-MIEL", category: "ENS. PERSONALES", price: 8 },
    { name: "PAPAS ARABES", category: "ENTRADA", price: 0 },
    { name: "CREMAS ESPECIALES", category: "ENTRADA", price: 0 },
    { name: "REFRESCOS", category: "BEBIDAS", price: 3 },
    { name: "PAPALON", category: "BEBIDAS", price: 2 },
    { name: "PARCHITA", category: "BEBIDAS", price: 3 },
    { name: "LIMONADA", category: "BEBIDAS", price: 3 },
    { name: "MALTA", category: "BEBIDAS", price: 3 },
    { name: "FRESA", category: "BEBIDAS", price: 3 },
    { name: "MALTEADAS", category: "BEBIDAS", price: 0 },
    { name: "WHISKY", category: "BEBIDAS ALC", price: 0 },
    { name: "CERVEZA", category: "BEBIDAS ALC", price: 3 },
    { name: "RON", category: "BEBIDAS ALC", price: 0 },
    { name: "VODKA", category: "BEBIDAS ALC", price: 0 },
    { name: "SHOTS", category: "BEBIDAS ALC", price: 0 },
    { name: "TRES LECHES", category: "POSTRE", price: 0 },
    { name: "PIE DE LIMON", category: "POSTRE", price: 0 },
    { name: "PIE DE PARCHITA", category: "POSTRE", price: 0 },
    { name: "BROWNIE", category: "POSTRE", price: 0 },
    { name: "TOSTONES", category: "POSTRE", price: 0 },
    { name: "AMERICANO", category: "DESAYUNO", price: 6 },
    { name: "CRIOLLO", category: "DESAYUNO", price: 6 },
    { name: "DES. SALUDABLE", category: "DESAYUNO", price: 0 },
    { name: "EMPANADAS", category: "DESAYUNO", price: 2 },
    { name: "AREPAS", category: "DESAYUNO", price: 2 },
    { name: "HAMBURGUESAS", category: "PLATO FUERTE", price: 8 },
    { name: "GRANJEROS", category: "PLATO FUERTE", price: 8 },
    { name: "ARABIC FOOD", category: "PLATO FUERTE", price: 10 },
    { name: "TENDER+PAPAS+CESAR", category: "PLATO FUERTE", price: 8 },
    { name: "HAMBUEGUESA+ PAPAS", category: "KIDS", price: 5 },
    { name: "TENDERS+ PAPAS+ REG.", category: "KIDS", price: 5 },
    { name: "NUGGETS+ PAPAS+ REG.", category: "KIDS", price: 5 },
    { name: "2 HAMBURG.+ 2 REFR.", category: "COMBO", price: 14 },
  ];

  await Promise.all(
    productsData.map(async (product) => {
      const colRef = collection(db, "products");
      const docRef = await addDoc(colRef, product);
    })
  );
})();
