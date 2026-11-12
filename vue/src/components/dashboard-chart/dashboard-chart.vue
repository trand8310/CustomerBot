<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const container = ref<HTMLElement>();

let chart: echarts.ECharts | undefined;

onMounted(() => {
    if (!container.value) return;
    chart = echarts.init(container.value);
    chart.setOption({
        textStyle: { fontFamily: getComputedStyle(container.value).fontFamily, fontSize: 12 },
        tooltip: { trigger: 'axis' },
        grid: { left: 55, right: 20, top: 20, bottom: 40 },
        xAxis: {
            type: 'category',
            data: ['Commits', 'Issues', 'Releases', 'Watching'],
            axisLabel: { color: '#495057' },
            axisLine: { lineStyle: { color: '#adb5bd' } },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#495057' },
            splitLine: { lineStyle: { color: '#dee2e6', type: 'dashed' } },
        },
        series: [
            {
                type: 'bar',
                data: [6350, 170, 200, 810],
                itemStyle: { color: '#0d6efd' },
                barMaxWidth: 36,
            },
        ],
    });
});

useResizeObserver(container, () => chart?.resize());

onBeforeUnmount(() => chart?.dispose());
</script>
<template>
    <div class="card mb-3">
        <div class="card-header">
            <h3 class="card-title">
                Repository activity
                <small class="text-body-secondary">(sample data)</small>
            </h3>
        </div>
        <div class="card-body">
            <div ref="container" class="dashboard-chart" role="img" aria-label="Sample repository activity chart"></div>
        </div>
    </div>
</template>
<style>
.dashboard-chart {
    height: 280px;
    width: 100%;
}
</style>
