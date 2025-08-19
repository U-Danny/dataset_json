/**
 * Renderiza un gráfico de barras animado (Racebar Chart).
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
let chartInstance = null;

export async function renderChart(container, datasetUrl, customOptions = {}) {
  try {
    if (typeof window.echarts === 'undefined' || !container) {
      console.error('ECharts no está disponible o el contenedor no es válido.');
      return null;
    }

    // 1. Limpiar cualquier instancia previa para evitar duplicados
    if (chartInstance) {
      chartInstance.dispose();
    }

    // 2. Obtener los datos del API
    const response = await fetch(datasetUrl);
    const fullData = await response.json();

    // 3. Inicializar el gráfico.
    chartInstance = window.echarts.init(container);

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
        // CLAVE: Fondo transparente
        backgroundColor: 'rgba(0,0,0,0)',
        timeline: {
          axisType: 'category',
          autoPlay: true,
          playInterval: 3000,
          data: timelineData,
          // CLAVE: Color de texto dinámico
          label: {
            color: 'currentColor'
          }
        },
        responsive: true,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { readOnly: false },
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          },
          // CLAVE: Color de icono dinámico
          iconStyle: {
            borderColor: 'currentColor'
          }
        },
        legend: {
          data: ['Ventas'],
          left: 'center',
          bottom: 10,
          // CLAVE: Color de texto dinámico
          textStyle: {
            color: 'currentColor'
          }
        },
        // CLAVE: Color de texto dinámico para los ejes
        xAxis: {
          max: 'dataMax',
          axisLabel: {
            color: 'currentColor'
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          axisLabel: {
            color: 'currentColor'
          }
        }
      },
      options: timelineOptions
    };

    chartInstance.setOption(options);

    return true;
  } catch (error) {
    console.error('Error en el módulo de renderizado del racebar:', error);
    return null;
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
