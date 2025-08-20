// map.js
/**
 * @type {echarts.ECharts}
 */
let chartInstance = null; // Mantenemos la instancia del gráfico fuera de la función

/**
 * Renderiza un mapa de Ecuador con datos por provincia utilizando ECharts.
 * @param {HTMLDivElement} container El elemento del DOM donde se renderizará el gráfico.
 * @param {string} datasetUrl La URL para obtener los datos del gráfico.
 * @param {object} customOptions Opciones personalizadas enviadas desde la API.
 */
export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts no está disponible o el contenedor no es válido.');
            return null;
        }

        // 1. Obtener los datos del GeoJSON (estático) y el dataset
        const [geoJson, rawData] = await Promise.all([
            fetch("https://raw.githubusercontent.com/jpmarindiaz/geo-collection/refs/heads/master/ecu/ecuador.geojson").then(res => res.json()),
            fetch(datasetUrl).then(res => res.json())
        ]);

        // 2. Procesar los datos y registrar el GeoJSON
        echarts.registerMap('ecuador', geoJson);

        // 3. Inicializar el gráfico.
        // Si ya existe una instancia, la desechamos antes de crear una nueva
        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

        // 4. Configurar las opciones del gráfico de mapa
        const options = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>Población: {c}'
            },
            visualMap: {
                min: 100000,
                max: 4350000, // Valor máximo del dataset para el rango de colores
                left: 'left',
                top: 'bottom',
                text: ['Alto', 'Bajo'],
                calculable: true,
                inRange: {
                    color: ['#e0ffff', '#006edd']
                }
            },
            series: [{
                name: 'Población',
                type: 'map',
                map: 'ecuador',
                roam: true, // Permite zoom y arrastrar el mapa
                label: {
                    show: true,
                    formatter: '{b}'
                },
                data: rawData,
            }]
        };

        // 5. Aplicar las opciones al gráfico, combinando con customOptions si existen
        chartInstance.setOption({ ...options, ...customOptions });

        // 6. Devolvemos un valor booleano para indicar éxito
        return true;
    } catch (error) {
        console.error('Error en el módulo de renderizado del mapa:', error);
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
