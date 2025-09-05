<script setup>
import { onMounted, ref } from "vue";
import ItemList from "../components/ItemList.vue";
import ItemDetail from "../components/ItemDetail.vue";
import ItemMarker from "../components/ItemMarker.vue";
import HomeMenu from "../components/menus/HomeMenu.vue";

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
<Splitter class="w-full h-full border-0">
    <SplitterPanel :size="30" :minSize="10">
        <ItemList />
    </SplitterPanel>
    <SplitterPanel :size="45" :minSize="10">
        <ItemDetail />
    </SplitterPanel>
    <SplitterPanel :size="25" :minSize="10">
        <ItemMarker />
    </SplitterPanel>
</Splitter>

</div>

</template>

<style scoped>
</style>
