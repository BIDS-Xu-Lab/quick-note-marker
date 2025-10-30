<script setup>
import { ref } from "vue";
import { useDataStore } from "../DataStore";

const store = useDataStore();

const status = ref({
    is_translating: false,
});

function onClickValueOption(key, value) {
    // if no working item, return
    if (!store.working_item) {
        store.msg('No item selected', 'error');
        return;
    }
    store.setWorkingItemAnnotationValue(key, value);
}

function onClickClearAnnotation(key) {
    // if no working item, return
    if (!store.working_item) {
        store.msg('No item selected', 'error');
        return;
    }
    store.setWorkingItemAnnotationValue(key, null);
}

function onClickClearAllAnnotations() {
    // if no working item, return
    if (!store.working_item) {
        store.msg('No item selected', 'error');
        return;
    }

    // ask user to confirm
    if (!confirm('Are you sure to clear all the annotations?')) {
        return;
    }
    
    for (let tag of store.schema.dtags) {
        console.log('* clearing annotation for ', tag.save_as_key);
        store.setWorkingItemAnnotationValue(tag.save_as_key, null);
    }
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
            <Button text
                icon="pi pi-trash"
                v-tooltip.bottom="'Clear all the annotations'"
                @click="onClickClearAllAnnotations">
            </Button>
        </div>
    </div>
</template>


<div class="flex w-full"
    style="height: calc(100svh - 18.5rem); overflow-y: auto;">
    <div v-if="store.schema" class="w-full flex flex-col">

    <template v-if="store.schema?.dtags?.length > 0"
        v-for="tag in store.schema.dtags">

        <Fieldset class="w-full p-2 relative">
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

            <div v-if="tag.attrs?.length > 0"
                class="attr-item-list">
                <div v-for="attr in tag.attrs"
                    class="attr-item">
                    <div class="attr-item-label">
                        {{ attr.name }}
                    </div>
                    <div v-tooltip.bottom="attr.description"
                        class="attr-item-description">
                        {{ attr.description }}
                    </div>
                    <div v-if="attr.vtype == 'text'" 
                        class="attr-item-value">
                        <InputText v-if="store.working_item"
                            v-model="store.working_item[attr.save_as_key]" />
                        <span v-else>
                            Not available
                        </span>
                    </div>
                </div>
            </div>

            <div class="w-full flex justify-end"
                style="margin: -1em 0 0 0; height: 1.5rem;">
                <Button text size="small"
                    icon="pi pi-trash"
                    v-tooltip.bottom="'Clear the annotation for ' + tag.name"
                    @click="onClickClearAnnotation(tag.save_as_key)">
                </Button>
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
.attr-item-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-top: 1px solid var(--bd-color);
    margin-top: 0.5rem;
}
.attr-item {
    display: flex;
    flex-direction: column;
}
.attr-item-label {
    font-weight: bold;
    font-size: 0.9rem;
    line-height: 1;
}
.attr-item-description {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
}
</style>