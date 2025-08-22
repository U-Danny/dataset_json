// ECharts_two_charts.js

/**
 * @type {echarts.ECharts[]}
 */
let chartInstances = [];
let currentData = [];

// La firma de la función renderChart permanece sin cambios
export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts no está disponible o el contenedor no es válido.');
            return null;
        }

        // 1. Obtener y almacenar los datos
        const response = await fetch(datasetUrl);
        currentData = await response.json();
        const products = [...new Set(currentData.map(item => item.product))];
        const defaultProduct = products[0];

        // 2. Limpiar el contenedor y preparar la estructura del dashboard
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-end';
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
        selectElement.style.backgroundColor = 'white';
        selectElement.style.color = 'black';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = `Filtrar: ${product}`;
            selectElement.appendChild(option);
        });

        // Seleccionar el primer producto por defecto
        selectElement.value = defaultProduct;
        container.appendChild(selectElement);

        // 4. Crear los contenedores para los gráficos
        const chartContainer1 = document.createElement('div');
        chartContainer1.style.width = '100%';
        chartContainer1.style.height = '400px';
        container.appendChild(chartContainer1);

        const chartContainer2 = document.createElement('div');
        chartContainer2.style.width = '100%';
        chartContainer2.style.height = '400px';
        container.appendChild(chartContainer2);

        // 5. Inicializar las instancias de los gráficos
        if (chartInstances.length > 0) {
            chartInstances.forEach(instance => instance.dispose());
        }
        chartInstances = [
            window.echarts.init(chartContainer1),
            window.echarts.init(chartContainer2)
        ];

        // 6. Función que procesa los datos y renderiza ambos gráficos
        const drawCharts = (filterProduct = defaultProduct) => {
            const filteredData = currentData.filter(d => d.product === filterProduct);
            const dates = [...new Set(filteredData.map(item => item.date))].sort();

            // Configuración del gráfico de líneas (Sales)
            const salesData = dates.map(date => {
                const item = filteredData.find(d => d.date === date);
                return item ? item.sales : 0;
            });
            const salesOptions = {
                title: { text: `Ventas por unidad: ${filterProduct}`, left: 'center' },
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', boundaryGap: false, data: dates },
                yAxis: { type: 'value' },
                series: [{
                    name: 'Ventas',
                    type: 'line',
                    data: salesData,
                    smooth: true,
                    symbolSize: 8,
                    itemStyle: {
                        borderRadius: 5,
                        borderWidth: 2
                    }
                }],
                toolbox: {
                    show: true,
                    feature: {
                        saveAsImage: {
                            show: true,
                            title: 'Descargar imagen'
                        },
                        restore: {
                            show: true,
                            title: 'Restaurar'
                        }
                    }
                }
            };
            chartInstances[0].setOption({ ...salesOptions, ...customOptions });

            // Configuración del gráfico de barras (Revenue)
            const revenueData = dates.map(date => {
                const item = filteredData.find(d => d.date === date);
                return item ? item.revenue : 0;
            });
            const revenueOptions = {
                title: { text: `Ingresos: ${filterProduct}`, left: 'center' },
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', data: dates },
                yAxis: { type: 'value' },
                series: [{
                    name: 'Ingresos',
                    type: 'bar',
                    data: revenueData,
                    itemStyle: {
                        borderRadius: 5
                    }
                }],
                toolbox: {
                    show: true,
                    feature: {
                        saveAsImage: {
                            show: true,
                            title: 'Descargar imagen'
                        },
                        restore: {
                            show: true,
                            title: 'Restaurar'
                        }
                    }
                }
            };
            chartInstances[1].setOption({ ...revenueOptions, ...customOptions });
        };

        // 7. Añadir el event listener al select
        selectElement.addEventListener('change', (event) => {
            const selectedProduct = event.target.value;
            drawCharts(selectedProduct);
        });

        // 8. Renderizar el gráfico inicial
        drawCharts();

        return true;
    } catch (error) {
        console.error('Error en el módulo de renderizado de ECharts:', error);
        return false;
    }
}

/**
 * Limpia los gráficos de ECharts del contenedor.
 */
export function dispose() {
    if (chartInstances.length > 0) {
        chartInstances.forEach(instance => instance.dispose());
        chartInstances = [];
    }
}

/**
 * Redimensiona los gráficos de ECharts.
 */
export function resize() {
    if (chartInstances.length > 0) {
        chartInstances.forEach(instance => instance.resize());
    }
}
