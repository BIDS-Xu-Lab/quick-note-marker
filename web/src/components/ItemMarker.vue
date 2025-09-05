<script setup>
import { ref } from "vue";
import { useDataStore } from "../DataStore";

const store = useDataStore();

const status = ref({
    is_translating: false,
});

function onClickValueOption(key, value) {
    store.setWorkingItemAnnotationValue(key, value);
}
</script>

<template>
<Panel class="h-full mx-2">

<template #header>
    <div class="w-full flex justify-between">
        <div class="flex items-center gap-2">
            <div class="flex-col items-center">
                <div class="text-lg font-bold">
                    <font-awesome-icon icon="fa-regular fa-bookmark" />
                    Annotation
                </div>
                <div class="panel-subtitle text-sm">
                    <template v-if="store.working_item">
                        <font-awesome-icon :icon="['fas', 'angle-right']" />
                        {{ store.working_item?.note_id }}
                    </template>
                    <template v-else>
                        No item selected
                    </template>
                </div>
            </div>

        </div>
        <div>
        </div>
    </div>
</template>


<div class="flex w-full"
    style="height: calc(100svh - 18.5rem); overflow-y: auto;">
    <div v-if="store.schema" class="w-full flex flex-col">

    <template v-if="store.schema?.dtags?.length > 0"
        v-for="tag in store.schema.dtags">

        <Fieldset class="w-full p-2">
            <template #legend>
                <div class="font-bold">
                    {{ tag.name }}
                </div>
            </template>
            <div class="w-full">
                {{ tag.description }}
            </div>

            <div v-if="tag.type == 'list'"
                class="value-options">
                <div v-for="value in tag.values"
                    class="value-option-item"
                    :class="{ 'value-option-item-selected': store.doesWorkingItemHaveAnnotationValue(tag.save_as_key, value) }"
                    @click="onClickValueOption(tag.save_as_key, value)"
                    :key="value">
                    <span v-if="store.doesWorkingItemHaveAnnotationValue(tag.save_as_key, value)" class="mr-1">
                        <font-awesome-icon icon="fa-solid fa-circle-check" />
                    </span>
                    <span>
                        {{ value }}
                    </span>
                </div>
            </div>

        </Fieldset>
    </template>

    </div>
</div>
</Panel>
</template>

<style scoped>
.oper-bar {
    height: 3rem;
    padding: 0 0 1rem 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.info {
    margin: 0 0 1rem 0;
    font-style: italic;
}
.value-options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0;
}
.value-option-item {
    padding: 0.5rem 1rem;
    border: 1px solid var(--bd-color);
    border-radius: 0.5rem;
    cursor: pointer;
}
.value-option-item:hover {
    background-color: var(--bg-color-hover);
}
.value-option-item-selected {
    font-weight: bold;
    background-color: var(--bg-color-selected);
}
</style>