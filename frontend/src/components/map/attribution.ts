export const ATTRIBUTION_ITEMS = [
  {
    id: "esri",
    label: "Esri",
    text: "Powered by Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
  {
    id: "osm",
    label: "OpenStreetMap",
    text: "© OpenStreetMap contributors",
  },
  {
    id: "aisstream",
    label: "AISStream",
    text: "Vessel positions courtesy AISStream.io (terrestrial AIS, beta)",
  },
  {
    id: "usgs",
    label: "USGS",
    text: "Earthquake data courtesy of USGS",
  },
  {
    id: "firms",
    label: "NASA FIRMS",
    text: "We acknowledge the use of data and imagery from LANCE FIRMS operated by NASA's Earth Science Data and Information System (ESDIS) with funding provided by NASA Headquarters.",
  },
  {
    id: "meteo",
    label: "Open-Meteo",
    text: "Weather data by Open-Meteo (https://open-meteo.com)",
    href: "https://open-meteo.com",
  },
] as const;

export const ATTRIBUTION_LINE =
  "Esri · © OpenStreetMap contributors · AISStream.io · USGS · NASA FIRMS · Open-Meteo";

export const FIRMS_ACK =
  "We acknowledge the use of data and imagery from LANCE FIRMS operated by NASA's Earth Science Data and Information System (ESDIS) with funding provided by NASA Headquarters.";
