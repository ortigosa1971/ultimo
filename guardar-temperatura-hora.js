
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const STATION_ID = process.env.STATION_ID;

const url = `https://api.weather.com/v2/pws/observations/current?stationId=${STATION_ID}&format=json&units=m&apiKey=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const obs = data.observations?.[0];
    if (!obs || !obs.metric) {
      console.warn("⚠️ No hay datos disponibles.");
      return;
    }

    const temperatura = obs.metric.temp;
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 5);

    const nuevoRegistro = { fecha, hora, temperatura };

    const archivo = path.join(__dirname, 'db', 'temperatura.json');
    let registros = [];

    if (fs.existsSync(archivo)) {
      try {
        registros = JSON.parse(fs.readFileSync(archivo, 'utf8'));
      } catch (err) {
        console.error("❌ Error leyendo archivo:", err);
      }
    }

    registros.push(nuevoRegistro);
    fs.writeFileSync(archivo, JSON.stringify(registros, null, 2));
    console.log("✅ Registro guardado:", nuevoRegistro);
  })
  .catch(err => {
    console.error("❌ Error al consultar API:", err);
  });
