import { renderAkshars } from "./renderAkshars.js";
import { getAksharWidth } from "./renderBoothGrids.js";

const width = getAksharWidth();
renderAkshars(width);