<script setup>

import { useDataStore } from "../DataStore";

const store = useDataStore();
</script>

<template>
<div class="footer">
  <div class="flex flex-row gap-2">
    <div>
      <font-awesome-icon icon="fa-regular fa-file-lines" />
      {{ store.schema_file?.name }}:
      <b>{{ store.schema?.dtags?.length }}</b> tags
    </div>

    <div>
      <font-awesome-icon icon="fa-regular fa-folder-closed" />
      {{ store.dataset_file?.name }}:
      <b>{{ store.items.length }}</b> items
    </div>
  </div>

  <div>
    <a href="https://github.com/BIDS-Xu-Lab/quick-note-marker"
      target="_blank">
      <font-awesome-icon icon="fa-brands fa-github" />
      {{ store.app_config.system.name }}
      {{ store.version }}
    </a>
  </div>
</div>
</template>

<style scoped>

.footer {
  position: absolute;
  bottom: 0;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 2rem;
  background-color: var(--bg-color-menu);
  border-top: 1px solid var(--bd-color);
}
</style>