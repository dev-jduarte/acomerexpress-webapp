import LocalBarIcon from "@mui/icons-material/LocalBar";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import CakeIcon from "@mui/icons-material/Cake";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import KebabDiningIcon from "@mui/icons-material/KebabDining";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CoffeeIcon from '@mui/icons-material/Coffee';

export const categoryIcons = {
  BEBIDAS: { icon: LocalBarIcon, color: "#2196F3" }, // azul
  NARGUILE: { icon: EmojiFoodBeverageIcon, color: "#9C27B0" }, // púrpura (no hay narguile icon)
  "MENU KIDS": { icon: ChildCareIcon, color: "#FF9800" }, // naranja
  POSTRES: { icon: CakeIcon, color: "#E91E63" }, // rosado
  RACIONES: { icon: RestaurantMenuIcon, color: "#4CAF50" }, // verde
  HAMBURGUESAS: { icon: FastfoodIcon, color: "#795548" }, // café
  "SMASH CRUJIENTE": { icon: LunchDiningIcon, color: "#FF5722" }, // naranja oscuro
  "ARABIC FOOD": { icon: KebabDiningIcon, color: "#8D6E63" }, // marrón claro
  "HOT DOGS": { icon: FastfoodIcon, color: "#FFC107" }, // amarillo
  EXTRAS: { icon: AddCircleIcon, color: "#607D8B" }, // gris
  "COFFEE LOVERS": {icon: CoffeeIcon, color: "#795548"},
  "DESAYUNOS": { icon: LunchDiningIcon, color: "#4CAF50" },
  DULCES: { icon: CakeIcon, color: "#E91E63" }, // rosado
};
