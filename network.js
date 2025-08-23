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

        // Preparar nodos con ID numérico
        const nodes = graphData.nodes.map((node, index) => {
            return {
                id: index,
                name: node.name,
                value: node.value,
                symbolSize: Math.max(12, node.value * 1.5), // Tamaño más pequeño
                category: 0,
                x: null,
                y: null,
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
                    width: Math.max(1, link.value * 1) // Grosor reducido
                }
            };
        }).filter(link => link !== null);

        // Limpiar contenedor y establecer tamaño fijo
        container.innerHTML = '';
        container.style.height = '300px';
        container.style.width = '100%';
        container.style.overflow = 'hidden';
        
        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

        const options = {
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            grid: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
                containLabel: false
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ddd',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                },
                formatter: function(params) {
                    if (params.dataType === 'node') {
                        // Encontrar relaciones para este nodo
                        const nodeRelations = links.filter(link => 
                            link.source === params.data.id || link.target === params.data.id
                        );
                        
                        const relatedNames = new Set();
                        nodeRelations.forEach(relation => {
                            if (relation.source === params.data.id) {
                                relatedNames.add(nodes[relation.target].name);
                            } else {
                                relatedNames.add(nodes[relation.source].name);
                            }
                        });
                        
                        let html = `
                            <div style="font-weight:bold;color:#6c5ce7;margin-bottom:8px;">
                                ${params.data.name}
                            </div>
                            <div style="margin-bottom:5px;">Total relaciones: ${params.data.value}</div>
                        `;
                        
                        if (relatedNames.size > 0) {
                            html += `
                                <div style="font-weight:bold;margin:8px 0 5px 0;color:#555;">
                                    Relacionado con:
                                </div>
                                <div style="color:#666;">
                                    ${Array.from(relatedNames).join(', ')}
                                </div>
                            `;
                        }
                        
                        return html;
                    } else if (params.dataType === 'edge') {
                        const sourceNode = nodes[params.data.source];
                        const targetNode = nodes[params.data.target];
                        const direction = params.data.direction === 'apellido1_apellido2' ? 
                            '→ (Apellido1 → Apellido2)' : '← (Apellido2 → Apellido1)';
                        
                        return `
                            <div style="font-weight:bold;color:#7d8fa9;margin-bottom:5px;">
                                Relación entre apellidos
                            </div>
                            <div>${sourceNode.name} ${direction} ${targetNode.name}</div>
                            <div style="margin-top:5px;color:#666;">
                                Frecuencia: ${params.data.value} ocurrencias
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
                
                // FLECHAS
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: [0, 6], // Flechas más pequeñas
                
                // Configuración de nodos - SIN ETIQUETAS
                label: {
                    show: false // Etiquetas ocultas
                },
                
                // Configuración de fuerzas - MUCHO MÁS COMPACTO
                force: {
                    repulsion: 300,   // MUCHO menor repulsión
                    gravity: 0.2,    // Mayor gravedad para centrar
                    edgeLength: 50,  // Aristas muy cortas
                    friction: 0.7,
                    layoutAnimation: true,
                    initLayout: 'circular' // Layout inicial circular para mejor distribución
                },
                
                // Estilo de líneas con flechas
                lineStyle: {
                    color: '#7d8fa9', // Azul grisáceo suave
                    opacity: 0.7,
                    curveness: 0.1,
                    width: function(params) {
                        return Math.max(1, params.data.value * 0.8);
                    },
                    type: 'solid'
                },
                
                // Estilo de nodos
                itemStyle: {
                    color: '#6c5ce7',
                    borderColor: '#fff',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 3
                },
                
                // Efectos al pasar el mouse
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: function(params) {
                            return Math.max(2, params.data.value * 1.2);
                        },
                        opacity: 1,
                        color: '#5a6b84'
                    },
                    itemStyle: {
                        borderColor: '#ff4757',
                        borderWidth: 2
                    },
                    label: {
                        show: true, // Mostrar etiqueta solo al enfocar
                        position: 'right',
                        formatter: '{b}',
                        fontSize: 10,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: [2, 4]
                    }
                },
                
                cursor: 'pointer',
                draggable: true,
                center: ['50%', '50%'] // Centrar el grafo
            }]
        };

        chartInstance.setOption(options);

        // Eventos para arrastrar y mover nodos
        chartInstance.on('mousedown', function(params) {
            if (params.dataType === 'node') {
                isDragging = true;
                selectedNode = params.dataIndex;
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
