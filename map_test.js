/**
 * Crea y renderiza un gráfico de mapa usando ECharts.
 * * @param {string} containerId - El ID del elemento HTML donde se renderizará el gráfico.
 * @param {string} geoJsonUrl - La URL del archivo GeoJSON.
 * @param {string} dataUrl - La URL del archivo JSON con los datos.
 */
async function createChart(containerId, geoJsonUrl, dataUrl) {
    // Inicializa la instancia de ECharts en el contenedor especificado
    const chartDom = document.getElementById(containerId);
    const myChart = echarts.init(chartDom);
    let option;

    // Carga el GeoJSON y los datos de manera asíncrona y simultánea
    try {
        const [geoJson, dataset] = await Promise.all([
            fetch(geoJsonUrl).then(res => res.json()),
            fetch(dataUrl).then(res => res.json())
        ]);

        // Registra el mapa en ECharts usando 'ecuador' como nombre
        echarts.registerMap('ecuador', geoJson);

        // Configura las opciones del gráfico
        option = {
            title: {
                text: 'Población por provincia de Ecuador',
                subtext: 'Fuente: Datos del Censo 2022 (simulados)',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>Población: {c}'
            },
            visualMap: {
                min: 100000,
                max: 4000000,
                left: 'left',
                top: 'bottom',
                text: ['Alto', 'Bajo'],
                calculable: true,
                inRange: {
                    color: ['#e0ffff', '#006edd']
                }
            },
            series: [
                {
                    name: 'Población',
                    type: 'map',
                    map: 'ecuador',
                    roam: true,
                    label: {
                        show: true,
                        formatter: '{b}'
                    },
                    data: dataset
                }
            ]
        };

        // Aplica las opciones al gráfico
        myChart.setOption(option);

        // Ajusta el tamaño del gráfico al redimensionar la ventana
        window.addEventListener('resize', () => myChart.resize());

    } catch (error) {
        console.error('Error al cargar los datos del mapa:', error);
    }
}

// Llama a la función `createChart` con los parámetros adecuados
document.addEventListener('DOMContentLoaded', () => {
    createChart('chart-container', 'ecuador.geojson', 'dataset.json');
});
