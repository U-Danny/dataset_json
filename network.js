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
        
        // 1. Crear mapeo de nombres a IDs numéricos
        const nodeMap = new Map();
        graphData.nodes.forEach((node, index) => {
            nodeMap.set(node.name, index);
        });

        // 2. Preparar nodos con ID numérico
        const nodes = graphData.nodes.map((node, index) => {
            return {
                id: index, // ID numérico requerido por ECharts
                name: node.name,
                value: node.value,
                originalId: node.id // Mantener el ID original por si acaso
            };
        });

        // 3. Preparar enlaces con IDs numéricos
        const links = graphData.links.map(link => {
            const sourceIdx = nodeMap.get(link.source);
            const targetIdx = nodeMap.get(link.target);
            
            if (sourceIdx === undefined || targetIdx === undefined) {
                console.warn(`Enlace inválido: ${link.source} -> ${link.target}`);
                return null;
            }
            
            return {
                source: sourceIdx,
                target: targetIdx,
                value: link.value,
                sourceName: link.source, // Guardar nombres para el tooltip
                targetName: link.target
            };
        }).filter(link => link !== null); // Filtrar enlaces inválidos

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
                data: nodes,
                links: links,
                roam: true,
                focusNodeAdjacency: true,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    fontSize: 12,
                    color: '#333'
                },
                edgeLabel: {
                    show: false
                },
                force: {
                    repulsion: 100,
                    gravity: 0.1,
                    edgeLength: 30,
                    layoutAnimation: true
                },
                lineStyle: {
                    color: '#5470c6', // Color azul fijo para las aristas
                    opacity: 0.8,
                    curveness: 0.2,
                    width: function(params) {
                        return Math.max(1, params.data.value * 2); // Grosor basado en el valor
                    }
                },
                symbolSize: function(value, params) {
                    return Math.max(15, params.data.value * 4); // Tamaño del nodo
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 8,
                        color: '#ff0000' // Color rojo al enfocar
                    },
                    itemStyle: {
                        borderColor: '#000',
                        borderWidth: 2
                    }
                },
                itemStyle: {
                    color: '#91cc75', // Color verde fijo para los nodos
                    borderColor: '#fff',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowBlur: 5
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
