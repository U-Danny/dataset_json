/**
 * Renderiza un gráfico de barras utilizando la instancia global de ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 */
export async function renderChart(container, datasetUrl) {
  try {
    // 1. Verificar si ECharts está disponible globalmente
    if (typeof window.echarts === 'undefined') {
      console.error('ECharts no está disponible en el entorno global.');
      return;
    }

    // 2. Obtener los datos del API
    const response = await fetch(datasetUrl);
    const rawData = await response.json();

    // 3. Procesar los datos para la configuración de ECharts
    const categories = rawData.map(item => item.product);
    const values = rawData.map(item => item.sales);

    // 4. Inicializar el gráfico y configurar las opciones
    const chartInstance = window.echarts.init(container);

    const options = {
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
            // Estilos para las barras
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
    
    // 5. Devolver la instancia del gráfico para que el componente Vue la gestione
    return chartInstance;
  } catch (error) {
    console.error('Error en el módulo de renderizado:', error);
    // Puedes devolver null o un objeto de error para que el componente contenedor lo maneje
    return null;
  }
}
