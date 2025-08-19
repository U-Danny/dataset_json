// bar-chart.js

export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined') {
      console.error('ECharts no está disponible en el entorno global.');
      return null;
    }

    // 1. Asignar el tamaño del contenedor desde el archivo .js
    container.style.width = customOptions.width || '100%';
    container.style.height = customOptions.height || '400px'; // <- Asegura que tenga una altura

    const response = await fetch(datasetUrl);
    const rawData = await response.json();

    const categories = rawData.map(item => item.product);
    const values = rawData.map(item => item.sales);

    const chartInstance = window.echarts.init(container); // <- Se inicializa después de tener un tamaño

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
    return chartInstance;

  } catch (error) {
    console.error('Error en el módulo de renderizado:', error);
    return null;
  }
}
