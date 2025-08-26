// ECharts_scatter_tooltip.js

/**
 * @type {echarts.ECharts}
 */
let chartInstance = null;
let currentData = [];

// Función para renderizar el pequeño gráfico de barras en el tooltip
function renderTooltipChart(container, salesData) {
    const tooltipChart = window.echarts.init(container, null, {
        renderer: 'svg' // Usar SVG para mejor rendimiento en tooltips
    });
    const tooltipOptions = {
        grid: {
            top: 10,
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
            axisLabel: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            show: false
        },
        series: [{
            data: salesData,
            type: 'bar',
            barWidth: '70%',
            label: {
                show: true,
                position: 'top',
                formatter: '{c}'
            },
            itemStyle: {
                borderRadius: [5, 5, 0, 0]
            }
        }]
    };
    tooltipChart.setOption(tooltipOptions);
    return tooltipChart;
}

// La firma de la función renderChart permanece sin cambios
export async function renderChart(container, datasetUrl, customOptions = {}) {
    try {
        if (typeof window.echarts === 'undefined' || !container) {
            console.error('ECharts no está disponible o el contenedor no es válido.');
            return null;
        }

        // 1. Obtener los datos
        const response = await fetch(datasetUrl);
        currentData = await response.json();
        
        // Mapear los datos para el scatter plot
        const scatterData = currentData.map(item => ({
            name: item.name,
            value: [item.cost, item.rating, item.processing_speed],
            monthly_sales: item.monthly_sales
        }));

        // 2. Limpiar el contenedor y crear la estructura
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        
        const chartDiv = document.createElement('div');
        chartDiv.style.width = '100%';
        chartDiv.style.height = '600px'; // Aumentar la altura para el scatter
        container.appendChild(chartDiv);
        
        // 3. Inicializar la instancia del gráfico
        if (chartInstance) {
            chartInstance.dispose();
        }
        chartInstance = window.echarts.init(chartDiv);

        // 4. Configurar las opciones del gráfico de dispersión
        const options = {
            grid: {
                left: '1%', 
                right: '1%',
                bottom: '2%',
                containLabel: true // Importante para que las etiquetas no se corten
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    const data = params.data;
                    const tooltipHtml = `
                        <div style="font-size: 14px; color: #333; padding: 5px;">
                            <strong>${data.name}</strong><br>
                            Costo: $${data.value[0]}<br>
                            Calificación: ${data.value[1]} ⭐<br>
                            Velocidad: ${data.value[2]} GHz<br>
                            <div style="height: 100px; width: 250px;" id="tooltip-chart-${data.id}"></div>
                        </div>
                    `;
                    // Retorna el HTML, ECharts lo renderiza y luego el pequeño gráfico se inicializa en el `nextTick` de la librería.
                    setTimeout(() => {
                        const tooltipContainer = document.getElementById(`tooltip-chart-${data.id}`);
                        if (tooltipContainer) {
                            renderTooltipChart(tooltipContainer, data.monthly_sales);
                        }
                    }, 0);
                    return tooltipHtml;
                }
            },
            xAxis: {
                type: 'value',
                name: 'Costo ($)',
                nameLocation: 'middle',
                nameGap: 30
            },
            yAxis: {
                type: 'value',
                name: 'Calificación',
                nameLocation: 'middle',
                nameGap: 30
            },
            series: [{
                name: 'Productos',
                data: scatterData,
                type: 'scatter',
                symbolSize: function (data) {
                    // Escalar el tamaño de la burbuja
                    return data[2] * 10 + 20;
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(120, 36, 50, 0.5)',
                    shadowOffsetY: 5
                },
                label: {
                    show: false, // Opcional: mostrar etiquetas del producto
                    formatter: '{b}',
                    position: 'top'
                }
            }],
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: { title: 'Descargar' },
                    restore: { title: 'Restaurar' }
                }
            }
        };

        // 5. Aplicar las opciones
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
