/**
 * Renderiza un mapa de Ecuador con datos por provincia.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined' || !container) {
      console.error('ECharts no está disponible o el contenedor no es válido.');
      return null;
    }

    const chartInstance = window.echarts.init(container);

    const geoJsonUrl = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson';

    const geoJsonResponse = await fetch(geoJsonUrl);
    const geoJson = await geoJsonResponse.json();

    // CLAVE: Enlazamos el mapa con los datos usando la propiedad 'nombre'
    window.echarts.registerMap('ecuador', geoJson, {
      nameProperty: 'nombre'
    });

    const mapData = geoJson.features.map(feature => {
      const properties = feature.properties;
      return {
        // Usamos la propiedad 'nombre' del GeoJSON como clave de enlace
        name: properties.nombre,
        // Usamos 'pob_tot' para el valor de color
        value: properties.pob_tot,
        // Incluimos el resto de las propiedades para el tooltip
        poblacion_total: properties.pob_tot,
        porcentaje_analfabetismo: properties.analfabeti,
        pobres_nbi: properties.pobres_nbi
      };
    });

    const options = {
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
          // Ajustes de diseño solicitados
          aspectScale: 1,
          layoutCenter: ['50%', '50%'],
          layoutSize: '150%',
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
