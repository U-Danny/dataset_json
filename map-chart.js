/**
 * Renders a map of Ecuador with data by province.
 * @param {HTMLDivElement} container The DOM element where the chart will be rendered.
 * @param {string} datasetUrl The URL to fetch the chart data from.
 * @param {object} customOptions Custom chart options.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined' || !container) {
      console.error('ECharts is not available or the container is invalid.');
      return null;
    }

    const chartInstance = window.echarts.init(container);

    const geoJsonUrl = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson';

    // Asynchronously load GeoJSON and dataset in parallel
    const [geoJsonResponse, dataResponse] = await Promise.all([
      fetch(geoJsonUrl),
      fetch(datasetUrl)
    ]);
    
    if (!geoJsonResponse.ok || !dataResponse.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const geoJson = await geoJsonResponse.json();
    const rawData = await dataResponse.json();

    // Register the map, using 'nombre' as the name property for linking
    window.echarts.registerMap('ecuador', geoJson, {
      nameProperty: 'nombre'
    });

    // Create a mapping between normalized province names and data
    const normalizeName = (name) => {
      return name.toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^A-Z0-9]/g, ' ') // Replace special characters with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
    };

    // Create a lookup table for the data
    const dataLookup = {};
    rawData.forEach(item => {
      const normalizedName = normalizeName(item.name);
      dataLookup[normalizedName] = item;
    });

    // Prepare map data by matching with GeoJSON features
    const mapData = [];
    const unmatchedProvinces = [];
    
    geoJson.features.forEach(feature => {
      const provinceName = feature.properties.nombre;
      const normalizedGeoName = normalizeName(provinceName);
      
      if (dataLookup[normalizedGeoName]) {
        const dataItem = dataLookup[normalizedGeoName];
        mapData.push({
          name: provinceName, // Use the original name from GeoJSON for proper mapping
          value: dataItem.poblacion_total,
          ...dataItem
        });
      } else {
        unmatchedProvinces.push(provinceName);
        // Include province even without data for visual completeness
        mapData.push({
          name: provinceName,
          value: 0,
          poblacion_total: 0,
          porcentaje_analfabetismo: 0,
          pobres_nbi: 0
        });
      }
    });

    if (unmatchedProvinces.length > 0) {
      console.warn('Some provinces could not be matched with data:', unmatchedProvinces);
    }

    const defaultOptions = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          if (params.data) {
            const data = params.data;
            return `
              <strong>${data.name}</strong><br/>
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
          color: ['#e0f7fa', '#006db3']
        },
        textStyle: {
          color: '#333'
        }
      },
      series: [
        {
          name: 'Población',
          type: 'map',
          map: 'ecuador',
          roam: true,
          aspectScale: 1, // Corrige la relación de aspecto para que no se vea alargado
          layoutCenter: ['50%', '50%'], // Centra el mapa
          layoutSize: '120%', // Controla el tamaño del mapa
          label: {
            show: true,
            fontSize: 10,
            color: '#000'
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            areaColor: '#f5f5f5'
          },
          emphasis: {
            label: {
              show: true,
              fontWeight: 'bold',
              color: '#000'
            },
            itemStyle: {
              areaColor: '#ffd700',
              borderWidth: 2
            }
          },
          select: {
            label: {
              show: true,
              fontWeight: 'bold',
              color: '#000'
            },
            itemStyle: {
              areaColor: '#ffed4e'
            }
          },
          data: mapData
        }
      ]
    };

    // Merge default options with custom options
    const options = { ...defaultOptions, ...customOptions };
    
    // Eliminar el título si existe en customOptions
    if (options.title) {
      delete options.title;
    }
    
    chartInstance.setOption(options);
    
    // Ajustar el tamaño después de la renderización inicial
    setTimeout(() => {
      chartInstance.resize();
    }, 0);
    
    // Add resize handler
    const resizeHandler = () => chartInstance.resize();
    window.addEventListener('resize', resizeHandler);
    
    // Return cleanup function along with chart instance
    return {
      chart: chartInstance,
      dispose: () => {
        window.removeEventListener('resize', resizeHandler);
        chartInstance.dispose();
      }
    };
  } catch (error) {
    console.error('Error in the map rendering module:', error);
    return null;
  }
}
