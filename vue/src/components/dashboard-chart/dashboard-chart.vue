<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
    title: string;
    categories: string[];
    values: number[];
    ariaLabel: string;
}>();

const container = ref<HTMLElement>();

let chart: echarts.ECharts | undefined;

function render() {
    if (!chart || !container.value) return;
    chart.setOption({
        textStyle: { fontFamily: getComputedStyle(container.value).fontFamily, fontSize: 12 },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(79, 70, 229, 0.06)' } },
            backgroundColor: '#0f172a',
            borderWidth: 0,
            padding: [8, 12],
            textStyle: { color: '#f8fafc', fontSize: 12 },
            extraCssText: 'border-radius: 8px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.2);',
        },
        grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
        xAxis: {
            type: 'category',
            data: props.categories,
            axisTick: { show: false },
            axisLabel: { color: '#64748b', margin: 12 },
            axisLine: { lineStyle: { color: '#e5e7eb' } },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#f1f5f9' } },
        },
        series: [
            {
                type: 'bar',
                data: props.values,
                barMaxWidth: 40,
                itemStyle: {
                    borderRadius: [6, 6, 0, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#6366f1' },
                        { offset: 1, color: '#a5b4fc' },
                    ]),
                },
                emphasis: { itemStyle: { color: '#4f46e5' } },
            },
        ],
    });
}

onMounted(() => {
    if (!container.value) return;
    chart = echarts.init(container.value);
    render();
});

watch(() => [props.categories, props.values], render);

useResizeObserver(container, () => chart?.resize());

onBeforeUnmount(() => chart?.dispose());
</script>
<template>
    <div class="card mb-3">
        <div class="card-header">
            <h3 class="card-title">{{ title }}</h3>
        </div>
        <div class="card-body">
            <div ref="container" class="dashboard-chart" role="img" :aria-label="ariaLabel"></div>
        </div>
    </div>
</template>
<style>
.dashboard-chart {
    height: 300px;
    width: 100%;
}
</style>
