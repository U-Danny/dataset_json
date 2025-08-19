/**
 * Renderiza un mapa de Ecuador con datos por provincia.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined') {
      console.error('ECharts no está disponible en el entorno global.');
      return null;
    }

    const chartInstance = window.echarts.init(container);

    // URL del GeoJSON de Ecuador
    const geoJsonUrl = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson';

    // Cargar el GeoJSON para registrar el mapa
    const geoJsonResponse = await fetch(geoJsonUrl);
    const geoJson = await geoJsonResponse.json();

    // CLAVE: Registrar el mapa y especificar que el ID de la provincia está en 'properties.id_prov'
    window.echarts.registerMap('ecuador', geoJson, {
      nameProperty: 'id_prov' // Usamos el ID de la provincia como identificador
    });

    // Cargar los datos del dataset
    const dataResponse = await fetch(datasetUrl);
    const rawData = await dataResponse.json();

    // CLAVE: Extraer los datos para la serie del mapa, usando el ID para el enlace
    const mapData = rawData.provinces_data.map(item => ({
      name: item.id_prov, // Enlazamos por el ID de la provincia
      value: item.poblacion_total,
      ...item // Incluimos todos los datos para el tooltip
    }));

    const options = {
      // Título eliminado como se solicitó
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          if (params.data) {
            const data = params.data;
            return `
              ${data.name}<br/>
              Población Total: ${data.poblacion_total.toLocaleString()}<br/>
              Analfabetismo: ${data.porcentaje_analfabetismo}%<br/>
              Pobres (NBI): ${data.pobres_nbi.toLocaleString()}
            `;
          }
          return params.name;
        }
      },
      visualMap: {
        min: 0,
        max: 3000000,
        left: 'right',
        top: 'bottom',
        text: ['Alto', 'Bajo'],
        calculable: true,
        inRange: {
          color: ['#e0ffff', '#006edd']
        }
      },
      series: [
        {
          name: 'Población',
          type: 'map',
          map: 'ecuador',
          roam: true,
          // CORRECCIÓN CLAVE: Ajustamos la escala para la forma del mapa
          aspectScale: 0.666, 
          label: {
            show: true,
            color: '#000'
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              show: true,
              color: '#000'
            },
            itemStyle: {
              areaColor: '#ffd700'
            }
          },
          data: mapData
        }
      ]
    };

    chartInstance.setOption(options);

    return chartInstance;
  } catch (error) {
    console.error('Error en el módulo de renderizado del mapa:', error);
    return null;
  }
}
