// ECharts_stacked_area.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;
let currentData = [];
let chartDiv = null;

/**
 * Renderiza un gráfico de área apilado y un control de filtrado dentro del contenedor.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el dashboard.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts no está disponible o el contenedor no es válido.');
            return null;
        }

        // 1. Obtener y almacenar los datos
        const response = await fetch(datasetUrl);
        currentData = await response.json();

        // 2. Limpiar el contenedor antes de renderizar
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '20px';

        // 3. Crear el dropdown dinámicamente
        const selectContainer = document.createElement('div');
        selectContainer.style.width = '250px';
        selectContainer.style.alignSelf = 'flex-end'; // Alinea el dropdown a la derecha
        selectContainer.innerHTML = `
            <v-select
              label="Filtrar por producto"
              :items='["Todos", "Smartphone", "Laptop", "Tablet", "Accessories"]'
              dense
              outlined
              hide-details
            ></v-select>
        `;
        container.appendChild(selectContainer);

        // 4. Crear el contenedor para el gráfico
        chartDiv = document.createElement('div');
        chartDiv.style.width = '100%';
        chartDiv.style.height = '400px';
        container.appendChild(chartDiv);

        // 5. Inicializar el gráfico en su contenedor
        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(chartDiv);

        // 6. Función de renderizado del gráfico
        const drawChart = (filterProduct = null) => {
            const filteredData = filterProduct ? currentData.filter(d => d.product === filterProduct) : currentData;
            
            const dates = [...new Set(filteredData.map(item => item.date))].sort();
            const products = [...new Set(filteredData.map(item => item.product))];

            const series = products.map(product => {
                const data = dates.map(date => {
                    const item = filteredData.find(d => d.date === date && d.product === product);
                    return item ? item.sales : 0;
                });
                return {
                    name: product,
                    type: 'line',
                    stack: 'total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: data
                };
            });

            const options = {
                title: {
                    text: 'Ventas mensuales por producto',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
                },
                legend: { data: products, bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
                xAxis: [{ type: 'category', boundaryGap: false, data: dates }],
                yAxis: [{ type: 'value' }],
                series: series
            };

            chartInstance.setOption({ ...options, ...customOptions });
        };

        // 7. Configurar el evento para el dropdown (asumiendo que Vuetify lo renderiza correctamente)
        // La v-select es un componente de Vue/Vuetify. El código de Vue/Vuetify lo manejará.
        // Aquí no podemos "escuchar" directamente un `v-select` con JS plano.
        // La implementación real en Vue sería a través del `@change` o `v-model` del componente.
        // Este ejemplo asume que la `v-select` es un simple `select` HTML para propósitos de demostración.
        
        // Simulación de la lógica de Vuetify si fuera un select nativo:
        const selectElement = selectContainer.querySelector('select');
        if (selectElement) {
            selectElement.addEventListener('change', (event) => {
                const selectedProduct = event.target.value === 'Todos' ? null : event.target.value;
                drawChart(selectedProduct);
            });
        }
        
        // Renderizado inicial
        drawChart();

        return true;
    } catch (error) {
        console.error('Error en el módulo de renderizado de ECharts:', error);
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
