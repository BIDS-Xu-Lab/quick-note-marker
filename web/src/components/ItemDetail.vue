<script setup>
import { ref } from "vue";
import { useDataStore } from "../DataStore";

const store = useDataStore();

const status = ref({
    is_translating: false,
});

function renderText(text) {
    let _text = text;

    // replace \n with <br>
    _text = _text.replace(/\\n/g, '<br>');

    // replace \t with &#9;
    _text = _text.replace(/\\t/g, '<b class="mx-1">&nbsp;</b>');

    if (store.config.features.auto_highlight.enabled) {
        _text = store.highlight(
            _text,
            store.config.keywords,
        )
    }
    return _text;
}

function countTextLength(text) {
    return text.length.toLocaleString('en-US');
}

</script>

<template>
<!-- <Panel class="flex flex-col w-1/3"> -->
<Panel class="h-full mx-2">

<template #header>
    <div class="w-full flex justify-between">
        <div class="flex items-center gap-2">
            <div class="flex-col items-center">
                <div class="text-lg font-bold">
                    <font-awesome-icon :icon="['far', 'file']" />
                    Item Detail
                    <template v-if="store.working_item">
                        <font-awesome-icon :icon="['fas', 'angle-right']" />
                        {{ store.working_item?.note_id }}
                    </template>
                </div>
                <div class="panel-subtitle text-sm ml-1">
                    <template v-if="store.working_item">
                        {{ countTextLength(store.working_item?.note_text) }} chars
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
    <div v-if="store.has_working_item_note_text"
        class="w-full"
        v-html="renderText(store.working_item?.note_text)">
    </div>
</div>
</Panel>
</template>

<style scoped>
</style>