// chart.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;
let isDragging = false;
let selectedNode = null;

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

        // Preparar nodos con ID numérico y posición inicial
        const nodes = graphData.nodes.map((node, index) => {
            return {
                id: index,
                name: node.name,
                value: node.value,
                symbolSize: Math.max(20, node.value * 2.5),
                category: 0,
                x: Math.random() * 100,
                y: Math.random() * 100,
                fixed: false
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

        // Limpiar contenedor
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
            series: [{
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: links,
                roam: true,
                focusNodeAdjacency: true,
                
                // FLECHAS - Color azul grisáceo suave
                edgeSymbol: ['none', 'arrow'],
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
                
                // Configuración de fuerzas - MÁS ESPACIO entre nodos
                force: {
                    repulsion: 400,  // Aumentado para más espacio
                    gravity: 0.02,   // Reducido para más expansión
                    edgeLength: 120,  // Aumentado para aristas más largas
                    friction: 0.5,
                    layoutAnimation: true
                },
                
                // Estilo de líneas con flechas - Color azul grisáceo suave
                lineStyle: {
                    color: function(params) {
                        // Azul grisáceo suave para todas las direcciones
                        return '#7d8fa9';
                    },
                    opacity: 0.8,
                    curveness: 0.1,
                    width: function(params) {
                        return Math.max(2, params.data.value * 1.8);
                    },
                    type: 'solid'
                },
                
                // Estilo de nodos
                itemStyle: {
                    color: '#6c5ce7',
                    borderColor: '#fff',
                    borderWidth: 2,
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowBlur: 6
                },
                
                // Efectos al pasar el mouse
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: function(params) {
                            return Math.max(4, params.data.value * 2.5);
                        },
                        opacity: 1,
                        color: '#5a6b84' // Color un poco más oscuro al enfocar
                    },
                    itemStyle: {
                        borderColor: '#ff4757',
                        borderWidth: 3
                    }
                },
                
                cursor: 'pointer',
                draggable: true
            }]
        };

        chartInstance.setOption(options);

        // Eventos para arrastrar y mover nodos
        chartInstance.on('mousedown', function(params) {
            if (params.dataType === 'node') {
                isDragging = true;
                selectedNode = params.dataIndex;
                // Fijar el nodo mientras se arrastra
                chartInstance.setOption({
                    series: [{
                        data: nodes.map((node, index) => {
                            if (index === selectedNode) {
                                return { ...node, fixed: true };
                            }
                            return node;
                        })
                    }]
                });
            }
        });

        chartInstance.on('mouseup', function() {
            if (isDragging && selectedNode !== null) {
                isDragging = false;
                // Liberar el nodo después de arrastrar
                chartInstance.setOption({
                    series: [{
                        data: nodes.map((node, index) => {
                            if (index === selectedNode) {
                                return { ...node, fixed: false };
                            }
                            return node;
                        })
                    }]
                });
                selectedNode = null;
            }
        });

        chartInstance.on('globalout', function() {
            if (isDragging && selectedNode !== null) {
                isDragging = false;
                chartInstance.setOption({
                    series: [{
                        data: nodes.map((node, index) => {
                            if (index === selectedNode) {
                                return { ...node, fixed: false };
                            }
                            return node;
                        })
                    }]
                });
                selectedNode = null;
            }
        });

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
