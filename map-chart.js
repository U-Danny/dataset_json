/**
 * Renderiza un mapa de Ecuador con datos por provincia.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined' || !container) {
      console.error('ECharts no está disponible o el contenedor no es válido.');
      return null;
    }

    const chartInstance = window.echarts.init(container);

    const geoJsonUrl = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson';

    const geoJsonResponse = await fetch(geoJsonUrl);
    const geoJson = await geoJsonResponse.json();

    window.echarts.registerMap('ecuador', geoJson, {
      nameProperty: 'id_prov'
    });

    const dataResponse = await fetch(datasetUrl);
    const rawData = await dataResponse.json();

    const mapData = rawData.provinces_data.map(item => ({
      name: item.id_prov,
      value: item.poblacion_total,
      ...item
    }));

    const options = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          if (params.data) {
            const data = params.data;
            return `
              ${data.name}<br/>
              Población Total: ${data.poblation_total.toLocaleString()}<br/>
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
