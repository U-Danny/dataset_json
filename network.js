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
                x: Math.random() * 100, // Posición inicial aleatoria
                y: Math.random() * 100,
                fixed: false // Permite que se muevan con la fuerza
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
            series: [{
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: links,
                roam: true,
                focusNodeAdjacency: true,
                
                // FLECHAS - Configuración crítica
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: [0, 12],
                
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
                    repulsion: 200,
                    gravity: 0.05,
                    edgeLength: 80,
                    friction: 0.6,
                    layoutAnimation: true
                },
                
                // Estilo de líneas con flechas
                lineStyle: {
                    color: function(params) {
                        return params.data.direction === 'apellido1_apellido2' ? '#ff6b6b' : '#4ecdc4';
                    },
                    opacity: 0.9,
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
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 8
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
                    }
                },
                
                cursor: 'pointer',
                draggable: true // Habilita el arrastre de nodos
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

        // Botones de control para reorganizar
        addControlButtons(container, chartInstance, nodes);

        return chartInstance;

    } catch (error) {
        console.error('Error en el módulo de renderizado de ECharts:', error);
        return false;
    }
}

// Función para agregar botones de control
function addControlButtons(container, chartInstance, nodes) {
    const controls = document.createElement('div');
    controls.style.position = 'absolute';
    controls.style.top = '10px';
    controls.style.right = '10px';
    controls.style.zIndex = '1000';
    controls.style.display = 'flex';
    controls.style.gap = '10px';
    controls.style.background = 'rgba(255,255,255,0.9)';
    controls.style.padding = '10px';
    controls.style.borderRadius = '5px';
    controls.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reorganizar';
    resetBtn.style.padding = '8px 12px';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.background = '#6c5ce7';
    resetBtn.style.color = 'white';
    resetBtn.style.cursor = 'pointer';
    
    resetBtn.onclick = function() {
        const newNodes = nodes.map(node => ({
            ...node,
            x: Math.random() * 100,
            y: Math.random() * 100,
            fixed: false
        }));
        
        chartInstance.setOption({
            series: [{
                data: newNodes,
                force: {
                    layoutAnimation: true
                }
            }]
        });
    };

    const centerBtn = document.createElement('button');
    centerBtn.textContent = 'Centrar';
    centerBtn.style.padding = '8px 12px';
    centerBtn.style.border = 'none';
    centerBtn.style.borderRadius = '4px';
    centerBtn.style.background = '#00b894';
    centerBtn.style.color = 'white';
    centerBtn.style.cursor = 'pointer';
    
    centerBtn.onclick = function() {
        chartInstance.setOption({
            series: [{
                data: nodes.map(node => ({
                    ...node,
                    x: null,
                    y: null,
                    fixed: false
                })),
                force: {
                    layoutAnimation: true
                }
            }]
        });
    };

    controls.appendChild(resetBtn);
    controls.appendChild(centerBtn);
    container.appendChild(controls);
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
