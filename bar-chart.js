/**
 * Renderiza un mapa de Ecuador con datos por provincia usando Plotly.js.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.Plotly === 'undefined' || !container) {
      console.error('Plotly.js no está disponible o el contenedor no es válido.');
      return null;
    }

    const geoJsonUrl = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson';

    const [geoJsonResponse, dataResponse] = await Promise.all([
      fetch(geoJsonUrl),
      fetch(datasetUrl)
    ]);
    
    const geoJson = await geoJsonResponse.json();
    const rawData = await dataResponse.json();

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
      featureidkey: 'properties.nombre' 
    }];

    const layout = {
      // CLAVE: Fondo transparente para el gráfico y el lienzo
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      
      mapbox: {
        style: 'carto-positron',
        zoom: 4,
        center: {
          lat: -1.8312,
          lon: -78.1834
        }
      },
      autosize: true,
      margin: {
        l: 10,
        r: 10,
        t: 10,
        b: 10
      },
      coloraxis: {
        colorbar: {
          title: 'Población'
        },
        cmin: 0,
        cmax: 3000000
      },
      // CLAVE: Color de las fuentes para que cambien con el tema
      font: {
        color: 'currentColor'
      }
    };

    window.Plotly.newPlot(container, data, layout);

    return true;

  } catch (error) {
    console.error('Error al cargar o renderizar el gráfico:', error);
    return false;
  }
}

export function dispose(container) {
  if (window.Plotly && container) {
    window.Plotly.purge(container);
  }
}

export function resize(container) {
  if (window.Plotly && container) {
    window.Plotly.Plots.resize(container);
  }
}
