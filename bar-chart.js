/**
 * Renderiza un gráfico de barras (Bar Chart) usando ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  // Asegúrate de que ECharts esté disponible. Puedes haberlo cargado globalmente
  // en main.js o mediante una CDN para que este archivo lo encuentre.
  if (typeof window.echarts === 'undefined' || !container) {
    console.error('ECharts no está disponible o el contenedor no es válido.');
    return null;
  }

  // Inicializa la instancia del gráfico.
  // Es crucial que 'chartInstance' sea accesible globalmente dentro de este módulo
  // para las funciones 'dispose' y 'resize'.
  const chart = window.echarts.init(container);

  try {
    const dataResponse = await fetch(datasetUrl);
    const rawData = await dataResponse.json();

    // Adaptar tus datos de ejemplo para un gráfico de barras simple
    const categories = rawData.map(item => item.name); // Ejemplo: Nombres de provincias
    const values = rawData.map(item => item.poblacion_total); // Ejemplo: Población total

    const options = {
      // CLAVE: Fondo transparente
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
          // CLAVE: Color de texto dinámico para el eje X
          color: 'currentColor' 
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          // CLAVE: Color de texto dinámico para el eje Y
          color: 'currentColor'
        }
      },
      series: [
        {
          name: 'Población',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#5470C6' // Color de las barras (puedes hacer esto dinámico también si lo necesitas)
          }
        }
      ],
      // CLAVE: Color de texto dinámico para el título (si lo usas)
      textStyle: {
        color: 'currentColor'
      }
    };

    chart.setOption(options);

    // Guarda la instancia del gráfico en una propiedad de la función para
    // que dispose y resize puedan acceder a ella.
    renderChart.chartInstance = chart;

    return true; // Indica que la operación fue exitosa

  } catch (error) {
    console.error('Error al cargar o renderizar el gráfico de barras:', error);
    return false;
  }
}

/**
 * Limpia el gráfico de ECharts del contenedor.
 * @param {HTMLDivElement} container (No usado directamente por ECharts dispose, pero se mantiene la firma)
 */
export function dispose(container) {
  if (renderChart.chartInstance) {
    renderChart.chartInstance.dispose();
    renderChart.chartInstance = null; // Limpia la referencia
  }
}

/**
 * Redimensiona el gráfico de ECharts para ajustarse a su contenedor.
 * @param {HTMLDivElement} container (No usado directamente por ECharts resize, pero se mantiene la firma)
 */
export function resize(container) {
  if (renderChart.chartInstance) {
    renderChart.chartInstance.resize();
  }
}
