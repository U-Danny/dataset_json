/**
 * Renderiza un gráfico de barras utilizando la instancia global de ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas enviadas desde la API, como el tamaño.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined') {
      console.error('ECharts no está disponible en el entorno global.');
      return null;
    }

    // 1. Obtener los datos del API
    const response = await fetch(datasetUrl);
    const rawData = await response.json();

    // 2. Procesar los datos para la configuración de ECharts
    const categories = rawData.map(item => item.product);
    const values = rawData.map(item => item.sales);

    // 3. Inicializar el gráfico. Ya no es necesario manejar el tamaño aquí.
    const chartInstance = window.echarts.init(container);

    const options = {
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: false },
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
        data: ['Ventas'],
        left: 'center',
        bottom: 10
      },
      title: {
        text: 'Ventas por producto',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Ventas',
          type: 'bar',
          data: values,
          itemStyle: {
            color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
        }
      ]
    };

    chartInstance.setOption(options);
    
    // 4. Devolver la instancia del gráfico para que el componente Vue la gestione
    return chartInstance;
  } catch (error) {
    console.error('Error en el módulo de renderizado:', error);
    return null;
  }
}
