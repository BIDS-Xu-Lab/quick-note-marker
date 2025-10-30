<script setup>
import { ref } from "vue";
import { useDataStore } from "../../DataStore";
import * as fs_helper from "../../utils/fs_helper";
import Papa from "papaparse";
import { useToast } from "primevue/usetoast";
const toast = useToast();

const store = useDataStore();


async function onSchemaFileChange(e) {
  // ok, let's load the schema file
  let { fh, file } = await fs_helper.fsOpenFile({
    types: [{
      description: 'JSON Files',
      accept: { 'application/json': ['.json'] }
    }],
    multiple: false,
  });

  // read the content of the file
  let content = await file.text();
  let schema = JSON.parse(content);

  store.loadSchema(fh, schema);
  store.msg('Loaded schema file');
}


async function onDatasetFileChange(e) {
  // ok, let's load the dataset file
  let { fh, file } = await fs_helper.fsOpenFile({
    types: [{
      description: 'TSV Files',
      accept: { 'text/plain': ['.tsv'] }
    }],
    multiple: false,
  });

  // console.log(e.target.files[0]);
  // let fh = e.target.files[0];
  // let f = await fs_helper.fs_read_file_system_handle(e.target.files[0]);
  // store.dataset_file = fh;

    store.loadDataset(fh, file);

}

async function onClickSaveDataset() {
  console.log('* saving dataset file ' + store.dataset_file.name);
  store.saveDatasetToFile();
}

async function onClickSaveCopy() {
  // if no items, just return 
  if (store.items.length == 0) {
    store.msg('No data to save', 'error');
    return;
  }

  console.log('* saving a copy of the dataset file ' + store.dataset_file.name);
  let content = Papa.unparse(
    store.items, { 
      delimiter: '\t' 
    }
  );

  // download this content into a new tsv file using blob
  let filename = store.dataset_file.name.replace('.tsv', '_copy.tsv');

  // use Blob to save this file
  let blob = new Blob([content], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);

  let a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  console.log('* saved to ' + filename);
  store.msg('Saved to ' + filename);
}


async function onClickClearDataset() {
  // if items are not empty, ask for confirmation
  if (store.items.length > 0) {
    let confirm = window.confirm('Are you sure to clear the dataset?');
    if (!confirm) {
      return;
    }
  }
  store.items = [];
  store.dataset_file = null;
  store.flag.has_data_unsaved = false;
  store.working_item = null;
}

async function onClickClearSchema() {
  // if schema file is not empty, ask for confirmation
  if (store.schema_file) {
    let confirm = window.confirm('Are you sure to clear the schema file?');
    if (!confirm) {
      return;
    }
  }
  store.schema = null;
  store.schema_file = null;
}

function onClickLoadSample(sample_name) {
  console.log('* loading sample dataset ' + sample_name);
  store.loadSample(sample_name);
}

function onClickHelp() {
  // open a new tab to wiki page
  window.open('https://github.com/BIDS-Xu-Lab/quick-note-marker/wiki', '_blank');
}

////////////////////////////////////////////////////////////
// functions for the sample items
////////////////////////////////////////////////////////////

const menu_sample = ref();
const toggleSampleMenu = (event) => {
    menu_sample.value.toggle(event);
};
const menu_sample_items = ref([
{
    label: 'Simple Dataset',
    icon: 'pi pi-file',
    command: () => onClickLoadSample('simple')
},
{
    label: 'Three Items',
    icon: 'pi pi-file',
    command: () => onClickLoadSample('three_items')
},
{
    label: 'With Attributes',
    icon: 'pi pi-file',
    command: () => onClickLoadSample('with_attributes')
},
]);

</script>


<template>

<div class="menu">

  <div class="menu-group">

    <div class="menu-group-box">

      <div class="flex flex-col mr-2 px-3">
        <div class="oper-item">

          <label class="file-label">
            <font-awesome-icon icon="fa-regular fa-file-lines" />
            Schema File
            <a target="_blank" href="./sample/three-items/schema.json" title="Download example schema">
              <font-awesome-icon icon="fa-solid fa-circle-info" />
            </a>
          </label>
          <div class="file-zone" 
            v-tooltip.bottom="'Load the schema file containing the data'" 
            :class="{ 'file-zone-loaded': store.schema_file }" 
            @click="onSchemaFileChange">
            <template v-if="store.schema_file">
              {{ store.schema_file.name }}
            </template>
            <template v-else>
              Load the schema file
            </template>
          </div>
        </div>
      </div>

      <Button text
          class="menu-button"
          v-tooltip.bottom="'Clear all the current schema'"
          @click="onClickClearSchema">
          <font-awesome-icon :icon="['far', 'trash-can']" class="menu-icon" />
          <span>
              Clear
          </span>
      </Button>

    </div>
    <div class="menu-group-title">
      Schema File
    </div>
  </div>



  <div class="menu-group">

    <div class="menu-group-box">

      <div class="flex flex-col mr-2 px-3">
        <div class="oper-item">

          <label class="file-label">
            <font-awesome-icon icon="fa-regular fa-file-lines" />
            Dataset File
            <a target="_blank" href="./sample/dataset.tsv" title="Download example dataset">
              <font-awesome-icon icon="fa-solid fa-circle-info" />
            </a>
          </label>
          <div class="file-zone" 
            v-tooltip.bottom="'Load the dataset file containing the data'" 
            :class="{ 'file-zone-loaded': store.dataset_file }" 
            @click="onDatasetFileChange">
            <template v-if="store.dataset_file">
              {{ store.dataset_file.name }}
            </template>
            <template v-else>
              Load the dataset file
            </template>
          </div>
        </div>
      </div>

      <Button text
          class="menu-button"
          v-tooltip.bottom="'Clear all the current dataset'"
          @click="onClickClearDataset">
          <font-awesome-icon :icon="['far', 'trash-can']" class="menu-icon" />
          <span>
              Clear
          </span>
      </Button>

    </div>
    <div class="menu-group-title">
      Dataset File
    </div>
  </div>


  <div v-if="store.dataset_file"
    class="menu-group">
      <div class="menu-group-box">
        <div v-tooltip.bottom="'Current status of the dataset file'"
          class="flex flex-col justify-center mr-2">
            <template v-if="store.flag.has_data_unsaved">
              <div class="text-3xl text-center" style="color: red;">
                <font-awesome-icon icon="fa-solid fa-times-circle" />
              </div>
              <div>
                Unsaved
              </div>
            </template>
            <template v-else-if="!store.dataset_file">
              <div class="text-3xl text-center" style="margin-bottom: 2px">
                <font-awesome-icon icon="fa-regular fa-file" />
              </div>
              <div>
                No file
              </div>
            </template>
            <template v-else>
              <div class="text-3xl text-center" style="color: green; margin-bottom: 2px">
                <font-awesome-icon icon="fa-regular fa-circle-check" />
              </div>
              <div>
                Saved
              </div>
            </template>
        </div>

        <Button text
            class="menu-button"
            v-tooltip.bottom="'Save the current results into the current dataset file [' + store.dataset_file?.name+ ']'"
            @click="onClickSaveDataset">
            <font-awesome-icon :icon="['far', 'floppy-disk']" class="menu-icon" />
            <span>
                Save
            </span>
        </Button>


        <Button text
            class="menu-button"
            v-tooltip.bottom="'Download a copy of the current results into a new dataset file'"
            @click="onClickSaveCopy">
            <font-awesome-icon :icon="['far', 'copy']" class="menu-icon" />
            <span>
                Download
            </span>
        </Button>


      </div>
      <div class="menu-group-title">
          File Operations
      </div>
  </div>



  <div class="menu-group">
      <div class="menu-group-box">
<!-- 
          <Button text
              class="menu-button"
              v-tooltip.bottom="'Load samples for demo.'"
              @click="toggleSampleMenu">
              <font-awesome-icon icon="fa-regular fa-folder-closed" class="menu-icon" />
              <span>
                  Sample Data
              </span>
          </Button> -->

          <Button text
                class="menu-button"
                aria-haspopup="true" 
                aria-controls="overlay_tmenu" 
                v-tooltip.bottom="'Load sample data for demonstration.'"
                @click="toggleSampleMenu">
                <font-awesome-icon icon="fa-solid fa-table-list" class="menu-icon" />
                <span>
                    Samples
                </span>
            </Button>
            <TieredMenu ref="menu_sample" 
                id="overlay_tmenu" 
                :model="menu_sample_items" 
                popup />


          <Button text
              class="menu-button"
              v-tooltip.bottom="'Show the detailed user manual in a new window.'"
              @click="onClickHelp()">
              <font-awesome-icon icon="fa-solid fa-question" class="menu-icon" />
              <span>
                  How-to
              </span>
          </Button>
      </div>
      <div class="menu-group-title">
          Help
      </div>
  </div>


</div>

</template>

<style scoped>
.file-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid #7f7f7f;
  border-radius: 0.5rem;
  padding: 0.2rem 2rem;
  width: 12rem;

  /* hide the long text as dots */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-zone-loaded {
  border-color: green;
  color: var(--text-color);
}
.file-label {
  font-size: 0.8rem;
}
</style>