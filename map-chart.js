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
    window.echarts.registerMap('ecuador', geoJson);

    // Cargar los datos del dataset
    const dataResponse = await fetch(datasetUrl);
    const rawData = await dataResponse.json();

    // Extraer los datos para la serie del mapa, usando 'nombre' como la clave
    const mapData = rawData.provinces_data.map(item => ({
      name: item.nombre, // ¡CORREGIDO! Ahora usa 'nombre'
      value: item.poblacion_total, // Puedes cambiar esto por el dato que quieras visualizar
      ...item // Incluye todos los datos para el tooltip
    }));

    const options = {
      title: {
        text: 'Población por Provincia de Ecuador',
        subtext: 'Datos de Ejemplo',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          if (params.data) {
            const data = params.data;
            return `
              ${data.nombre}<br/>
              Población Total: ${data.poblacion_total.toLocaleString()}<br/>
              Analfabetismo: ${data.porcentaje_analfabetismo}%<br/>
              Pobres (NBI): ${data.pobres_nbi.toLocaleString()}
            `;
          }
          return params.name;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: [{ name: 'Población' }]
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
          roam: true, // Habilita el zoom y el arrastre
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
