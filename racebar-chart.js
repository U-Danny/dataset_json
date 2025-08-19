/**
 * Renderiza un gráfico de barras animado (Racebar Chart).
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined') {
      console.error('ECharts no está disponible en el entorno global.');
      return null;
    }

    const response = await fetch(datasetUrl);
    const fullData = await response.json();

    const chartInstance = window.echarts.init(container);

    const timelineData = fullData.years.map(y => y.year);
    const timelineOptions = fullData.years.map(yearData => {
      const products = yearData.data.map(item => item.product);
      const sales = yearData.data.map(item => item.sales);

      return {
        series: [
          {
            data: sales,
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              valueAnimation: true
            }
          }
        ],
        yAxis: {
          type: 'category',
          data: products,
          inverse: true
        }
      };
    });

    const options = {
      baseOption: {
        timeline: {
          axisType: 'category',
          autoPlay: true,
          playInterval: 3000,
          data: timelineData
        },
        responsive: true,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Ventas'],
          left: 'center',
          bottom: 10
        },
        xAxis: {
          max: 'dataMax'
        },
        yAxis: {
          type: 'category',
          inverse: true
        }
      },
      options: timelineOptions
    };

    chartInstance.setOption(options);

    return chartInstance;
  } catch (error) {
    console.error('Error en el módulo de renderizado del racebar:', error);
    return null;
  }
}
