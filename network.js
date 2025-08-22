// ECharts_render_grafo.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;

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

        const options = {
            title: {
                text: 'Graph of Family Relationships',
                subtext: 'The thickness of the edge indicates the frequency of the combination',
                left: 'center',
                top: 20
            },
            tooltip: {
                formatter: function (params) {
                    if (params.dataType === 'node') {
                        return `<strong>${params.data.name}</strong><br>Total relationships: ${params.data.value}`;
                    }
                    if (params.dataType === 'edge') {
                        return `<strong>${params.data.source}</strong> and <strong>${params.data.target}</strong> are related <strong>${params.data.value}</strong> times.`;
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
                name: 'Family Relationships',
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
                    // Ajuste de las fuerzas para una mejor visualización de aristas
                    repulsion: 1500,
                    gravity: 0.1,
                    edgeLength: 100,
                    // Aumentamos la amortiguación del movimiento
                    friction: 0.6
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
                tooltip: {
                    show: true
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
