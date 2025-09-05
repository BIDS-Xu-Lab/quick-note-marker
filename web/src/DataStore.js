import { defineStore } from 'pinia';
import { useToast } from "primevue/usetoast";
import * as toolbox from './utils/toolbox';
import Papa from "papaparse";
import router from './router';
import * as fs_helper from './utils/fs_helper';
import { pubmed } from './utils/pubmed';

export const useDataStore = defineStore('jarvis', {
state: () => ({
    current_page: '',
    config: {
        keywords: [
            {token: "data", bgcolor:"#FFA704"},
        ],

        // list of AI models
        // each model has an id, name, enabled flag, and api_key
        ai_models: {
            // OK, the settings of those models should be able to 
            // import from local file, a JSON object
            // and some basic information maybe also can be edit?
            // but I don't want to everytime to load the JSON manually
            // so it can also be saved in to the lcoalstorage for quick access
            // 
            openai: {
                "id": "openai",
                // service_type is the type of the AI service
                // it can be openai, claude, etc.
                // as not all AI services provide the same API interface
                // we need to know which service is used
                // for ollama, vllm, 
                "service_type": "openai",
                "name": "OpenAI 4o",
                "model_name": "gpt-4o",
                "endpoint": "https://api.openai.com/v1/chat/completions",
                "enabled": true,
                "api_key": "",
                "temperature": 0,
                "system_prompt": "You are a helpful assistant.",
            },
            // claude: {
            //     "id": "claude",
            //     "service_type": "claude",
            //     "name": "Claude 3.5 Haiku",
            //     "model_name": "claude-3-5-haiku-20241022",
            //     "endpoint": "https://api.anthropic.com/v1/messages",
            //     "enabled": true,
            //     "api_key": "",
            //     "temperature": 0,
            //     "system_prompt": "You are a helpful assistant.",
            // },
        },

        features: {
            auto_save: {
                enabled: false,
            },

            auto_highlight: {
                enabled: true,
            },
        }
    },
    // global variables for all components
    /*
    {
        "note_id": 36361634,
        "note_text": "The Role of Telomerase in Breast Cancer's Response to Therapy.",
    }
     */
    items: [],

    // the schema for the marking
    schema: null,

    // the item which the user is working on
    working_item: null,

    // dataset file for review
    dataset_file: null,

    // files for visualization
    vis_files: [],
    current_vis_file: null,

    // translation
    // dictionary of paper and tranlsated texts
    translation: {},

    // prompt
    prompt_file: null,
    llm_prompt_template: null,

    flag: {
        enable_highlight: true,
        is_fetching_metadata: false,
        is_translating: false,
        is_saving_dataset_file: false,
        has_data_unsaved: false,
        show_setting_panel: false,
    },

    filter_keyword: '',

    status: {
        error: null,
    },

    toast: useToast(),

    // for the router
    router: router,

    // for the pubmed
    pubmed: pubmed,
}),
getters: {
    filterred_items(state) {
        if (state.filter_keyword == '') {
            return state.items;
        }
        return state.items.filter(item => {
            return item.note_id.toLowerCase().includes(state.filter_keyword.toLowerCase()) ||
                item.decision.toLowerCase().includes(state.filter_keyword.toLowerCase()) ||
                item.decision_by.toLowerCase().includes(state.filter_keyword.toLowerCase());
        });
    },

    keywords_list(state) {
        return state.config.keywords.join("\n");
    },

    has_working_item_note_text(state) {
        if (!state.working_item) {
            return false;
        }
        if (!state.working_item.hasOwnProperty('note_text')) {
            return false;
        }
        if (state.working_item.note_text == null) {
            return false;
        }
        return true;
    },
},  
actions: {
    gotoPage(page) {
        this.current_page = page;
        this.router.push("/" + page);
    },


    ///////////////////////////////////////////////////////
    // Working Item
    ///////////////////////////////////////////////////////

    setWorkingItemAnnotationValue(key, value) {
        if (!this.working_item) {
            return;
        }
        this.working_item[key] = value;
        this.working_item.updated_at = toolbox.now();
        this.flag.has_data_unsaved = true;
    },

    doesWorkingItemHaveAnnotationValue(key, value) {
        if (!this.working_item?.hasOwnProperty(key)) {
            return false;
        }
        if (this.working_item[key] == value) {
            return true;
        }
        return false;
    },


    ///////////////////////////////////////////////////////
    // Working Item
    ///////////////////////////////////////////////////////

    hasMetadata: function(item) {
        if (!item.hasOwnProperty('title')) {
            return false;
        }
        if (item.note_text == null) {
            return false;
        }
        if (item.note_text == '') {
            return false;
        }
        return true;
    },

    formatTsvRow: function(row) {
        // basic columns
        let attrs = [
            'note_id',
            'note_text',
            'updated_at',
        ];

        // add the annotation values
        for (let tag of this.schema.dtags) {
            attrs.push(tag.save_as_key);
        }

        for (let attr of attrs) {
            if (!row.hasOwnProperty(attr)) {
                row[attr] = null;
            }
        }

        return row;
    },


    // highlight keywords in text
    // the given keywords are a list of strings
    highlight: function(text, keywords) {
        // convert keywords to a dictionary
        let kws = [];
        let kwd = {};
        for (let i in keywords) {
            let kw = keywords[i];
            
            // if kw is a string, convert it to an object
            if (typeof kw === 'string') {
                kws.push(kw);
                kwd[kw] = 'yellow';
            } else {
                // put the token to lowercase
                kws.push(kw.token);
                kwd[kw.token.toLowerCase()] = kw.bgcolor;
            }
        }
        let re = new RegExp(kws.join("|"), "gi");
        return text.replace(re, (matched) => {
            let kw = matched.toLowerCase();
            let clr = kwd[kw];
            return `<mark style="background: ${clr};">${matched}</mark>`;
            // return "<mark>" + matched + "</mark>";
        });
    },


    setPromptByText: function(text) {
        this.llm_prompt_template = text;
    },

    savePromptToFile: async function() {
        // write back to the file
        await fs_helper.fsWriteFile(
            this.prompt_file, 
            this.llm_prompt_template
        );
    },

    saveDatasetToFile: async function () {
        // if no dataset_file, just return
        if (!this.dataset_file) {
            this.msg('Please load the dataset file first', 'error');
            return;
        }

        // write back to the file
        let content = Papa.unparse(
            this.items, 
            {
                delimiter: '\t'
            }
        );

        // write back to the tsv file
        await fs_helper.fsWriteFile(
            this.dataset_file,
            content
        );

        this.flag.has_data_unsaved = false;
        console.log('* saved to ' + this.dataset_file.name);
        this.msg('Saved to ' + this.dataset_file.name);
    },

    ///////////////////////////////////////////////////////
    // functions for the settings
    ///////////////////////////////////////////////////////

    updateSettingsByJSON: function(json) {
        // copy the items from json to store.config
        for (let key in this.config) {
            if (json.hasOwnProperty(key)) {
                // special rule for ai models
                if (key == 'ai_models') {
                    // for this case, search all settings from the json
                    for (let model_id in json[key]) {
                        if (this.config[key].hasOwnProperty(model_id)) {
                            for (let model_attribute in json[key][model_id]) {
                                this.config[key][model_id][model_attribute] = json[key][model_id][model_attribute];
                            }
                        } else {
                            // just copy the whole content if not found
                            // which means the localStorage has custmoized settings
                            this.config[key][model_id] = json[key][model_id];
                        }
                    }
                } else {
                    this.config[key] = json[key];
                }
            }
        }
    },

    hasKeywordInSettings: function(keyword) {
        for (let kw of this.config.keywords) {
            if (typeof kw === 'string') {
                if (kw == keyword) {
                    return true;
                }
            } else if (kw.token == keyword) {
                return true;
            }
        }
        return false;
    },

    removeKeywordFromSettings: function(index) {
        this.config.keywords.splice(index, 1);
    },

    saveSettingsToLocalStorage: function() {
        localStorage.setItem(
            "config",
            JSON.stringify(this.config)
        );
        console.log('* saved config to local storage');
    },

    loadSettingsFromLocalStorage: function() {
        // just load the object from localstorage
        let x = localStorage.getItem('config');

        if (x == null) {
            console.log('* not found config from local');
            return;
        }

        // parse
        let cfg = JSON.parse(x);
        console.log('* local storage config:', cfg);

        this.updateSettingsByJSON(cfg);

        console.log('* loaded config from local storage');
    },

    clearSettingsFromLocalStorage: function() {
        localStorage.removeItem('config');

        // reload the page
        window.location.reload();
    },

    ///////////////////////////////////////////////////////
    // functions for the dataset
    ///////////////////////////////////////////////////////

    // async function to load the taxonomy file
    loadSampleDataset: async function(sample_name) {
        // as this will overwrite the current data
        // ask the user to confirm
        if (!confirm('Loading sample dataset will overwrite the current dataset, are you sure?')) {
            return;
        }
        
        // load the schema file
        this.schema_file = {name: `${sample_name}_schema.json`};
        let req = await fetch(`./sample/${sample_name}/schema.json`);
        let txt = await req.text();
        let schema = JSON.parse(txt);
        this.schema = schema;

        // load the sample dataset
        this.dataset_file = {name: `${sample_name}_dataset.tsv`};
        this.items = [];
        Papa.parse(
            `./sample/${sample_name}/dataset.tsv`, {
            download: true,
            skipEmptyLines: true,
            delimiter: '\t',
            header: true,
            dynamicTyping: true,
            step: (row) => {
                let formatted_row = this.formatTsvRow(row.data);
                this.items.push(formatted_row);
            }
        });
    },

    ///////////////////////////////////////////////////////
    // functions for the visualization files
    ///////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////
    // other functions
    ///////////////////////////////////////////////////////

    msg: function(text, type='info') {
        this.toast.add({
            severity: type, 
            summary: 'Info', 
            detail: text,
            life: 3000
        });
    },
}
});