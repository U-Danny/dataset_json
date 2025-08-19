/**
 * Renderiza un gráfico de barras (Bar Chart) usando ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
let chartInstance = null; // Mantenemos la instancia del gráfico fuera de la función

export async function renderChart(container, datasetUrl, customOptions = {}) {
  // Asegúrate de que ECharts esté disponible globalmente
  if (typeof window.echarts === 'undefined' || !container) {
    console.error('ECharts no está disponible o el contenedor no es válido.');
    return null;
  }
  
  // Si ya existe una instancia, la desechamos antes de crear una nueva
  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = window.echarts.init(container);

  try {
    const dataResponse = await fetch(datasetUrl);
    const rawData = await dataResponse.json();

    const categories = rawData.map(item => item.name);
    const values = rawData.map(item => item.pob_tot);

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

    chartInstance.setOption(options);
    
    return true;

  } catch (error) {
    console.error('Error al cargar o renderizar el gráfico de barras:', error);
    return false;
  }
}

/**
 * Limpia el gráfico de ECharts.
 */
export function dispose() {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
}

/**
 * Redimensiona el gráfico de ECharts.
 */
export function resize() {
  if (chartInstance) {
    chartInstance.resize();
  }
}
