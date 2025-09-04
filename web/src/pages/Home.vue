<script setup>
import { onMounted, ref } from "vue";
import ItemList from "../components/ItemList.vue";
import ItemDetail from "../components/ItemDetail.vue";
import HomeMenu from "../components/menus/HomeMenu.vue";
import Footer from "../components/Footer.vue";

import { useDataStore } from "../DataStore";
import NaviMenu from "../components/menus/NaviMenu.vue";

const store = useDataStore();

onMounted(() => {
    console.log("* mounted Home.vue");
});
</script>

<template>

<NaviMenu />
<HomeMenu />

<div class="main">
<ItemList />

<ItemDetail />

<!-- <DecisionPanel /> -->
</div>

</template>

<style scoped>
</style>
