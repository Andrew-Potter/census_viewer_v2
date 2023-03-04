<template>
    <div style="text-align: center;">
      <b>{{ filter_title }}</b><br>
      <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText type="text" v-model="selectedOption" placeholder="Search" @click="showModal = !showModal" />
      </span>
        <Dialog :visible.sync="showModal" :modal="true" :header="filter_title" >
          <input  type="text" v-model="search_text" placeholder="Search" style="text-align:left;"/>
          <div v-for="option in filteredOptions" :key="option.id" style="text-align: left;">
            <RadioButton :id=option.id :name="option.alias" :value="option[display_field]" v-model="selectedOption"/>   
            <label :for="option.id">{{option[display_field]}}</label>
          </div>
          <br>
          <template #footer>
            <Button label="Ok" icon="pi pi-check" @click="acceptChoice" autofocus />
          </template>
        </Dialog>
    </div>
</template>

<script>
export default {
    name: 'FilterItem',
    props: {
      filter_name: String,
      filter_title: String,
      options: Array,
      display_field: String
    },
    methods:{
      acceptChoice(){
        this.showModal = false;
        var this_option = this.options.filter(o=>o[this.display_field]===this.selectedOption)[0]
        // console.log(this_option)
        this.$emit("selectedOption", {filter_name: this.filter_name, selectedOption: this_option})
      }
    },
    computed:{
      filteredOptions() {
                return this.options.filter(option => {
                    if (option){
                      if (option[this.display_field].toLowerCase().includes(this.search_text.toLowerCase())){
                          return option
                        }
                    }
      
                })
      },
      processedOption(){
        console.log("here")

          return this.options.filter(o=>o[this.display_field]===this.selectedOption)[0]

    },
    },
    
    data () {
      return {
        search_text:"",
        showModal: false,
        message:"this",
        selectedOption: null,
        filter: "",
        loading: true
      }
    },
}
</script>