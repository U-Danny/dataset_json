// ECharts_render_grafo.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;

// Función para mapear un valor a un color en una escala
function mapValueToColor(value, maxVal) {
    const minColor = [255, 230, 230]; // Rosa claro
    const maxColor = [255, 0, 0];   // Rojo intenso
    const ratio = value / maxVal;
    const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * ratio);
    const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * ratio);
    const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * ratio);
    return `rgb(${r},${g},${b})`;
}

export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts is not available or the container is invalid.');
            return null;
        }

        const response = await fetch(datasetUrl);
        const graphData = await response.json();
        const nodes = graphData.nodes;
        const links = graphData.links;

        container.innerHTML = '';
        container.style.height = '800px';

        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

        // Encontrar el valor máximo para la escala de color
        const maxNodeValue = Math.max(...nodes.map(node => node.value));

        const options = {
            title: {
                text: 'Grafo de Relaciones de Apellidos',
                subtext: 'El grosor de la arista indica la frecuencia de la combinación',
                left: 'center',
                top: 20
            },
            tooltip: {
                formatter: function (params) {
                    if (params.dataType === 'node') {
                        return `<strong>${params.data.name}</strong><br>Total de relaciones: ${params.data.value}`;
                    }
                    if (params.dataType === 'edge') {
                        return `<strong>${params.data.source}</strong> y <strong>${params.data.target}</strong> se relacionan <strong>${params.data.value}</strong> veces.`;
                    }
                    return null;
                }
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: { title: 'Download Image' },
                    restore: { title: 'Restore' }
                }
            },
            series: [{
                name: 'Relaciones de Apellidos',
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: links,
                roam: true,
                label: {
                    show: false
                },
                edgeLabel: {
                    show: false,
                },
                force: {
                    repulsion: 1500,
                    gravity: 0.1,
                    edgeLength: 100
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.1,
                    width: (params) => {
                        return Math.max(2, params.data.value);
                    }
                },
                symbolSize: (value, params) => {
                    return Math.max(20, params.data.value * 5);
                },
                itemStyle: {
                    color: (params) => mapValueToColor(params.data.value, maxNodeValue)
                },
                tooltip: {
                    show: true
                },
                // Aseguramos que la propiedad 'emphasis' sea parte de la serie
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 10
                    }
                }
            }]
        };

        chartInstance.setOption({ ...options, ...customOptions });

        return true;
    } catch (error) {
        console.error('Error in the ECharts rendering module:', error);
        return false;
    }
}

/**
 * Disposes of the ECharts instance.
 */
export function dispose() {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
}

/**
 * Resizes the ECharts instance.
 */
export function resize() {
    if (chartInstance) {
        chartInstance.resize();
    }
}
