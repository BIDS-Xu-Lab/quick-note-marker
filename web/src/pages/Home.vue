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
    <SplitterPanel :size="30" :minSize="25" :maxSize="35">
        <ItemList />
    </SplitterPanel>
    <SplitterPanel :size="45" :minSize="40">
        <ItemDetail />
    </SplitterPanel>
    <SplitterPanel :size="25" :minSize="25">
        <ItemMarker />
    </SplitterPanel>
</Splitter>

</div>

</template>

<style scoped>

.main {
    position: absolute;
    display: flex;
    width: 100%;
    /* 2.5 navi + 7 menu + 2 footer */
    height: calc(100dvh - 11.5rem);
    padding: 0.5rem;

    top: 9.5rem;
}
</style>
