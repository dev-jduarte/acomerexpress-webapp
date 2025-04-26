export default function getCategoryColor(category) {
    switch (category) {
      case "BEBIDAS":
        return "#2196f3"; // azul
      case "NARGUILE":
        return "#9c27b0"; // morado
      case "MENU KIDS":
        return "#ff9800"; // naranja
      case "POSTRES":
        return "#f06292"; // rosa
      case "RACIONES":
        return "#4caf50"; // verde
      case "HAMBURGUESAS":
        return "#795548"; // marrón
      case "SMASH CRUJIENTE":
        return "#795548"; // mismo marrón
      case "ARABIC FOOD":
        return "#3f51b5"; // azul oscuro
      case "HOT DOGS":
        return "#ff5722"; // rojo/naranja
      case "EXTRAS":
        return "#607d8b"; // gris azulado
      default:
        return "#90a4ae"; // gris de fallback
    }
  }