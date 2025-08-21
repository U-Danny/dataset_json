/**
 * Renderiza un gráfico de barras utilizando la instancia global de ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas enviadas desde la API, como el tamaño.
 */
let chartInstance = null; // Mantenemos la instancia del gráfico fuera de la función

export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined' || !container) {
      console.error('ECharts no está disponible o el contenedor no es válido.');
      return null;
    }

    // 1. Obtener los datos del API
    const response = await fetch(datasetUrl);
    const rawData = await response.json();

    // 2. Procesar los datos para la configuración de ECharts
    const categories = rawData.map(item => item.product);
    const values = rawData.map(item => item.sales);

    // 3. Inicializar el gráfico.
    // Si ya existe una instancia, la desechamos antes de crear una nueva
    if (chartInstance) {
      chartInstance.dispose();
    }
    chartInstance = window.echarts.init(container);

    const options = {
      responsive: true,
      toolbox: {
        show: true,
        feature: {
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      legend: {
        data: ['Ventas'],
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      // Nuevo: Configuración del `grid` para reducir los márgenes
      grid: {
        left: '1%', 
        right: '1%',
        top: '1%',
        bottom: '1%',
        containLabel: true // Importante para que las etiquetas no se corten
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Ventas',
          type: 'bar',
          data: values,
        },
      ],
    };

    chartInstance.setOption(options);

    // 4. Devolvemos un valor booleano para indicar éxito
    return true;
  } catch (error) {
    console.error('Error en el módulo de renderizado:', error);
    return false;
  }
}

/**
 * Limpia el gráfico de ECharts del contenedor.
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
