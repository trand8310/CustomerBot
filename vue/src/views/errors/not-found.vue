<script setup lang="ts">
import { t } from '../../api';
</script>

<template>
    <section class="panel card">
        <h1 class="h4">404</h1>
        <p>{{ t('PageNotFound', '找不到页面') }}</p>
        <router-link :to="{ name: 'app' }">{{ t('HomePage', '首页') }}</router-link>
    </section>
</template>
