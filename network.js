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
                symbolSize: Math.max(20, node.value * 2.5),
                category: 0
            };
        });

        // Preparar enlaces con IDs numéricos y dirección
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
                direction: link.direction || 'apellido1_apellido2',
                lineStyle: {
                    width: Math.max(2, link.value * 1.5)
                }
            };
        }).filter(link => link !== null);

        // Limpiar contenedor sin definir altura
        container.innerHTML = '';
        
        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

        const options = {
            animation: true,
            animationDuration: 1500,
            animationEasing: 'quinticOut',
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.dataType === 'node') {
                        return `
                            <div style="font-weight:bold;margin-bottom:5px;">${params.data.name}</div>
                            <div>Total de relaciones: ${params.data.value}</div>
                        `;
                    } else if (params.dataType === 'edge') {
                        const sourceNode = nodes[params.data.source];
                        const targetNode = nodes[params.data.target];
                        const direction = params.data.direction === 'apellido1_apellido2' ? 
                            '→ (Apellido1 → Apellido2)' : '← (Apellido2 → Apellido1)';
                        
                        return `
                            <div style="font-weight:bold;margin-bottom:5px;">Relación</div>
                            <div>${sourceNode.name} ${direction} ${targetNode.name}</div>
                            <div>Frecuencia: ${params.data.value} ocurrencias</div>
                            <div style="font-size:11px;color:#666;margin-top:3px;">
                                ${params.data.direction}
                            </div>
                        `;
                    }
                }
            },
            legend: {
                data: ['Relaciones'],
                right: 10,
                top: 10
            },
            series: [{
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: links,
                roam: true,
                focusNodeAdjacency: true,
                edgeSymbol: ['circle', 'arrow'],
                edgeSymbolSize: [0, 10],
                
                // Configuración de nodos
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    fontSize: 12,
                    color: '#2c2c2c',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    padding: [3, 5],
                    borderRadius: 3
                },
                
                // Configuración de fuerzas
                force: {
                    repulsion: 250,
                    gravity: 0.1,
                    edgeLength: 100,
                    friction: 0.6,
                    layoutAnimation: true
                },
                
                // Estilo de líneas con flechas
                lineStyle: {
                    color: function(params) {
                        return params.data.direction === 'apellido1_apellido2' ? '#ff6b6b' : '#4ecdc4';
                    },
                    opacity: 0.9,
                    curveness: 0.2,
                    width: function(params) {
                        return Math.max(2, params.data.value * 1.8);
                    },
                    type: 'solid'
                },
                
                // Flechas direccionales
                edgeLabel: {
                    show: false
                },
                
                // Estilo de nodos
                itemStyle: {
                    color: '#6c5ce7',
                    borderColor: '#fff',
                    borderWidth: 2,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 8,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                
                // Efectos al pasar el mouse
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: function(params) {
                            return Math.max(4, params.data.value * 2.5);
                        },
                        opacity: 1
                    },
                    itemStyle: {
                        borderColor: '#ff4757',
                        borderWidth: 3
                    },
                    label: {
                        show: true,
                        fontWeight: 'bold'
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

        // Ajustar automáticamente al redimensionar
        const resizeObserver = new ResizeObserver(() => {
            if (chartInstance) {
                chartInstance.resize();
            }
        });
        resizeObserver.observe(container);

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
