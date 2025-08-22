// ECharts_network.js

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

        // 1. Obtener los datos del API
        const response = await fetch(datasetUrl);
        const rawData = await response.json();

        // 2. Procesar los datos para el grafo
        const nodesMap = new Map();
        const linksMap = new Map();

        rawData.forEach(person => {
            const source = person.first_name;
            const target = person.last_name;
            
            // Contar roles de cada apellido (primer y segundo)
            if (!nodesMap.has(source)) nodesMap.set(source, { first_name_count: 0, last_name_count: 0, relationships: new Set() });
            if (!nodesMap.has(target)) nodesMap.set(target, { first_name_count: 0, last_name_count: 0, relationships: new Set() });
            
            nodesMap.get(source).first_name_count++;
            nodesMap.get(source).relationships.add(target);
            nodesMap.get(target).last_name_count++;
            nodesMap.get(target).relationships.add(source);

            // Contar el peso de las aristas (combinaciones)
            const linkKey = `${source}->${target}`;
            if (!linksMap.has(linkKey)) linksMap.set(linkKey, { source: source, target: target, value: 0 });
            linksMap.get(linkKey).value++;
        });

        // Convertir los Maps a arrays para ECharts
        const nodes = Array.from(nodesMap.entries()).map(([name, data]) => ({
            name: name,
            value: data.first_name_count + data.last_name_count, // Usamos la suma para el tamaño del nodo
            // Datos extra para el tooltip
            first_name_count: data.first_name_count,
            last_name_count: data.last_name_count,
            relationships_count: data.relationships.size,
            relationships: Array.from(data.relationships)
        }));
        
        const links = Array.from(linksMap.values());
        
        // 3. Limpiar y configurar el contenedor
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.height = '800px'; // Altura para una mejor visualización

        // 4. Inicializar el gráfico
        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(container);

        // 5. Configurar las opciones del grafo
        const options = {
            title: {
                text: 'Grafo de Relaciones de Apellidos',
                subtext: 'El ancho de la línea indica la frecuencia de la combinación',
                left: 'center',
                top: 20
            },
            tooltip: {
                formatter: function (params) {
                    if (params.dataType === 'node') {
                        const nodeData = params.data;
                        const relationships = nodeData.relationships.join(', ');
                        return `
                            <strong>${nodeData.name}</strong><br>
                            Primer Apellido: ${nodeData.first_name_count} veces<br>
                            Segundo Apellido: ${nodeData.last_name_count} veces<br>
                            Relacionado con: ${nodeData.relationships_count} apellidos<br>
                            <span style="font-size: 12px; color: #888;">Relaciones: ${relationships}</span>
                        `;
                    }
                    if (params.dataType === 'edge') {
                        return `<strong>${params.data.source}</strong> y <strong>${params.data.target}</strong> se combinan ${params.data.value} veces.`;
                    }
                    return null;
                }
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: { title: 'Descargar' },
                    restore: { title: 'Restaurar' }
                }
            },
            series: [{
                name: 'Relaciones de Apellidos',
                type: 'graph',
                layout: 'force', // Usar layout de fuerza para una mejor visualización de comunidades
                data: nodes,
                links: links,
                roam: true, // Permitir zoom y pan
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}'
                },
                force: {
                    repulsion: 1500, // Fuerza de repulsión entre nodos
                    gravity: 0.1,
                    edgeLength: 150 // Longitud de las aristas
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.1,
                    width: (params) => params.value * 2 // El ancho de la arista es proporcional a su valor
                },
                tooltip: {
                    show: true
                },
                edgeLabel: {
                    show: false, // Opcional: mostrar el peso en las aristas
                    formatter: (params) => params.value
                }
            }]
        };

        // 6. Aplicar las opciones
        chartInstance.setOption({ ...options, ...customOptions });

        return true;
    } catch (error) {
        console.error('Error en el módulo de renderizado de ECharts:', error);
        return false;
    }
}

/**
 * Limpia el gráfico de ECharts.
 */
export function dispose() {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
}

/**
 * Redimensiona el gráfico de ECharts.
 */
export function resize() {
    if (chartInstance) {
        chartInstance.resize();
    }
}
