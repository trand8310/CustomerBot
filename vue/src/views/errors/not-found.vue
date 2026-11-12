<script setup lang="ts">
import { t } from '../../api';
</script>

<template>
    <section class="not-found card">
        <span class="not-found-code">404</span>
        <p>{{ t('PageNotFound') }}</p>
        <router-link :to="{ name: 'app' }" class="not-found-link">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            {{ t('HomePage') }}
        </router-link>
    </section>
</template>
<style>
.not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 3.5rem 1.5rem;
    text-align: center;
}
.not-found-code {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #818cf8, #4338ca);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}
.not-found p {
    margin: 0;
    color: var(--app-text-muted);
}
.not-found-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 0.5rem;
    font-weight: 500;
}
</style>
