// Corrected import path for the Plotly.js module.
// The path may need to be adjusted depending on your project structure.
import Plotly from './node_modules/plotly.js-dist/plotly.js';

/**
 * Renderiza un mapa de Ecuador con datos por provincia usando Plotly.js.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 */
export async function renderChart(container, datasetUrl) {
  try {
    const geoJsonUrl = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson';

    // Carga asíncrona de GeoJSON y dataset en paralelo
    const [geoJsonResponse, dataResponse] = await Promise.all([
      fetch(geoJsonUrl),
      fetch(datasetUrl)
    ]);
    
    const geoJson = await geoJsonResponse.json();
    const rawData = await dataResponse.json();

    // Extraer los nombres y la población para Plotly
    const locations = rawData.map(item => item.name);
    const populationValues = rawData.map(item => item.poblacion_total);
    const hoverText = rawData.map(item =>
      `<b>${item.name}</b><br>` +
      `Población Total: ${item.poblacion_total.toLocaleString()}<br>` +
      `Analfabetismo: ${item.porcentaje_analfabetismo}%<br>` +
      `Pobres (NBI): ${item.pobres_nbi.toLocaleString()}`
    );

    const data = [{
      type: 'choroplethmapbox',
      geojson: geoJson,
      locations: locations,
      z: populationValues,
      text: hoverText,
      colorscale: [
        [0, '#e0ffff'],
        [1, '#006edd']
      ],
      marker: {
        line: {
          width: 1
        }
      },
      // Clave para enlazar: 'properties.nombre'
      featureidkey: 'properties.nombre' 
    }];

    const layout = {
      mapbox: {
        style: 'carto-positron',
        zoom: 5.5,
        // Centrar el mapa en Ecuador
        center: {
          lat: -1.8312,
          lon: -78.1834
        }
      },
      autosize: true,
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0
      },
      // Equivalente al 'visualMap' de ECharts
      coloraxis: {
        colorbar: {
          title: 'Población'
        },
        cmin: 0,
        cmax: 3000000
      }
    };

    Plotly.newPlot(container, data, layout);

    return Plotly;
  } catch (error) {
    console.error('Error al cargar o renderizar el gráfico:', error);
    return null;
  }
}
