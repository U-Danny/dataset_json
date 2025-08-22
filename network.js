// chart.js

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
        
        // Crear mapeo de nombres a IDs numéricos
        const nodeMap = new Map();
        graphData.nodes.forEach((node, index) => {
            nodeMap.set(node.name, index);
        });

        // Preparar nodos con ID numérico
        const nodes = graphData.nodes.map((node, index) => {
            return {
                id: index,
                name: node.name,
                value: node.value,
                symbolSize: Math.max(15, node.value * 3)
            };
        });

        // Preparar enlaces con IDs numéricos
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
                lineStyle: {
                    width: Math.max(2, link.value * 1.5)
                }
            };
        }).filter(link => link !== null);

        container.innerHTML = '';
        container.style.height = '400px';
        container.style.width = '100%';

        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

        const options = {
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            series: [{
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: links,
                roam: true,
                focusNodeAdjacency: true,
                
                // Configuración de nodos
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    fontSize: 11,
                    color: '#2c2c2c',
                    fontWeight: 'bold'
                },
                
                // Configuración de fuerzas
                force: {
                    repulsion: 300,  // Mayor repulsión para separar nodos
                    gravity: 0.05,   // Menor gravedad
                    edgeLength: 80,   // Longitud de arista
                    friction: 0.8,
                    layoutAnimation: true
                },
                
                // Estilo de líneas
                lineStyle: {
                    color: '#ff6b6b',
                    opacity: 0.8,
                    curveness: 0.1,
                    width: function(params) {
                        return Math.max(2, params.data.value * 2);
                    }
                },
                
                // Estilo de nodos
                itemStyle: {
                    color: '#4ecdc4',
                    borderColor: '#fff',
                    borderWidth: 2,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 6,
                    shadowOffsetX: 1,
                    shadowOffsetY: 1
                },
                
                // Efectos al pasar el mouse
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: function(params) {
                            return Math.max(4, params.data.value * 3);
                        },
                        color: '#ff4757'
                    },
                    itemStyle: {
                        borderColor: '#ff4757',
                        borderWidth: 3
                    },
                    label: {
                        show: true,
                        fontSize: 12,
                        color: '#ff4757'
                    }
                },
                
                // Tooltip
                tooltip: {
                    show: true,
                    formatter: function(params) {
                        if (params.dataType === 'node') {
                            return `<strong>${params.data.name}</strong><br>Relaciones: ${params.data.value}`;
                        } else if (params.dataType === 'edge') {
                            const sourceNode = nodes[params.data.source];
                            const targetNode = nodes[params.data.target];
                            return `<strong>${sourceNode.name}</strong> ↔ <strong>${targetNode.name}</strong><br>Frecuencia: ${params.data.value}`;
                        }
                    }
                },
                
                // Estados de selección
                select: {
                    itemStyle: {
                        borderColor: '#ff4757',
                        borderWidth: 3
                    }
                },
                
                cursor: 'pointer'
            }]
        };

        chartInstance.setOption(options);

        // Ajustar el diseño después de la renderización inicial
        setTimeout(() => {
            if (chartInstance) {
                chartInstance.resize();
            }
        }, 100);

        return chartInstance;

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

/**
 * Exporta la instancia del chart para uso externo
 */
export function getChartInstance() {
    return chartInstance;
}
