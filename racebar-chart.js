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

    const chartInstance = window.echarts.init(container, customOptions.theme);
    let timer = null;
    let currentYearIndex = 0;

    const runAnimation = () => {
      // Si el gráfico ha sido dispuesto (por el componente Vue), detén la animación
      if (chartInstance.isDisposed()) {
        return;
      }
      
      const currentYearData = fullData.years[currentYearIndex];
      if (!currentYearData) {
        currentYearIndex = 0; // Reinicia la animación
        return;
      }

      const products = currentYearData.data.map(item => item.product);
      const sales = currentYearData.data.map(item => item.sales);

      const options = {
        title: {
          text: `Ventas en el año ${currentYearData.year}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        xAxis: {
          max: 'dataMax'
        },
        yAxis: {
          type: 'category',
          data: products,
          inverse: true,
          animationDuration: 300,
          animationDurationUpdate: 300
        },
        series: [{
          name: 'Ventas',
          type: 'bar',
          data: sales,
          label: {
            show: true,
            position: 'right',
            valueAnimation: true
          }
        }],
        animationDuration: 0,
        animationDurationUpdate: 3000, // Duración de la animación entre frames
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
      };

      chartInstance.setOption(options, true);
      currentYearIndex++;
      
      timer = setTimeout(runAnimation, 3000); // Cambia el año cada 3 segundos
    };

    // Detener animación si el gráfico se redimensiona o se dispone
    chartInstance.on('resize', () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      runAnimation();
    });

    runAnimation(); // Inicia la animación
    
    // Devolver la instancia para que Vue la gestione
    return chartInstance;
  } catch (error) {
    console.error('Error en el módulo de renderizado del racebar:', error);
    return null;
  }
}
