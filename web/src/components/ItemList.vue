<script setup>
import { ref } from "vue";
import { pubmed } from "../utils/pubmed";
import { useDataStore } from "../DataStore";
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const store = useDataStore();

async function onClickItem(item) {
    console.log('* click item:', item);
}

function summarizeNote(note_text) {
    let _note_text = note_text;
    if (_note_text.length > 30) {
        _note_text = _note_text.substring(0, 30) + '...';
    }
    return _note_text;
}
</script>


<template>
<Panel class="h-full mr-2">
<template #header>
    <div class="w-full flex justify-between">
        <div class="flex items-center gap-2">
            <div class="flex-col">
                <div class="text-lg font-bold">
                    <font-awesome-icon :icon="['far', 'file']" />
                    Items
                </div>
                <div class="panel-subtitle text-sm ml-1">
                    {{ store.items.length }} items
                </div>
            </div>

            
        </div>
        <div>
            <IconField v-tooltip="'Filter the list by keyword'">
                <InputIcon>
                    <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" 
                    class="min-w-[10rem] max-w-[20rem]"
                    placeholder="Filter by keyword" size="normal" />
            </IconField>
        </div>
    </div>
</template>

<div class="flex flex-col"
    style="height: calc(100svh - 18.5rem); overflow-y: auto;">

    <DataTable tableStyle="width: 100%;"
        size="small"
        v-model:selection="store.working_item"
        v-model:filters="filters"
        :value="store.items" 
        :rows="10"
        selectionMode="single" 
        scrollable
        :scrollHeight="'calc(100svh - 22.5rem)'"
        :globalFilterFields="['note_id', 'note_text']"
        dataKey="note_id"
        @row-select="onClickItem"
        paginator>
        <Column header="ID" sortable field="note_id">
            <template #body="slotProps">
                <div class="flex flex-col">
                    <div>
                        {{ slotProps.data.note_id }}
                    </div>
                    <div>
                        {{ summarizeNote(slotProps.data.note_text) }}
                    </div>
                </div>
            </template>
        </Column>
        <Column header="Result">
            <template #body="slotProps">
                
            </template>
        </Column>
    </DataTable>

</div>

</Panel>
</template>


<style scoped>
</style>