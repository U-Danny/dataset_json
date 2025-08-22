// ECharts_render_grafo.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;

export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts no está disponible o el contenedor no es válido.');
            return null;
        }

        const response = await fetch(datasetUrl);
        const graphData = await response.json();
        
        // 1. Mapea los nodos para crear un índice de referencia
        const nodeMap = new Map();
        graphData.nodes.forEach((node, index) => {
            node.id = index; // Asigna un ID numérico
            nodeMap.set(node.name, index);
        });

        // 2. Mapea los enlaces para usar los ID numéricos de los nodos
        const links = graphData.links.map(link => {
            return {
                source: nodeMap.get(link.source),
                target: nodeMap.get(link.target),
                value: link.value,
                // Mantener los nombres originales para el tooltip
                sourceName: link.source,
                targetName: link.target
            };
        });

        container.innerHTML = '';
        container.style.height = '800px';

        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

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
                        // Usar los nombres guardados en el enlace
                        return `<strong>${params.data.sourceName}</strong> y <strong>${params.data.targetName}</strong> se relacionan <strong>${params.data.value}</strong> veces.`;
                    }
                    return null;
                }
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: { title: 'Descargar Imagen' },
                    restore: { title: 'Restaurar' }
                }
            },
            series: [{
                name: 'Relaciones de Apellidos',
                type: 'graph',
                layout: 'force',
                data: graphData.nodes,
                links: links,
                roam: true,
                label: {
                    show: false,
                    position: 'right',
                    formatter: '{b}'
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
                    width: function(params) {
                        return Math.max(2, params.data.value * 0.5); // Ajusta el multiplicador según necesites
                    }
                },
                symbolSize: function(value, params) {
                    return Math.max(20, params.data.value * 5);
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 10
                    }
                },
                itemStyle: {
                    color: function(params) {
                        const maxVal = Math.max(...graphData.nodes.map(n => n.value));
                        const ratio = params.data.value / maxVal;
                        const r = Math.round(255 - 100 * ratio);
                        const g = Math.round(230 - 230 * ratio);
                        const b = Math.round(230 - 230 * ratio);
                        return `rgb(${r},${g},${b})`;
                    }
                }
            }]
        };

        chartInstance.setOption({ ...options, ...customOptions });

        return true;
    } catch (error) {
        console.error('Error en el módulo de renderizado de ECharts:', error);
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
