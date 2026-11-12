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
            axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0, 0, 0, 0.03)' } },
            backgroundColor: '#fff',
            borderWidth: 0,
            padding: [8, 12],
            textStyle: { color: 'rgba(0, 0, 0, 0.88)', fontSize: 12 },
            extraCssText: 'border-radius: 8px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12);',
        },
        grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
        xAxis: {
            type: 'category',
            data: props.categories,
            axisTick: { show: false },
            axisLabel: { color: 'rgba(0, 0, 0, 0.45)', margin: 12 },
            axisLine: { lineStyle: { color: '#d9d9d9' } },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLabel: { color: 'rgba(0, 0, 0, 0.45)' },
            splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        },
        series: [
            {
                type: 'bar',
                data: props.values,
                barMaxWidth: 32,
                itemStyle: { borderRadius: [2, 2, 0, 0], color: '#1677ff' },
                emphasis: { itemStyle: { color: '#0958d9' } },
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
