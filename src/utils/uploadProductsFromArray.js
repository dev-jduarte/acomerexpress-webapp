import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";
import { app } from "../firebase.js";

const db = getFirestore(app);

(async () => {
  // const productsData = [
  //   {name: "CRISPY BREAK", category: "HAMBURGUESAS", price: 8},
  //   {name: "CHICKEN DRIVE",category: "HAMBURGUESAS", price: 8},
  //   {name: "REBEL BACON",category: "HAMBURGUESAS", price: 8},
  //   {name: "POLLO FULL SET", category: "SMASH CRUJIENTE", price: 8},
  //   {name: "FAMILY PACK", category: "SMASH CRUJIENTE", price: 20},
  //   {name: "TENDERS DE POLLO + ENSALADA CESAR + PAPAS", category: "SMASH CRUJIENTE", price: 8},
  //   {name: "HAMBURGESAS", category: "MENU KIDS", price: 5},
  //   {name: "TENDERS DE POLLO", category: "MENU KIDS", price: 5},
  //   {name: "NUGGETS", category: "MENU KIDS", price: 5},
  //   {name: "PLATO MIXTO 1", category: "ARABIC FOOD", price: 10},
  //   {name: "PLATO MIXTO 2", category: "ARABIC FOOD", price: 10},
  //   {name: "PLATO MIXTO 3", category: "ARABIC FOOD", price: 10},
  //   {name: "SALCHICHA ALEMANA", category: "HOT DOGS", price: 8},
  //   {name: "SALCHICHA POLACA", category: "HOT DOGS", price: 8},
  //   {name: "CHISTORRA", category: "HOT DOGS", price: 8},
  //   {name: "TRADICIONAL", category: "HOT DOGS", price: 8},
  //   {name: "PAPAS FRITAS", category: "RACIONES", price: 4},
  //   {name: "TEQUEÑOS + SALSAS", category: "RACIONES", price: 5},
  //   {name: "YUCA FRITA", category: "RACIONES", price: 4},
  //   {name: "BROWNIE", category: "POSTRES", price: 3.5},
  //   {name: "PIE DE LIMÓN", category: "POSTRES", price: 3.5},
  //   {name: "PIE DE PARCHITA",category: "POSTRES", price: 3.5},
  //   {name: "TRES LECHES",category: "POSTRES", price: 3.5},
  //   {name: "TOSTONES", category: "POSTRES", price: 2}
  // ]

  // const productsData = [
  //   {
  //     name: "AVELLANA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "ICED COFFEE ",
  //     price: 5,
  //   },
  //   {
  //     name: "CARAMELO1",
  //     category: "COFFEE LOVERS",
  //     subCategory: "ICED COFFEE ",
  //     price: 5,
  //   },
  //   {
  //     name: "VAINILLA1",
  //     category: "COFFEE LOVERS",
  //     subCategory: "ICED COFFEE ",
  //     price: 5,
  //   },
  //   {
  //     name: "OREO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "MALTEADAS",
  //     price: 7,
  //   },
  //   {
  //     name: "NUTELLA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "MALTEADAS",
  //     price: 7,
  //   },
  //   {
  //     name: "AREQUIPE",
  //     category: "COFFEE LOVERS",
  //     subCategory: "MALTEADAS",
  //     price: 7,
  //   },
  //   {
  //     name: "LOVERS",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FRAPUCCINO",
  //     price: 6,
  //   },
  //   {
  //     name: "OREO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FRAPUCCINO",
  //     price: 7,
  //   },
  //   {
  //     name: "AREQUIPE",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FRAPUCCINO",
  //     price: 7,
  //   },
  //   {
  //     name: "NUTELLA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FRAPUCCINO",
  //     price: 7,
  //   },
  //   {
  //     name: "VICTORIA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FRAPUCCINO",
  //     price: 7,
  //   },
  //   {
  //     name: "ORIGINAL",
  //     category: "COFFEE LOVERS",
  //     subCategory: "LATTE ",
  //     price: 3,
  //   },
  //   {
  //     name: "AVELLANA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "LATTE ",
  //     price: 3.5,
  //   },
  //   {
  //     name: "CARAMELO1",
  //     category: "COFFEE LOVERS",
  //     subCategory: "LATTE ",
  //     price: 3.5,
  //   },
  //   {
  //     name: "VAINILLA1",
  //     category: "COFFEE LOVERS",
  //     subCategory: "LATTE ",
  //     price: 3.5,
  //   },
  //   {
  //     name: "WHITE",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FLAT",
  //     price: 3.5,
  //   },
  //   {
  //     name: "AVELLANA2",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FLAT",
  //     price: 4,
  //   },
  //   {
  //     name: "CARAMELO2",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FLAT",
  //     price: 4,
  //   },
  //   {
  //     name: "VAINILLA2",
  //     category: "COFFEE LOVERS",
  //     subCategory: "FLAT",
  //     price: 4,
  //   },
  //   {
  //     name: "AMERICANO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 2,
  //   },
  //   {
  //     name: "MACHIATO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 2.5,
  //   },
  //   {
  //     name: "PICOLO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 2.5,
  //   },
  //   {
  //     name: "PICOLO DOPPIO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 3,
  //   },
  //   {
  //     name: "MOCACCINO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 3.5,
  //   },
  //   {
  //     name: "CAPUCCINO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 3.5,
  //   },
  //   {
  //     name: "MOCA NUTELLA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 4,
  //   },
  //   {
  //     name: "ENSUEÑO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 3.5,
  //   },
  //   {
  //     name: "DULCE ENSUEÑO",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 4,
  //   },
  //   {
  //     name: "CUP ESPECIAL",
  //     category: "COFFEE LOVERS",
  //     subCategory: "EXPRESSO",
  //     price: 5,
  //   },
  //   {
  //     name: "VAINILLA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "TORTAS",
  //     price: 3,
  //   },
  //   {
  //     name: "TRES LECHES",
  //     category: "COFFEE LOVERS",
  //     subCategory: "TORTAS",
  //     price: 6,
  //   },
  //   {
  //     name: "ZANAHORIA",
  //     category: "COFFEE LOVERS",
  //     subCategory: "TORTAS",
  //     price: 5,
  //   },
  //   {
  //     name: "GALLETAS",
  //     category: "COFFEE LOVERS",
  //     subCategory: "TORTAS",
  //     price: 2,
  //   },
  //   {
  //     name: "CHOCOLATE",
  //     category: "COFFEE LOVERS",
  //     subCategory: "TORTAS",
  //     price: 4,
  //   },
  //   {
  //     name: "BISCOTTI",
  //     category: "COFFEE LOVERS",
  //     subCategory: "TORTAS",
  //     price: 0.5,
  //   },
  // ];

  await Promise.all(
    productsData.map(async (product) => {
      const colRef = collection(db, "products");
      const docRef = await addDoc(colRef, product);
    })
  );
})();
