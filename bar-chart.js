/**
 * Renderiza un gráfico de barras (Bar Chart) usando ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  // Asegúrate de que ECharts esté disponible.
  if (typeof window.echarts === 'undefined' || !container) {
    console.error('ECharts no está disponible o el contenedor no es válido.');
    return null;
  }

  const chart = window.echarts.init(container);

  try {
    const dataResponse = await fetch(datasetUrl);
    const rawData = await dataResponse.json();

    // CLAVE: Corregido para usar las propiedades del GeoJSON que proporcionaste
    const categories = rawData.map(item => item.name); // Ejemplo: Nombres de provincias
    const values = rawData.map(item => item.pob_tot); // CLAVE: Cambiado de 'poblacion_total' a 'pob_tot'

    const options = {
      backgroundColor: 'rgba(0,0,0,0)', 
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          color: 'currentColor' 
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'currentColor'
        }
      },
      series: [
        {
          name: 'Población',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#5470C6'
          }
        }
      ],
      textStyle: {
        color: 'currentColor'
      }
    };

    chart.setOption(options);
    
    // Guarda la instancia para las funciones de resize y dispose
    renderChart.chartInstance = chart;

    return true;

  } catch (error) {
    console.error('Error al cargar o renderizar el gráfico de barras:', error);
    return false;
  }
}

export function dispose(container) {
  if (renderChart.chartInstance) {
    renderChart.chartInstance.dispose();
    renderChart.chartInstance = null;
  }
}

export function resize(container) {
  if (renderChart.chartInstance) {
    renderChart.chartInstance.resize();
  }
}
