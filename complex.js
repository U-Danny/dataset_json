// ECharts_stacked_area.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;
let currentData = [];
let chartDiv = null;

// La firma de la función renderChart no cambia
export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts no está disponible o el contenedor no es válido.');
            return null;
        }

        // 1. Obtener y almacenar los datos para usarlos en el filtro
        const response = await fetch(datasetUrl);
        currentData = await response.json();
        const products = ['Todos', ...new Set(currentData.map(item => item.product))];

        // 2. Limpiar el contenedor y preparar la estructura del dashboard
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-end'; // Alinea el dropdown a la derecha
        container.style.gap = '20px';

        // 3. Crear y estilizar el dropdown nativo
        const selectElement = document.createElement('select');
        selectElement.id = 'product-select';
        selectElement.style.padding = '8px 12px';
        selectElement.style.fontSize = '14px';
        selectElement.style.borderRadius = '4px';
        selectElement.style.border = '1px solid #ccc';
        selectElement.style.outline = 'none';
        selectElement.style.cursor = 'pointer';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = `Filtrar: ${product}`;
            selectElement.appendChild(option);
        });
        
        container.appendChild(selectElement);

        // 4. Crear el contenedor para el gráfico
        chartDiv = document.createElement('div');
        chartDiv.style.width = '100%';
        chartDiv.style.height = '400px';
        container.appendChild(chartDiv);

        // 5. Función que procesa los datos y renderiza el gráfico
        const drawChart = (filterProduct = null) => {
            const filteredData = filterProduct ? currentData.filter(d => d.product === filterProduct) : currentData;
            
            const dates = [...new Set(filteredData.map(item => item.date))].sort();
            const seriesProducts = [...new Set(filteredData.map(item => item.product))];

            const series = seriesProducts.map(product => {
                const data = dates.map(date => {
                    const item = filteredData.find(d => d.date === date && d.product === product);
                    return item ? item.sales : 0;
                });
                return {
                    name: product,
                    type: 'line',
                    stack: 'total',
                    areaStyle: {},
                    emphasis: { focus: 'series' },
                    data: data
                };
            });

            const options = {
                title: { text: 'Ventas mensuales por producto', left: 'center' },
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
                legend: { data: seriesProducts, bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
                xAxis: [{ type: 'category', boundaryGap: false, data: dates }],
                yAxis: [{ type: 'value' }],
                series: series
            };

            // Inicializar o actualizar el gráfico
            if (!chartInstance) {
                chartInstance = window.echarts.init(chartDiv);
            }
            chartInstance.setOption({ ...options, ...customOptions });
        };

        // 6. Añadir el event listener al select
        selectElement.addEventListener('change', (event) => {
            const selectedProduct = event.target.value === 'Todos' ? null : event.target.value;
            drawChart(selectedProduct);
        });
        
        // 7. Renderizar el gráfico inicial
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
