// bar-chart.js
import * as echarts from 'echarts';

/**
 * Renderiza un gráfico de barras.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos.
 */
export async function renderChart(container, datasetUrl) {
  try {
    // 1. Obtener los datos del API
    const response = await fetch(datasetUrl);
    const data = await response.json();

    // 2. Procesar los datos para ECharts
    const categories = data.map(item => item.product);
    const values = data.map(item => item.sales);

    // 3. Inicializar y configurar el gráfico
    const chartInstance = echarts.init(container);
    const options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      xAxis: {
        type: 'category',
        data: categories,
      },
      yAxis: {
        type: 'value',
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
    return chartInstance;
  } catch (error) {
    console.error('Error en el módulo del gráfico:', error);
    // Devuelve un error para que el componente contenedor lo maneje
    return null;
  }
}
